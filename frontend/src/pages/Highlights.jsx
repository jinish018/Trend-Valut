import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Nav, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Highlights = () => {
  const [activeTab, setActiveTab] = useState('trending');
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
      setLoading(true);
      const response = await axios.get('/api/dashboard/highlights/');
      setHighlights(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching highlights:', error);
      setError('Unable to fetch market highlights. Please try again later.');
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

  if (loading) return <LoadingSpinner message="Loading market highlights..." />;

  return (
    <Container fluid className="px-3 px-md-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1 className="h2 mb-2">
                <i className="fas fa-star me-3 text-warning"></i>
                Market Highlights
              </h1>
              <p className="text-muted">
                Discover trending cryptocurrencies, top performers, and market insights
              </p>
            </div>
            <Button 
              variant="outline-primary" 
              onClick={fetchHighlights}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Refresh Data
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-3"
            onClick={fetchHighlights}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Global Market Stats */}
      {highlights.global_data && Object.keys(highlights.global_data).length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="mb-3">
                  <i className="fas fa-globe me-2 text-primary"></i>
                  Global Market Statistics
                </h5>
                <Row className="text-center g-4">
                  <Col md={6} lg={3}>
                    <div className="border rounded p-3 h-100">
                      <div className="h3 mb-2 text-primary">
                        {highlights.global_data.active_cryptocurrencies?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-muted">Active Cryptocurrencies</div>
                    </div>
                  </Col>
                  <Col md={6} lg={3}>
                    <div className="border rounded p-3 h-100">
                      <div className="h3 mb-2 text-success">
                        {formatMarketCap(highlights.global_data.total_market_cap?.usd)}
                      </div>
                      <div className="text-muted">Total Market Cap</div>
                    </div>
                  </Col>
                  <Col md={6} lg={3}>
                    <div className="border rounded p-3 h-100">
                      <div className="h3 mb-2 text-info">
                        {formatMarketCap(highlights.global_data.total_volume?.usd)}
                      </div>
                      <div className="text-muted">24h Trading Volume</div>
                    </div>
                  </Col>
                  <Col md={6} lg={3}>
                    <div className="border rounded p-3 h-100">
                      <div className="h3 mb-2">
                        <Badge 
                          bg={highlights.global_data.market_cap_change_percentage_24h_usd >= 0 ? 'success' : 'danger'}
                          className="fs-5"
                        >
                          {formatPercentage(highlights.global_data.market_cap_change_percentage_24h_usd)}
                        </Badge>
                      </div>
                      <div className="text-muted">Market Cap Change (24h)</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Navigation Tabs */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0">
              <Nav variant="pills" className="nav-fill">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'trending'}
                    onClick={() => setActiveTab('trending')}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <i className="fas fa-fire me-2"></i>
                    Trending ({highlights.trending.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'gainers'}
                    onClick={() => setActiveTab('gainers')}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <i className="fas fa-arrow-up me-2"></i>
                    Top Gainers ({highlights.top_gainers.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'losers'}
                    onClick={() => setActiveTab('losers')}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <i className="fas fa-arrow-down me-2"></i>
                    Top Losers ({highlights.top_losers.length})
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            <Card.Body className="p-0">
              {/* Trending Coins Tab */}
              {activeTab === 'trending' && (
                <div>
                  {highlights.trending.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No trending data available</p>
                    </div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Rank</th>
                          <th>Coin</th>
                          <th className="text-center">Market Cap Rank</th>
                          <th className="text-center">Score</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {highlights.trending.map((coin, index) => (
                          <tr key={coin.item?.id || index}>
                            <td>
                              <Badge bg="warning" className="fs-6">
                                #{index + 1}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={coin.item?.thumb} 
                                  alt={coin.item?.name}
                                  className="coin-image me-3"
                                  style={{ width: '32px', height: '32px' }}
                                />
                                <div>
                                  <div className="fw-bold">{coin.item?.name}</div>
                                  <small className="text-muted text-uppercase">
                                    {coin.item?.symbol}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <Badge bg="secondary">
                                #{coin.item?.market_cap_rank || 'N/A'}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <Badge bg="info">
                                {coin.item?.score || 'N/A'}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <Button
                                as={Link}
                                to={`/coin/${coin.item?.id}`}
                                variant="outline-primary"
                                size="sm"
                              >
                                <i className="fas fa-external-link-alt me-1"></i>
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}

              {/* Top Gainers Tab */}
              {activeTab === 'gainers' && (
                <div>
                  {highlights.top_gainers.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-arrow-up fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No gainer data available</p>
                    </div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Rank</th>
                          <th>Coin</th>
                          <th className="text-end">Price</th>
                          <th className="text-end">24h Change</th>
                          <th className="text-end">Market Cap</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {highlights.top_gainers.map((coin, index) => (
                          <tr key={coin.id}>
                            <td>
                              <Badge bg="success" className="fs-6">
                                #{index + 1}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={coin.image} 
                                  alt={coin.name}
                                  className="coin-image me-3"
                                  style={{ width: '32px', height: '32px' }}
                                />
                                <div>
                                  <div className="fw-bold">{coin.name}</div>
                                  <small className="text-muted text-uppercase">
                                    {coin.symbol}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="text-end">
                              <div className="fw-bold">
                                {formatPrice(coin.current_price)}
                              </div>
                            </td>
                            <td className="text-end">
                              <Badge bg="success" className="fs-6">
                                +{formatPercentage(Math.abs(coin.price_change_percentage_24h))}
                              </Badge>
                            </td>
                            <td className="text-end">
                              <div className="fw-bold">
                                {formatMarketCap(coin.market_cap)}
                              </div>
                            </td>
                            <td className="text-center">
                              <Button
                                as={Link}
                                to={`/coin/${coin.id}`}
                                variant="outline-success"
                                size="sm"
                              >
                                <i className="fas fa-external-link-alt me-1"></i>
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}

              {/* Top Losers Tab */}
              {activeTab === 'losers' && (
                <div>
                  {highlights.top_losers.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-arrow-down fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No loser data available</p>
                    </div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Rank</th>
                          <th>Coin</th>
                          <th className="text-end">Price</th>
                          <th className="text-end">24h Change</th>
                          <th className="text-end">Market Cap</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {highlights.top_losers.map((coin, index) => (
                          <tr key={coin.id}>
                            <td>
                              <Badge bg="danger" className="fs-6">
                                #{index + 1}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={coin.image} 
                                  alt={coin.name}
                                  className="coin-image me-3"
                                  style={{ width: '32px', height: '32px' }}
                                />
                                <div>
                                  <div className="fw-bold">{coin.name}</div>
                                  <small className="text-muted text-uppercase">
                                    {coin.symbol}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="text-end">
                              <div className="fw-bold">
                                {formatPrice(coin.current_price)}
                              </div>
                            </td>
                            <td className="text-end">
                              <Badge bg="danger" className="fs-6">
                                {formatPercentage(coin.price_change_percentage_24h)}
                              </Badge>
                            </td>
                            <td className="text-end">
                              <div className="fw-bold">
                                {formatMarketCap(coin.market_cap)}
                              </div>
                            </td>
                            <td className="text-center">
                              <Button
                                as={Link}
                                to={`/coin/${coin.id}`}
                                variant="outline-danger"
                                size="sm"
                              >
                                <i className="fas fa-external-link-alt me-1"></i>
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Highlights;
