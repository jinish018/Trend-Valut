import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class CoinGeckoService:
    def __init__(self):
        self.base_url = settings.COINGECKO_BASE_URL
        self.api_key = getattr(settings, 'COINGECKO_API_KEY', None)

    def get_headers(self):
        headers = {'Content-Type': 'application/json'}
        if self.api_key and self.api_key != 'your-coingecko-api-key':
            headers['x-cg-demo-api-key'] = self.api_key
        return headers

    def make_request(self, url, params=None):
        """Make a request to CoinGecko API with error handling"""
        try:
            headers = self.get_headers()
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            logger.info(f"CoinGecko API Request: {response.url}")
            logger.info(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Received {len(data) if isinstance(data, list) else 'object'} items")
                return data
            else:
                logger.error(f"API Error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            return None

    def get_trending_coins(self):
        """Get trending coins"""
        url = f"{self.base_url}/search/trending"
        return self.make_request(url)

    def get_all_coins(self, page=1, per_page=100):
        """Get all coins with pagination"""
        url = f"{self.base_url}/coins/markets"
        params = {
            'vs_currency': 'usd',
            'order': 'market_cap_desc',
            'per_page': min(per_page, 250),  # CoinGecko limit
            'page': page,
            'sparkline': 'true',
            'price_change_percentage': '24h,7d,30d'
        }
        return self.make_request(url, params) or []

    def get_top_gainers_losers(self):
        """Get top gainers and losers"""
        url = f"{self.base_url}/coins/markets"
        params = {
            'vs_currency': 'usd',
            'order': 'price_change_percentage_24h_desc',
            'per_page': 100,
            'page': 1,
            'sparkline': 'false',
            'price_change_percentage': '24h'
        }
        data = self.make_request(url, params) or []
        
        # Filter and sort
        gainers = [coin for coin in data if coin.get('price_change_percentage_24h', 0) > 0][:20]
        all_coins_sorted = sorted(data, key=lambda x: x.get('price_change_percentage_24h', 0))
        losers = [coin for coin in all_coins_sorted if coin.get('price_change_percentage_24h', 0) < 0][:20]
        
        return {'gainers': gainers, 'losers': losers}

    def get_coin_details(self, coin_id):
        """Get detailed information about a specific coin"""
        url = f"{self.base_url}/coins/{coin_id}"
        params = {
            'localization': 'false',
            'tickers': 'false',
            'market_data': 'true',
            'community_data': 'true',
            'developer_data': 'false',
            'sparkline': 'true'
        }
        return self.make_request(url, params)

    def get_coin_history(self, coin_id, days=30):
        """Get price history for a coin"""
        url = f"{self.base_url}/coins/{coin_id}/market_chart"
        params = {
            'vs_currency': 'usd',
            'days': days,
            'interval': 'daily' if days > 1 else 'hourly'
        }
        return self.make_request(url, params)

    def get_global_data(self):
        """Get global cryptocurrency market data"""
        url = f"{self.base_url}/global"
        return self.make_request(url)

    def search_coins(self, query):
        """Search for coins"""
        url = f"{self.base_url}/search"
        params = {'query': query}
        return self.make_request(url, params)
