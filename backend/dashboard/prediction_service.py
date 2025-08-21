import requests
import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, timedelta
import logging
import warnings

# Suppress Prophet warnings
warnings.filterwarnings('ignore')
logging.getLogger('prophet').setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

class CryptoPredictionService:
    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
        
    def get_historical_data(self, coin_id, days=90):
        """Get historical price data for a coin"""
        try:
            url = f"{self.base_url}/coins/{coin_id}/market_chart"
            params = {
                'vs_currency': 'usd',
                'days': days,
                'interval': 'daily'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Convert to DataFrame for Prophet (requires 'ds' and 'y' columns)
            prices = data['prices']
            df = pd.DataFrame(prices, columns=['timestamp', 'price'])
            df['ds'] = pd.to_datetime(df['timestamp'], unit='ms')
            df['y'] = df['price']
            df = df[['ds', 'y']].copy()
            
            return df
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {coin_id}: {str(e)}")
            return None
    
    def predict_price(self, coin_id, days_ahead=7):
        """Predict future price for a coin using Prophet"""
        try:
            # Get historical data (more data for better predictions)
            df = self.get_historical_data(coin_id, days=90)
            if df is None or len(df) < 30:
                return None
                
            # Initialize and fit Prophet model
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=False,
                changepoint_prior_scale=0.05,  # Controls flexibility
                seasonality_prior_scale=10.0,
                interval_width=0.8
            )
            
            # Fit the model
            model.fit(df)
            
            # Create future dataframe
            future = model.make_future_dataframe(periods=days_ahead)
            forecast = model.predict(future)
            
            # Get current and predicted prices
            current_price = df['y'].iloc[-1]
            future_predictions = []
            
            # Extract predictions for future days only
            for i in range(1, days_ahead + 1):
                pred_idx = len(df) + i - 1
                predicted_price = max(forecast['yhat'].iloc[pred_idx], 0)
                lower_bound = max(forecast['yhat_lower'].iloc[pred_idx], 0)
                upper_bound = max(forecast['yhat_upper'].iloc[pred_idx], 0)
                
                future_predictions.append({
                    'day': i,
                    'predicted_price': predicted_price,
                    'lower_bound': lower_bound,
                    'upper_bound': upper_bound,
                    'date': (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
                })
            
            # Calculate trend and metrics
            final_price = future_predictions[-1]['predicted_price']
            price_change_percent = ((final_price - current_price) / current_price) * 100
            
            # More nuanced trend classification
            if price_change_percent > 5:
                trend = "BULLISH"
            elif price_change_percent < -5:
                trend = "BEARISH"
            else:
                trend = "NEUTRAL"
            
            # Calculate confidence based on prediction interval width
            avg_interval_width = np.mean([
                pred['upper_bound'] - pred['lower_bound'] 
                for pred in future_predictions
            ])
            relative_uncertainty = avg_interval_width / current_price
            confidence = max(50, min(95, 90 - (relative_uncertainty * 100)))
            
            # Simple profit/loss calculation (assuming $1000 investment)
            investment_amount = 1000
            potential_profit_loss = (price_change_percent / 100) * investment_amount
            
            # Calculate volatility from recent data
            recent_prices = df['y'].tail(14)
            volatility = recent_prices.std() / recent_prices.mean() * 100
            
            return {
                'coin_id': coin_id,
                'current_price': current_price,
                'predicted_price': final_price,
                'price_change_percent': price_change_percent,
                'trend': trend,
                'confidence': round(confidence, 1),
                'potential_profit_loss': potential_profit_loss,
                'investment_amount': investment_amount,
                'predictions': future_predictions,
                'volatility': round(volatility, 2),
                'model_accuracy': 'Prophet Time Series Forecasting',
                'disclaimer': 'This prediction uses advanced time-series analysis but is for educational purposes only. Not financial advice.'
            }
            
        except Exception as e:
            logger.error(f"Error predicting price for {coin_id}: {str(e)}")
            return None
