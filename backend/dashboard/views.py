from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from .services import CoinGeckoService
import logging

logger = logging.getLogger(__name__)
coingecko_service = CoinGeckoService()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_highlights(request):
    """Get highlights including trending coins, gainers, and losers"""
    try:
        # Try to get from cache first
        cache_key = 'dashboard_highlights'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)

        # Get fresh data
        trending = coingecko_service.get_trending_coins()
        gainers_losers = coingecko_service.get_top_gainers_losers()
        global_data = coingecko_service.get_global_data()
        
        highlights = {
            'trending': trending.get('coins', [])[:10] if trending else [],
            'top_gainers': gainers_losers.get('gainers', [])[:10],
            'top_losers': gainers_losers.get('losers', [])[:10],
            'global_data': global_data.get('data', {}) if global_data else {},
            'last_updated': trending.get('timestamp') if trending else None
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, highlights, 300)
        
        return Response(highlights)
    except Exception as e:
        logger.error(f"Error fetching highlights: {str(e)}")
        return Response({'error': 'Unable to fetch market highlights'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_coins(request):
    """Get all coins with pagination and search"""
    try:
        page = int(request.GET.get('page', 1))
        per_page = min(int(request.GET.get('per_page', 50)), 250)
        search = request.GET.get('search', '').strip()
        
        if search:
            # If search query provided, use search endpoint
            search_results = coingecko_service.search_coins(search)
            if search_results and search_results.get('coins'):
                # Get detailed data for search results
                coin_ids = [coin['id'] for coin in search_results['coins'][:per_page]]
                if coin_ids:
                    # Get market data for searched coins
                    url = f"{coingecko_service.base_url}/coins/markets"
                    params = {
                        'vs_currency': 'usd',
                        'ids': ','.join(coin_ids),
                        'order': 'market_cap_desc',
                        'sparkline': 'true',
                        'price_change_percentage': '24h,7d'
                    }
                    coins = coingecko_service.make_request(url, params) or []
                else:
                    coins = []
            else:
                coins = []
        else:
            # Regular pagination
            coins = coingecko_service.get_all_coins(page=page, per_page=per_page)
        
        return Response({
            'coins': coins,
            'page': page,
            'per_page': per_page,
            'has_search': bool(search)
        })
    except Exception as e:
        logger.error(f"Error fetching coins: {str(e)}")
        return Response({'error': 'Unable to fetch coins data'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_coin_details(request, coin_id):
    """Get detailed information about a specific coin"""
    try:
        coin_details = coingecko_service.get_coin_details(coin_id)
        if coin_details:
            return Response(coin_details)
        return Response({'error': 'Coin not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching coin details for {coin_id}: {str(e)}")
        return Response({'error': 'Unable to fetch coin details'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_coin_history(request, coin_id):
    """Get price history for a coin"""
    try:
        days = int(request.GET.get('days', 30))
        days = min(max(days, 1), 365)  # Limit between 1 and 365 days
        
        history = coingecko_service.get_coin_history(coin_id, days)
        if history:
            return Response({
                'coin_id': coin_id,
                'days': days,
                'prices': history.get('prices', []),
                'market_caps': history.get('market_caps', []),
                'total_volumes': history.get('total_volumes', [])
            })
        return Response({'error': 'History not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching coin history for {coin_id}: {str(e)}")
        return Response({'error': 'Unable to fetch coin history'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_global_stats(request):
    """Get global cryptocurrency market statistics"""
    try:
        global_data = coingecko_service.get_global_data()
        if global_data and global_data.get('data'):
            return Response(global_data['data'])
        return Response({'error': 'Global data not available'}, 
                       status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching global stats: {str(e)}")
        return Response({'error': 'Unable to fetch global statistics'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_coins(request):
    """Search for cryptocurrencies"""
    try:
        query = request.GET.get('q', '').strip()
        if not query:
            return Response({'error': 'Search query is required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        results = coingecko_service.search_coins(query)
        if results:
            return Response({
                'query': query,
                'coins': results.get('coins', [])[:20],
                'exchanges': results.get('exchanges', [])[:10],
                'categories': results.get('categories', [])[:10]
            })
        return Response({'coins': [], 'exchanges': [], 'categories': []})
    except Exception as e:
        logger.error(f"Error searching coins: {str(e)}")
        return Response({'error': 'Unable to search coins'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)
