import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState({
    trending: [],
    top_gainers: [],
    top_losers: [],
    global_data: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const response = await axios.get('/api/dashboard/highlights/');
      setHighlights(response.data);
    } catch (error) {
      console.error('Error fetching highlights:', error);
      setError('Unable to fetch market data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatPercentage = (percentage) => {
    if (!percentage && percentage !== 0) return 'N/A';
    const formatted = Math.abs(percentage).toFixed(2);
    return `${percentage >= 0 ? '+' : '-'}${formatted}%`;
  };

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  if (loading) return <LoadingSpinner message="Loading market data..." />;

  return (
    <Container fluid className="px-3 px-md-4">
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1 className="h2 mb-2">
                Welcome back, {user?.first_name || user?.username}! 
                <FontAwesomeIcon icon="hand-wave" className="ms-2 text-warning" />
              </h1>
              <p className="text-muted mb-0">
                Here's your cryptocurrency market overview for today
              </p>
            </div>
            <div className="d-flex gap-2 mt-3 mt-md-0">
              <Button as={Link} to="/portfolio" variant="primary" size="sm">
                <FontAwesomeIcon icon="briefcase" className="me-2" />
                View Portfolio
              </Button>
              <Button as={Link} to="/all" variant="outline-primary" size="sm">
                <FontAwesomeIcon icon="coins" className="me-2" />
                Browse All Coins
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <div className="alert alert-danger mb-4">
          <FontAwesomeIcon icon="exclamation-triangle" className="me-2" />
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-3"
            onClick={fetchHighlights}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Global Market Stats */}
      {highlights.global_data && Object.keys(highlights.global_data).length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="mb-3">
                  <FontAwesomeIcon icon="globe" className="me-2 text-primary" />
                  Global Market Overview
                </h5>
                <Row className="text-center">
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="h4 mb-1 text-primary">
                      {highlights.global_data.active_cryptocurrencies?.toLocaleString() || 'N/A'}
                    </div>
                    <small className="text-muted">Active Cryptocurrencies</small>
                  </Col>
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="h4 mb-1 text-success">
                      {formatMarketCap(highlights.global_data.total_market_cap?.usd)}
                    </div>
                    <small className="text-muted">Total Market Cap</small>
                  </Col>
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="h4 mb-1 text-info">
                      {formatMarketCap(highlights.global_data.total_volume?.usd)}
                    </div>
                    <small className="text-muted">24h Trading Volume</small>
                  </Col>
                  <Col md={3}>
                    <div className="h4 mb-1">
                      <Badge 
                        bg={highlights.global_data.market_cap_change_percentage_24h_usd >= 0 ? 'success' : 'danger'}
                        className="fs-5"
                      >
                        {formatPercentage(highlights.global_data.market_cap_change_percentage_24h_usd)}
                      </Badge>
                    </div>
                    <small className="text-muted">Market Cap Change (24h)</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Market Highlights */}
      <Row>
        {/* Trending Coins */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon="fire" className="me-2 text-danger" />
                  Trending Coins
                </h5>
                <Badge bg="primary">{highlights.trending.length}</Badge>
              </div>
            </Card.Header>
            <Card.Body className="pt-2">
              {highlights.trending.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <FontAwesomeIcon icon="chart-line" size="2x" className="mb-3" />
                  <p>No trending data available</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {highlights.trending.slice(0, 5).map((coin, index) => (
                    <div key={coin.item?.id || index} className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center flex-grow-1">
                          <div className="position-relative me-3">
                            <img 
                              src={coin.item?.thumb} 
                              alt={coin.item?.name}
                              className="coin-image"
                              style={{ width: '32px', height: '32px' }}
                            />
                            <Badge 
                              bg="warning" 
                              className="position-absolute top-0 start-100 translate-middle badge-sm"
                              style={{ fontSize: '0.6rem' }}
                            >
                              {index + 1}
                            </Badge>
                          </div>
                          <div className="flex-grow-1 min-width-0">
                            <div className="fw-semibold text-truncate">
                              {coin.item?.name}
                            </div>
                            <small className="text-muted text-uppercase">
                              {coin.item?.symbol}
                            </small>
                          </div>
                        </div>
                        <Button
                          as={Link}
                          to={`/coin/${coin.item?.id}`}
                          variant="outline-primary"
                          size="sm"
                        >
                          <FontAwesomeIcon icon="external-link-alt" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center mt-3">
                <Button as={Link} to="/highlights" variant="outline-primary" size="sm">
                  View All Trending <FontAwesomeIcon icon="arrow-right" className="ms-1" />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Gainers */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon="arrow-up" className="me-2 text-success" />
                  Top Gainers
                </h5>
                <Badge bg="success">{highlights.top_gainers.length}</Badge>
              </div>
            </Card.Header>
            <Card.Body className="pt-2">
              {highlights.top_gainers.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <FontAwesomeIcon icon="chart-line" size="2x" className="mb-3" />
                  <p>No gainer data available</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {highlights.top_gainers.slice(0, 5).map((coin) => (
                    <div key={coin.id} className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center flex-grow-1">
                          <img 
                            src={coin.image} 
                            alt={coin.name}
                            className="coin-image me-3"
                            style={{ width: '32px', height: '32px' }}
                          />
                          <div className="flex-grow-1 min-width-0">
                            <div className="fw-semibold text-truncate">
                              {coin.name}
                            </div>
                            <small className="text-muted">
                              {formatPrice(coin.current_price)}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          <Badge bg="success" className="mb-1">
                            +{formatPercentage(Math.abs(coin.price_change_percentage_24h))}
                          </Badge>
                          <br />
                          <Button
                            as={Link}
                            to={`/coin/${coin.id}`}
                            variant="outline-success"
                            size="sm"
                          >
                            <FontAwesomeIcon icon="external-link-alt" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center mt-3">
                <Button as={Link} to="/highlights" variant="outline-success" size="sm">
                  View All Gainers <FontAwesomeIcon icon="arrow-right" className="ms-1" />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Losers */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon="arrow-down" className="me-2 text-danger" />
                  Top Losers
                </h5>
                <Badge bg="danger">{highlights.top_losers.length}</Badge>
              </div>
            </Card.Header>
            <Card.Body className="pt-2">
              {highlights.top_losers.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <FontAwesomeIcon icon="chart-line" size="2x" className="mb-3" />
                  <p>No loser data available</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {highlights.top_losers.slice(0, 5).map((coin) => (
                    <div key={coin.id} className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center flex-grow-1">
                          <img 
                            src={coin.image} 
                            alt={coin.name}
                            className="coin-image me-3"
                            style={{ width: '32px', height: '32px' }}
                          />
                          <div className="flex-grow-1 min-width-0">
                            <div className="fw-semibold text-truncate">
                              {coin.name}
                            </div>
                            <small className="text-muted">
                              {formatPrice(coin.current_price)}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          <Badge bg="danger" className="mb-1">
                            {formatPercentage(coin.price_change_percentage_24h)}
                          </Badge>
                          <br />
                          <Button
                            as={Link}
                            to={`/coin/${coin.id}`}
                            variant="outline-danger"
                            size="sm"
                          >
                            <FontAwesomeIcon icon="external-link-alt" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center mt-3">
                <Button as={Link} to="/highlights" variant="outline-danger" size="sm">
                  View All Losers <FontAwesomeIcon icon="arrow-right" className="ms-1" />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">
                <FontAwesomeIcon icon="rocket" className="me-2 text-primary" />
                Quick Actions
              </h5>
              <Row className="text-center">
                <Col md={3} className="mb-3 mb-md-0">
                  <Button 
                    as={Link} 
                    to="/portfolio" 
                    variant="outline-primary" 
                    className="w-100 h-100 py-3"
                  >
                    <FontAwesomeIcon icon="briefcase" size="2x" className="mb-2 d-block" />
                    <div>Manage Portfolio</div>
                    <small className="text-muted">Track your investments</small>
                  </Button>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button 
                    as={Link} 
                    to="/collections" 
                    variant="outline-success" 
                    className="w-100 h-100 py-3"
                  >
                    <FontAwesomeIcon icon="layer-group" size="2x" className="mb-2 d-block" />
                    <div>Browse Collections</div>
                    <small className="text-muted">Curated coin lists</small>
                  </Button>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button 
                    as={Link} 
                    to="/all" 
                    variant="outline-info" 
                    className="w-100 h-100 py-3"
                  >
                    <FontAwesomeIcon icon="search" size="2x" className="mb-2 d-block" />
                    <div>Explore Markets</div>
                    <small className="text-muted">Discover new coins</small>
                  </Button>
                </Col>
                <Col md={3}>
                  <Button 
                    as={Link} 
                    to="/highlights" 
                    variant="outline-warning" 
                    className="w-100 h-100 py-3"
                  >
                    <FontAwesomeIcon icon="chart-line" size="2x" className="mb-2 d-block" />
                    <div>Market Analysis</div>
                    <small className="text-muted">Trends & insights</small>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
