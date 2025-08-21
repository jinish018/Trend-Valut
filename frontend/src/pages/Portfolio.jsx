import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addItemLoading, setAddItemLoading] = useState(false);
  const [error, setError] = useState('');
  const [newItem, setNewItem] = useState({
    coin_id: '',
    coin_name: '',
    coin_symbol: '',
    quantity: '',
    buy_price: '',
    transaction_date: new Date().toISOString().split('T')[0],
    exchange: '',
    fee: '0',
    notes: ''
  });

  useEffect(() => {
    fetchPortfolio();
    fetchPerformance();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('/api/portfolio/');
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setError('Unable to fetch portfolio data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await axios.get('/api/portfolio/performance/');
      setPerformance(response.data);
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setAddItemLoading(true);

    try {
      const formattedItem = {
        ...newItem,
        quantity: parseFloat(newItem.quantity),
        buy_price: parseFloat(newItem.buy_price),
        fee: parseFloat(newItem.fee || 0),
        transaction_date: new Date(newItem.transaction_date).toISOString()
      };
      await axios.post('/api/portfolio/add/', {
        ...newItem,
        transaction_date: new Date(newItem.transaction_date).toISOString()
      });
      
      toast.success('Item added to portfolio successfully!');
      setShowAddModal(false);
      setNewItem({
        coin_id: '',
        coin_name: '',
        coin_symbol: '',
        quantity: '',
        buy_price: '',
        transaction_date: new Date().toISOString().split('T')[0],
        exchange: '',
        fee: '0',
        notes: ''
      });
      
      await fetchPortfolio();
      await fetchPerformance();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(error.response?.data?.error || 'Failed to add item to portfolio');
    } finally {
      setAddItemLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from your portfolio?')) {
      return;
    }

    try {
      await axios.delete(`/api/portfolio/item/${itemId}/delete/`);
      toast.success('Item removed from portfolio successfully!');
      await fetchPortfolio();
      await fetchPerformance();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to remove item from portfolio');
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

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(number);
  };

  const formatPercentage = (percentage) => {
    if (!percentage && percentage !== 0) return 'N/A';
    const formatted = percentage.toFixed(2);
    return `${percentage > 0 ? '+' : ''}${formatted}%`;
  };

  if (loading) return <LoadingSpinner message="Loading your portfolio..." />;

  return (
    <Container fluid className="px-3 px-md-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1 className="h2 mb-2">
                <i className="fas fa-briefcase me-3 text-primary"></i>
                My Portfolio
              </h1>
              <p className="text-muted">
                Track your cryptocurrency investments and performance
              </p>
            </div>
            <div className="d-flex gap-2 mt-3 mt-md-0">
              <Button 
                variant="primary" 
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add Holding
              </Button>
              <Button 
                variant="outline-primary" 
                onClick={() => {
                  fetchPortfolio();
                  fetchPerformance();
                }}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Portfolio Summary */}
      {portfolio && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm portfolio-summary">
              <Card.Body className="p-4">
                <h5 className="mb-4 text-white">
                  <i className="fas fa-chart-pie me-2"></i>
                  Portfolio Overview
                </h5>
                <Row className="text-center">
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="h3 mb-1 text-white">
                      {formatPrice(portfolio.total_value || 0)}
                    </div>
                    <small className="text-white-50">Current Value</small>
                  </Col>
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="h3 mb-1 text-white">
                      {formatPrice(portfolio.total_invested || 0)}
                    </div>
                    <small className="text-white-50">Total Invested</small>
                  </Col>
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="h3 mb-1">
                      <span className={portfolio.profit_loss >= 0 ? 'text-success' : 'text-danger'}>
                        {formatPrice(portfolio.profit_loss || 0)}
                      </span>
                    </div>
                    <small className="text-white-50">Profit/Loss</small>
                  </Col>
                  <Col md={3}>
                    <div className="h3 mb-1">
                      <Badge 
                        bg={portfolio.profit_loss_percentage >= 0 ? 'success' : 'danger'}
                        className="fs-4"
                      >
                        {formatPercentage(portfolio.profit_loss_percentage)}
                      </Badge>
                    </div>
                    <small className="text-white-50">Total Return</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Asset Allocation */}
      {performance && performance.asset_allocation && performance.asset_allocation.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="fas fa-chart-pie me-2 text-primary"></i>
                  Asset Allocation
                </h5>
              </Card.Header>
              <Card.Body>
                {performance.asset_allocation.map((asset, index) => (
                  <div key={asset.coin_id} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center">
                        <span className="fw-bold me-2">{asset.coin_symbol.toUpperCase()}</span>
                        <small className="text-muted">{asset.coin_name}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{formatPrice(asset.value)}</div>
                        <small className="text-muted">{asset.percentage.toFixed(1)}%</small>
                      </div>
                    </div>
                    <ProgressBar 
                      now={asset.percentage} 
                      variant={index % 2 === 0 ? 'primary' : 'success'}
                      style={{ height: '8px' }}
                    />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Holdings Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2 text-primary"></i>
                  Holdings ({portfolio?.items?.length || 0})
                </h5>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {!portfolio || !portfolio.items || portfolio.items.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-briefcase fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Your portfolio is empty</h5>
                  <p className="text-muted">Start building your crypto portfolio by adding your first holding.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add Your First Holding
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="border-0">Asset</th>
                        <th className="border-0 text-end">Quantity</th>
                        <th className="border-0 text-end">Avg. Buy Price</th>
                        <th className="border-0 text-end">Current Price</th>
                        <th className="border-0 text-end d-none d-lg-table-cell">Market Value</th>
                        <th className="border-0 text-end">P&L</th>
                        <th className="border-0 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.items.map((item) => (
                        <tr key={item.id} className="align-middle">
                          <td>
                            <div className="d-flex align-items-center">
                              <div>
                                <div className="fw-bold">{item.coin_name}</div>
                                <small className="text-muted text-uppercase">
                                  {item.coin_symbol}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="fw-bold">
                              {formatNumber(item.quantity)}
                            </div>
                          </td>
                          <td className="text-end">
                            <div>{formatPrice(item.average_buy_price)}</div>
                          </td>
                          <td className="text-end">
                            <div className="fw-bold">
                              {formatPrice(item.current_price)}
                            </div>
                          </td>
                          <td className="text-end d-none d-lg-table-cell">
                            <div className="fw-bold">
                              {formatPrice(item.current_value)}
                            </div>
                          </td>
                          <td className="text-end">
                            <div className={`fw-bold ${item.profit_loss >= 0 ? 'text-success' : 'text-danger'}`}>
                              {formatPrice(item.profit_loss)}
                            </div>
                            <Badge 
                              bg={item.profit_loss_percentage >= 0 ? 'success' : 'danger'}
                              className="fs-6"
                            >
                              {formatPercentage(item.profit_loss_percentage)}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              {/* <Button
                                as={Link}
                                to={`/coin/${item.coin_id}`}
                                variant="outline-primary"
                                size="sm"
                              >
                                <i className="fas fa-external-link-alt"></i>
                              </Button> */}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                {/* <i className="fas fa-trash"></i> */}
                                Remove
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-plus me-2"></i>
            Add New Holding
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddItem}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coin ID *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newItem.coin_id}
                    onChange={(e) => setNewItem({...newItem, coin_id: e.target.value})}
                    placeholder="e.g., bitcoin"
                    required
                  />
                  <Form.Text className="text-muted">
                    Use the coin ID from CoinGecko (usually lowercase)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coin Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newItem.coin_name}
                    onChange={(e) => setNewItem({...newItem, coin_name: e.target.value})}
                    placeholder="e.g., Bitcoin"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Symbol *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newItem.coin_symbol}
                    onChange={(e) => setNewItem({...newItem, coin_symbol: e.target.value})}
                    placeholder="e.g., BTC"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                    placeholder="0.00000000"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Buy Price (USD) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    value={newItem.buy_price}
                    onChange={(e) => setNewItem({...newItem, buy_price: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newItem.transaction_date}
                    onChange={(e) => setNewItem({...newItem, transaction_date: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Exchange</Form.Label>
                  <Form.Control
                    type="text"
                    value={newItem.exchange}
                    onChange={(e) => setNewItem({...newItem, exchange: e.target.value})}
                    placeholder="e.g., Binance, Coinbase"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fee (USD)</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    value={newItem.fee}
                    onChange={(e) => setNewItem({...newItem, fee: e.target.value})}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    type="text"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                    placeholder="Optional notes"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={addItemLoading}
            >
              {addItemLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-plus me-2"></i>
                  Add Holding
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Portfolio;
