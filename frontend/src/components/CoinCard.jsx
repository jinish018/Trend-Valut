import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CoinCard = ({ coin, showSparkline = false }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatPercentage = (percentage) => {
    if (!percentage) return 'N/A';
    const formatted = percentage.toFixed(2);
    return `${percentage > 0 ? '+' : ''}${formatted}%`;
  };

  return (
    <Card className="h-100 card-hover border-0 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex align-items-center mb-3">
          <img 
            src={coin.image || coin.thumb || coin.large} 
            alt={coin.name}
            className="coin-image me-3"
            style={{ width: '40px', height: '40px' }}
          />
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold">{coin.name}</h6>
            <small className="text-muted text-uppercase">{coin.symbol}</small>
          </div>
          {coin.market_cap_rank && (
            <Badge bg="light" text="dark" className="fs-6">
              #{coin.market_cap_rank}
            </Badge>
          )}
        </div>

        <div className="mb-2">
          <h5 className="mb-1 fw-bold text-primary">
            {coin.current_price ? formatPrice(coin.current_price) : 'N/A'}
          </h5>
          {coin.price_change_percentage_24h !== undefined && (
            <Badge 
              bg={coin.price_change_percentage_24h >= 0 ? 'success' : 'danger'}
              className="fs-6"
            >
              {formatPercentage(coin.price_change_percentage_24h)}
            </Badge>
          )}
        </div>

        {showSparkline && coin.sparkline_in_7d?.price && (
          <div className="mb-3">
            <canvas 
              width="100" 
              height="30" 
              style={{ width: '100%', height: '30px' }}
            />
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <Link 
            to={`/coin/${coin.id}`} 
            className="btn btn-outline-primary btn-sm"
          >
            View Details
          </Link>
          {coin.market_cap && (
            <small className="text-muted">
              MCap: ${(coin.market_cap / 1e9).toFixed(2)}B
            </small>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CoinCard;
