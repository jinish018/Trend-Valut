from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Collection, CollectionItem
from .serializers import CollectionSerializer, CollectionListSerializer
from dashboard.services import CoinGeckoService
import logging

logger = logging.getLogger(__name__)
coingecko_service = CoinGeckoService()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_collections(request):
    """Get all collections"""
    try:
        collections = Collection.objects.all()
        serializer = CollectionListSerializer(collections, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching collections: {str(e)}")
        return Response({'error': 'Unable to fetch collections'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_collection_details(request, collection_id):
    """Get detailed information about a collection with live coin data"""
    try:
        collection = get_object_or_404(Collection, id=collection_id)
        
        # Get collection items
        items = collection.items.all()
        
        # Prepare response data
        collection_data = {
            'id': collection.id,
            'name': collection.name,
            'description': collection.description,
            'is_featured': collection.is_featured,
            'items_count': items.count(),
            'created_at': collection.created_at,
            'updated_at': collection.updated_at,
            'items': []
        }
        
        # Get live data for all coins in the collection
        if items:
            coin_ids = [item.coin_id for item in items]
            
            # Make API request to CoinGecko
            try:
                url = f"{coingecko_service.base_url}/coins/markets"
                params = {
                    'vs_currency': 'usd',
                    'ids': ','.join(coin_ids),
                    'order': 'market_cap_desc',
                    'sparkline': 'false',
                    'price_change_percentage': '24h,7d,30d',
                    'per_page': 250,
                    'page': 1
                }
                
                live_data_list = coingecko_service.make_request(url, params)
                
                if live_data_list:
                    live_data_dict = {coin['id']: coin for coin in live_data_list}
                    logger.info(f"Fetched live data for {len(live_data_dict)} coins")
                else:
                    live_data_dict = {}
                    logger.warning("No live data received from CoinGecko")
                
            except Exception as api_error:
                logger.error(f"CoinGecko API error: {str(api_error)}")
                live_data_dict = {}
            
            # Add items with live data
            for item in items:
                live_data = live_data_dict.get(item.coin_id, {})
                collection_data['items'].append({
                    'id': item.id,
                    'coin_id': item.coin_id,
                    'coin_name': item.coin_name,
                    'coin_symbol': item.coin_symbol,
                    'order_priority': item.order_priority,
                    'added_at': item.added_at,
                    'live_data': live_data
                })
        
        return Response(collection_data)
        
    except Exception as e:
        logger.error(f"Error fetching collection details: {str(e)}")
        return Response({'error': 'Unable to fetch collection details'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_default_collections(request):
    """Create default collections with popular coins"""
    try:
        collections_data = [
            {
                'name': 'Top Market Cap',
                'description': 'Top cryptocurrencies by market capitalization',
                'is_featured': True,
                'order_priority': 100,
                'coins': [
                    {'id': 'bitcoin', 'name': 'Bitcoin', 'symbol': 'BTC', 'priority': 10},
                    {'id': 'ethereum', 'name': 'Ethereum', 'symbol': 'ETH', 'priority': 9},
                    {'id': 'tether', 'name': 'Tether', 'symbol': 'USDT', 'priority': 8},
                    {'id': 'binancecoin', 'name': 'BNB', 'symbol': 'BNB', 'priority': 7},
                    {'id': 'solana', 'name': 'Solana', 'symbol': 'SOL', 'priority': 6},
                ]
            },
            {
                'name': 'DeFi Tokens',
                'description': 'Popular Decentralized Finance tokens',
                'is_featured': True,
                'order_priority': 90,
                'coins': [
                    {'id': 'uniswap', 'name': 'Uniswap', 'symbol': 'UNI', 'priority': 10},
                    {'id': 'aave', 'name': 'Aave', 'symbol': 'AAVE', 'priority': 9},
                    {'id': 'compound-governance-token', 'name': 'Compound', 'symbol': 'COMP', 'priority': 8},
                    {'id': 'maker', 'name': 'Maker', 'symbol': 'MKR', 'priority': 7},
                    {'id': 'sushi', 'name': 'SushiSwap', 'symbol': 'SUSHI', 'priority': 6},
                ]
            },
            {
                'name': 'Layer 1 Blockchains',
                'description': 'Major Layer 1 blockchain platforms',
                'is_featured': True,
                'order_priority': 80,
                'coins': [
                    {'id': 'ethereum', 'name': 'Ethereum', 'symbol': 'ETH', 'priority': 10},
                    {'id': 'cardano', 'name': 'Cardano', 'symbol': 'ADA', 'priority': 9},
                    {'id': 'avalanche-2', 'name': 'Avalanche', 'symbol': 'AVAX', 'priority': 8},
                    {'id': 'polkadot', 'name': 'Polkadot', 'symbol': 'DOT', 'priority': 7},
                    {'id': 'polygon', 'name': 'Polygon', 'symbol': 'MATIC', 'priority': 6},
                ]
            },
            {
                'name': 'Meme Coins',
                'description': 'Popular meme and community-driven cryptocurrencies',
                'is_featured': False,
                'order_priority': 70,
                'coins': [
                    {'id': 'dogecoin', 'name': 'Dogecoin', 'symbol': 'DOGE', 'priority': 10},
                    {'id': 'shiba-inu', 'name': 'Shiba Inu', 'symbol': 'SHIB', 'priority': 9},
                    {'id': 'pepe', 'name': 'Pepe', 'symbol': 'PEPE', 'priority': 8},
                    {'id': 'floki', 'name': 'Floki Inu', 'symbol': 'FLOKI', 'priority': 7},
                ]
            },
            {
                'name': 'AI & Big Data',
                'description': 'Cryptocurrencies focused on artificial intelligence and big data',
                'is_featured': False,
                'order_priority': 60,
                'coins': [
                    {'id': 'fetch-ai', 'name': 'Fetch.ai', 'symbol': 'FET', 'priority': 10},
                    {'id': 'singularitynet', 'name': 'SingularityNET', 'symbol': 'AGIX', 'priority': 9},
                    {'id': 'ocean-protocol', 'name': 'Ocean Protocol', 'symbol': 'OCEAN', 'priority': 8},
                    {'id': 'the-graph', 'name': 'The Graph', 'symbol': 'GRT', 'priority': 7},
                ]
            }
        ]
        
        created_collections = []
        
        for collection_data in collections_data:
            collection, created = Collection.objects.get_or_create(
                name=collection_data['name'],
                defaults={
                    'description': collection_data['description'],
                    'is_featured': collection_data['is_featured'],
                    'order_priority': collection_data['order_priority']
                }
            )
            
            if created:
                # Add coins to collection
                for coin_data in collection_data['coins']:
                    CollectionItem.objects.get_or_create(
                        collection=collection,
                        coin_id=coin_data['id'],
                        defaults={
                            'coin_name': coin_data['name'],
                            'coin_symbol': coin_data['symbol'],
                            'order_priority': coin_data['priority']
                        }
                    )
            
            created_collections.append(collection)
        
        serializer = CollectionListSerializer(created_collections, many=True)
        return Response({
            'message': f'{len(created_collections)} collections created/updated successfully',
            'collections': serializer.data
        })
    except Exception as e:
        logger.error(f"Error creating default collections: {str(e)}")
        return Response({'error': 'Unable to create default collections'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_featured_collections(request):
    """Get featured collections only"""
    try:
        collections = Collection.objects.filter(is_featured=True)
        serializer = CollectionListSerializer(collections, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching featured collections: {str(e)}")
        return Response({'error': 'Unable to fetch featured collections'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)
