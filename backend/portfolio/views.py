from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Portfolio, PortfolioItem, Transaction
from .serializers import (
    PortfolioSerializer, 
    PortfolioItemSerializer,
    AddPortfolioItemSerializer,
    UpdatePortfolioItemSerializer,
    TransactionSerializer
)
from dashboard.services import CoinGeckoService
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)
coingecko_service = CoinGeckoService()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_portfolio(request):
    """Get user's portfolio"""
    try:
        portfolio, created = Portfolio.objects.get_or_create(
            user=request.user,
            defaults={'name': f"{request.user.username}'s Portfolio"}
        )
        
        # Update current prices for all items
        update_portfolio_prices(portfolio)
        
        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching portfolio: {str(e)}")
        return Response({'error': 'Unable to fetch portfolio'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_portfolio_item(request):
    """Add a new item to portfolio"""
    try:
        serializer = AddPortfolioItemSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            portfolio, _ = Portfolio.objects.get_or_create(
                user=request.user,
                defaults={'name': f"{request.user.username}'s Portfolio"}
            )
            
            # Check if item already exists
            portfolio_item, created = PortfolioItem.objects.get_or_create(
                portfolio=portfolio,
                coin_id=data['coin_id'],
                defaults={
                    'coin_name': data['coin_name'],
                    'coin_symbol': data['coin_symbol'],
                    'quantity': data['quantity'],
                    'average_buy_price': data['buy_price'],
                    'notes': data.get('notes', '')
                }
            )
            
            if not created:
                # Update existing item with new average price
                total_quantity = portfolio_item.quantity + data['quantity']
                total_value = (portfolio_item.quantity * portfolio_item.average_buy_price) + \
                             (data['quantity'] * data['buy_price'])
                new_avg_price = total_value / total_quantity
                
                portfolio_item.quantity = total_quantity
                portfolio_item.average_buy_price = new_avg_price
                portfolio_item.save()
            
            # Create transaction record
            Transaction.objects.create(
                portfolio_item=portfolio_item,
                transaction_type='buy',
                quantity=data['quantity'],
                price=data['buy_price'],
                total_amount=data['quantity'] * data['buy_price'],
                fee=data.get('fee', 0),
                exchange=data.get('exchange', ''),
                transaction_date=data['transaction_date'],
                notes=data.get('notes', '')
            )
            
            # Update current price
            update_item_price(portfolio_item)
            
            serializer = PortfolioItemSerializer(portfolio_item)
            return Response({
                'message': 'Item added to portfolio successfully',
                'item': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error adding portfolio item: {str(e)}")
        return Response({'error': 'Unable to add item to portfolio'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_portfolio_item(request, item_id):
    """Update a portfolio item"""
    try:
        portfolio_item = get_object_or_404(
            PortfolioItem, 
            id=item_id, 
            portfolio__user=request.user
        )
        
        serializer = UpdatePortfolioItemSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            if 'quantity' in data:
                portfolio_item.quantity = data['quantity']
            if 'average_buy_price' in data:
                portfolio_item.average_buy_price = data['average_buy_price']
            if 'notes' in data:
                portfolio_item.notes = data['notes']
            
            portfolio_item.save()
            
            serializer = PortfolioItemSerializer(portfolio_item)
            return Response({
                'message': 'Portfolio item updated successfully',
                'item': serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error updating portfolio item: {str(e)}")
        return Response({'error': 'Unable to update portfolio item'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_portfolio_item(request, item_id):
    """Delete a portfolio item"""
    try:
        portfolio_item = get_object_or_404(
            PortfolioItem, 
            id=item_id, 
            portfolio__user=request.user
        )
        
        portfolio_item.delete()
        return Response({'message': 'Portfolio item deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting portfolio item: {str(e)}")
        return Response({'error': 'Unable to delete portfolio item'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_portfolio_performance(request):
    """Get portfolio performance analytics"""
    try:
        portfolio = get_object_or_404(Portfolio, user=request.user)
        
        # Update prices first
        update_portfolio_prices(portfolio)
        
        # Calculate performance metrics
        items = portfolio.items.all()
        total_value = sum(item.current_value for item in items)
        total_invested = sum(item.total_invested for item in items)
        
        # Asset allocation
        asset_allocation = []
        for item in items:
            if total_value > 0:
                percentage = (item.current_value / total_value) * 100
                asset_allocation.append({
                    'coin_id': item.coin_id,
                    'coin_name': item.coin_name,
                    'coin_symbol': item.coin_symbol,
                    'value': float(item.current_value),
                    'percentage': round(percentage, 2)
                })
        
        # Top performers
        top_gainers = sorted(
            [item for item in items if item.profit_loss > 0],
            key=lambda x: x.profit_loss_percentage,
            reverse=True
        )[:5]
        
        top_losers = sorted(
            [item for item in items if item.profit_loss < 0],
            key=lambda x: x.profit_loss_percentage
        )[:5]
        
        performance_data = {
            'total_value': float(total_value),
            'total_invested': float(total_invested),
            'profit_loss': float(total_value - total_invested),
            'profit_loss_percentage': portfolio.profit_loss_percentage,
            'asset_allocation': asset_allocation,
            'top_gainers': PortfolioItemSerializer(top_gainers, many=True).data,
            'top_losers': PortfolioItemSerializer(top_losers, many=True).data,
            'total_assets': items.count()
        }
        
        return Response(performance_data)
    except Exception as e:
        logger.error(f"Error fetching portfolio performance: {str(e)}")
        return Response({'error': 'Unable to fetch portfolio performance'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def update_portfolio_prices(portfolio):
    """Update current prices for all items in portfolio"""
    for item in portfolio.items.all():
        update_item_price(item)

def update_item_price(portfolio_item):
    """Update current price for a portfolio item"""
    try:
        coin_data = coingecko_service.get_coin_details(portfolio_item.coin_id)
        if coin_data and coin_data.get('market_data'):
            current_price = coin_data['market_data'].get('current_price', {}).get('usd', 0)
            if current_price:
                portfolio_item.current_price = Decimal(str(current_price))
                portfolio_item.save(update_fields=['current_price', 'last_updated'])
    except Exception as e:
        logger.error(f"Error updating price for {portfolio_item.coin_id}: {str(e)}")
