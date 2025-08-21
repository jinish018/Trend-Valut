import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, ButtonGroup, Alert, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import PriceChart from '../components/PriceChart';

const CoinDetails = () => {
  const { coinId } = useParams();
  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartPeriod, setChartPeriod] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoinDetails();
    fetchChartData();
  }, [coinId]);

  useEffect(() => {
    fetchChartData();
  }, [chartPeriod]);

  const fetchCoinDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/dashboard/coins/${coinId}/`);
      setCoin(response.data);
    } catch (error) {
      console.error('Error fetching coin details:', error);
      setError('Unable to fetch coin details. Please check the coin ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const response = await axios.get(`/api/dashboard/coins/${coinId}/history/?days=${chartPeriod}`);
      const data = response.data;
      
      if (data.prices && data.prices.length > 0) {
        const chartConfig = {
          labels: data.prices.map(price => {
            const date = new Date(price[0]);
            if (chartPeriod <= 1) {
              return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            } else if (chartPeriod <= 7) {
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
          }),
          prices: data.prices.map(price => price[1])
        };
        setChartData(chartConfig);
      } else {
        setChartData(null);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData(null);
    } finally {
      setChartLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  const formatLargeNumber = (num) => {
    if (!num) return 'N/A';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const formatPercentage = (percentage) => {
    if (!percentage && percentage !== 0) return 'N/A';
    const formatted = percentage.toFixed(2);
    return `${percentage > 0 ? '+' : ''}${formatted}%`;
  };

  const getPeriodLabel = (days) => {
    if (days <= 1) return `${days * 24}H`;
    if (days < 30) return `${days}D`;
    if (days < 365) return `${Math.round(days / 30)}M`;
    return `${Math.round(days / 365)}Y`;
  };

  if (loading) return <LoadingSpinner message="Loading coin details..." />;

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="danger" className="text-center">
              <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
              <h4>Coin Not Found</h4>
              <p>{error}</p>
              <Button as={Link} to="/all" variant="outline-danger">
                <i className="fas fa-arrow-left me-2"></i>
                Back to All Coins
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!coin) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h4>Coin data not available</h4>
          <p>The requested cryptocurrency information is currently unavailable.</p>
          <Button as={Link} to="/all" variant="outline-warning">
            <i className="fas fa-arrow-left me-2"></i>
            Back to All Coins
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-3 px-md-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button 
              as={Link} 
              to="/all" 
              variant="outline-secondary" 
              size="sm" 
              className="me-3"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </Button>
            <img 
              src={coin.image?.large || coin.image?.small} 
              alt={coin.name}
              className="me-3"
              style={{ width: '64px', height: '64px' }}
            />
            <div className="flex-grow-1">
              <h1 className="h2 mb-1">
                {coin.name} 
                <small className="text-muted ms-2">({coin.symbol?.toUpperCase()})</small>
              </h1>
              <div className="d-flex align-items-center flex-wrap gap-2">
                {coin.market_cap_rank && (
                  <Badge bg="primary" className="fs-6">
                    Rank #{coin.market_cap_rank}
                  </Badge>
                )}
                {coin.categories && coin.categories.slice(0, 2).map((category, index) => (
                  <Badge key={index} bg="secondary" className="fs-6">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Chart Section */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center flex-wrap">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2 text-primary"></i>
                Price Chart
              </h5>
              <ButtonGroup size="sm" className="mt-2 mt-sm-0">
                {[1, 7, 30, 90, 365].map((days) => (
                  <Button 
                    key={days}
                    variant={chartPeriod === days ? "primary" : "outline-primary"}
                    onClick={() => setChartPeriod(days)}
                    disabled={chartLoading}
                  >
                    {getPeriodLabel(days)}
                  </Button>
                ))}
              </ButtonGroup>
            </Card.Header>
            <Card.Body>
              {chartLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading chart data...</p>
                  </div>
                </div>
              ) : chartData && chartData.prices && chartData.prices.length > 0 ? (
                <PriceChart 
                  data={chartData} 
                  title={`${coin.name} Price Chart (${getPeriodLabel(chartPeriod)})`}
                  period={getPeriodLabel(chartPeriod)}
                  height={400}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                  <div className="text-center">
                    <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                    <p className="text-muted">Chart data not available for this period</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={fetchChartData}
                    >
                      <i className="fas fa-sync-alt me-2"></i>
                      Retry
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Price & Stats Section */}
        <Col lg={4} className="mb-4">
          <div className="sticky-top" style={{ top: '2rem' }}>
            {/* Current Price Card */}
            <Card className="border-0 shadow-sm mb-3">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="fas fa-dollar-sign me-2 text-success"></i>
                  Current Price
                </h5>
              </Card.Header>
              <Card.Body className="pt-0">
                <h2 className="text-primary mb-2">
                  {coin.market_data?.current_price?.usd ? 
                    formatPrice(coin.market_data.current_price.usd) : 
                    'N/A'
                  }
                </h2>
                {coin.market_data?.price_change_percentage_24h !== undefined && (
                  <Badge 
                    bg={coin.market_data.price_change_percentage_24h >= 0 ? 'success' : 'danger'}
                    className="fs-5"
                  >
                    {formatPercentage(coin.market_data.price_change_percentage_24h)} (24h)
                  </Badge>
                )}
              </Card.Body>
            </Card>

            {/* Market Statistics Card */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="fas fa-chart-bar me-2 text-info"></i>
                  Market Statistics
                </h5>
              </Card.Header>
              <Card.Body className="pt-0">
                <Table borderless className="mb-0">
                  <tbody>
                    <tr>
                      <td className="px-0 py-2 text-muted">Market Cap</td>
                      <td className="px-0 py-2 text-end fw-bold">
                        {coin.market_data?.market_cap?.usd ? 
                          `$${formatLargeNumber(coin.market_data.market_cap.usd)}` : 
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="px-0 py-2 text-muted">24h Volume</td>
                      <td className="px-0 py-2 text-end fw-bold">
                        {coin.market_data?.total_volume?.usd ? 
                          `$${formatLargeNumber(coin.market_data.total_volume.usd)}` : 
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="px-0 py-2 text-muted">Circulating Supply</td>
                      <td className="px-0 py-2 text-end fw-bold">
                        {coin.market_data?.circulating_supply ? 
                          formatLargeNumber(coin.market_data.circulating_supply) : 
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="px-0 py-2 text-muted">Total Supply</td>
                      <td className="px-0 py-2 text-end fw-bold">
                        {coin.market_data?.total_supply ? 
                          formatLargeNumber(coin.market_data.total_supply) : 
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="px-0 py-2 text-muted">24h High</td>
                      <td className="px-0 py-2 text-end fw-bold text-success">
                        {coin.market_data?.high_24h?.usd ? 
                          formatPrice(coin.market_data.high_24h.usd) : 
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="px-0 py-2 text-muted">24h Low</td>
                      <td className="px-0 py-2 text-end fw-bold text-danger">
                        {coin.market_data?.low_24h?.usd ? 
                          formatPrice(coin.market_data.low_24h.usd) : 
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="px-0 py-2 text-muted">All Time High</td>
                      <td className="px-0 py-2 text-end fw-bold">
                        {coin.market_data?.ath?.usd ? 
                          formatPrice(coin.market_data.ath.usd) : 
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="px-0 py-2 text-muted">All Time Low</td>
                      <td className="px-0 py-2 text-end fw-bold">
                        {coin.market_data?.atl?.usd ? 
                          formatPrice(coin.market_data.atl.usd) : 
                          'N/A'
                        }
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Description Section */}
      {coin.description?.en && (
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2 text-primary"></i>
                  About {coin.name}
                </h5>
              </Card.Header>
              <Card.Body>
                <div 
                  className="text-muted"
                  dangerouslySetInnerHTML={{ 
                    __html: coin.description.en.length > 1000 
                      ? coin.description.en.substring(0, 1000) + '...' 
                      : coin.description.en
                  }}
                  style={{ lineHeight: '1.6' }}
                />
                {coin.description.en.length > 1000 && (
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => {
                      const element = document.querySelector('[dangerouslySetInnerHTML]');
                      element.innerHTML = coin.description.en;
                    }}
                  >
                    Read More
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Links Section */}
      {(coin.links?.homepage?.[0] || coin.links?.blockchain_site?.length > 0) && (
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="fas fa-link me-2 text-primary"></i>
                  Official Links
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {coin.links?.homepage?.[0] && (
                    <Button 
                      as="a" 
                      href={coin.links.homepage[0]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      variant="outline-primary" 
                      size="sm"
                    >
                      <i className="fas fa-home me-2"></i>
                      Official Website
                    </Button>
                  )}
                  {coin.links?.blockchain_site?.slice(0, 3).map((site, index) => (
                    <Button 
                      key={index}
                      as="a" 
                      href={site} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      variant="outline-secondary" 
                      size="sm"
                    >
                      <i className="fas fa-external-link-alt me-2"></i>
                      Explorer {index + 1}
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CoinDetails;
