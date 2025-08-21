import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Alert, Pagination, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes, FaSync } from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const AllCoins = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addItemLoading, setAddItemLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [addForm, setAddForm] = useState({
    quantity: '',
    buy_price: '',
    transaction_date: new Date().toISOString().split('T')[0],
    exchange: '',
    notes: ''
  });

  useEffect(() => {
    fetchCoins();
  }, [page]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (searchTerm !== '') {
        setPage(1);
        fetchCoins(true);
      } else if (searchTerm === '') {
        fetchCoins();
      }
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm]);

  const fetchCoins = async (isSearch = false) => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: isSearch ? 1 : page,
        per_page: 50
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await axios.get('/api/dashboard/coins/', { params });

      if (response.data.coins) {
        setCoins(response.data.coins);
        setTotalPages(searchTerm ? 5 : 50);
      } else {
        setCoins([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
      setError('Unable to fetch cryptocurrency data. Please try again later.');
      setCoins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatPercentage = (percentage) => {
    if (!percentage && percentage !== 0) return 'N/A';
    const formatted = percentage.toFixed(2);
    return `${percentage > 0 ? '+' : ''}${formatted}%`;
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Previous button with icon
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={page === 1}
        onClick={() => handlePageChange(page - 1)}
      >
        <FaChevronLeft className="me-1" />
        Previous
      </Pagination.Prev>
    );

    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }

    // Visible pages
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === page}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button with icon
    items.push(
      <Pagination.Next
        key="next"
        disabled={page === totalPages}
        onClick={() => handlePageChange(page + 1)}
      >
        Next
        <FaChevronRight className="ms-1" />
      </Pagination.Next>
    );

    return <Pagination className="justify-content-center">{items}</Pagination>;
  };

  return (
    <Container fluid className="px-3 px-md-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1 className="h2 mb-2">
                <i className="fas fa-coins me-3 text-primary"></i>
                All Cryptocurrencies
              </h1>
              <p className="text-muted">
                Complete list of cryptocurrencies with real-time market data
              </p>
            </div>
            <div className="d-flex gap-2 mt-3 mt-md-0">
              <Button
                variant="outline-primary"
                onClick={() => fetchCoins()}
                disabled={loading}
                size="sm"
              >
                <FaSync className="me-2" />
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <Form.Label className="fw-semibold mb-2">
                <FaSearch className="me-2" />
                Search Cryptocurrencies
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by name or symbol..."
                  value={searchTerm}
                  onChange={handleSearch}
                  disabled={loading}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={clearSearch}
                    disabled={loading}
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
              {searchTerm && (
                <Form.Text className="text-muted">
                  Searching for "{searchTerm}"
                </Form.Text>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={8} className="mt-3 mt-md-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-semibold">
                    Page {page} of {totalPages}
                  </span>
                  <span className="text-muted ms-2">
                    • Showing {coins.length} cryptocurrencies
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={page === 1 || loading}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <FaChevronLeft />
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={page === totalPages || loading}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    <FaChevronRight />
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
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
            onClick={() => fetchCoins()}
          >
            Retry
          </Button>
        </Alert>
      )}

      {loading ? (
        <LoadingSpinner message="Loading cryptocurrency data..." />
      ) : (
        <>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {coins.length === 0 ? (
                <div className="text-center py-5">
                  <FaSearch size="3rem" className="text-muted mb-3" />
                  <h5 className="text-muted">No cryptocurrencies found</h5>
                  <p className="text-muted">
                    {searchTerm
                      ? `No results found for "${searchTerm}". Try a different search term.`
                      : 'Unable to load cryptocurrency data.'
                    }
                  </p>
                  {searchTerm && (
                    <Button variant="outline-primary" onClick={clearSearch}>
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-dark sticky-top">
                      <tr>
                        <th className="border-0">#</th>
                        <th className="border-0">Name</th>
                        <th className="border-0 text-end">Price</th>
                        <th className="border-0 text-end d-none d-md-table-cell">24h %</th>
                        <th className="border-0 text-end d-none d-lg-table-cell">7d %</th>
                        <th className="border-0 text-end d-none d-lg-table-cell">Market Cap</th>
                        <th className="border-0 text-end d-none d-xl-table-cell">Volume (24h)</th>
                        <th className="border-0 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coins.map((coin, index) => (
                        <tr key={coin.id} className="align-middle">
                          <td>
                            <div className="d-flex align-items-center">
                              {coin.market_cap_rank ? (
                                <Badge bg="light" text="dark" className="fs-6">
                                  {coin.market_cap_rank}
                                </Badge>
                              ) : (
                                <Badge bg="secondary" className="fs-6">
                                  N/A
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={coin.image}
                                alt={coin.name}
                                className="coin-image me-3"
                                style={{ width: '32px', height: '32px' }}
                              />
                              <div className="min-width-0">
                                <div className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
                                  {coin.name}
                                </div>
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
                          <td className="text-end d-none d-md-table-cell">
                            <Badge
                              bg={coin.price_change_percentage_24h >= 0 ? 'success' : 'danger'}
                              className="fs-6"
                            >
                              {formatPercentage(coin.price_change_percentage_24h)}
                            </Badge>
                          </td>
                          <td className="text-end d-none d-lg-table-cell">
                            <Badge
                              bg={coin.price_change_percentage_7d_in_currency >= 0 ? 'success' : 'danger'}
                              className="fs-6"
                            >
                              {formatPercentage(coin.price_change_percentage_7d_in_currency)}
                            </Badge>
                          </td>
                          <td className="text-end d-none d-lg-table-cell">
                            <div className="fw-bold">
                              {formatMarketCap(coin.market_cap)}
                            </div>
                          </td>
                          <td className="text-end d-none d-xl-table-cell">
                            <div>
                              {formatMarketCap(coin.total_volume)}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                as={Link}
                                to={`/coin/${coin.id}`}
                                variant="outline-primary"
                                size="sm"
                              >
                                <i className="fas fa-external-link-alt me-1 d-none d-sm-inline"></i>
                                <span className="d-none d-sm-inline">View</span>
                                <i className="fas fa-eye d-sm-none"></i>
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedCoin(coin);
                                  setAddForm({
                                    quantity: '',
                                    buy_price: coin.current_price ?? '',
                                    transaction_date: new Date().toISOString().split('T')[0],
                                    exchange: '',
                                    notes: ''
                                  });
                                  setShowAddModal(true);
                                }}
                              >
                                Add to Portfolio
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

          {/* Pagination with Icons */}
          {coins.length > 0 && totalPages > 1 && (
            <Row className="mt-4">
              <Col>
                {renderPagination()}
              </Col>
            </Row>
          )}
        </>
      )}
      {/* Add to Portfolio Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-plus me-2"></i>
            Add to Portfolio
          </Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedCoin) return;
            setAddItemLoading(true);
            try {
              const payload = {
                coin_id: selectedCoin.id,
                coin_name: selectedCoin.name,
                coin_symbol: selectedCoin.symbol,
                quantity: parseFloat(addForm.quantity),
                buy_price: parseFloat(addForm.buy_price),
                transaction_date: new Date(addForm.transaction_date).toISOString(),
                exchange: addForm.exchange,
                notes: addForm.notes
              };
              await axios.post('/api/portfolio/add/', payload);
              toast.success('Added to portfolio');
              setShowAddModal(false);
              navigate('/portfolio', { replace: true });
            } catch (err) {
              console.error('Add to portfolio error:', err);
              toast.error(err.response?.data?.error || 'Failed to add to portfolio');
            } finally {
              setAddItemLoading(false);
            }
          }}
        >
          <Modal.Body>
            <div className="mb-3">
              <div className="fw-bold">
                {selectedCoin ? `${selectedCoin.name} (${selectedCoin.symbol?.toUpperCase()})` : ''}
              </div>
              <small className="text-muted">
                Current Price: {selectedCoin ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(selectedCoin.current_price || 0) : ''}
              </small>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Quantity *</Form.Label>
              <Form.Control
                type="number"
                step="any"
                value={addForm.quantity}
                onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                placeholder="0.00000000"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Buy Price (USD) *</Form.Label>
              <Form.Control
                type="number"
                step="any"
                value={addForm.buy_price}
                onChange={(e) => setAddForm({ ...addForm, buy_price: e.target.value })}
                placeholder="0.00"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Transaction Date *</Form.Label>
              <Form.Control
                type="date"
                value={addForm.transaction_date}
                onChange={(e) => setAddForm({ ...addForm, transaction_date: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Exchange</Form.Label>
              <Form.Control
                type="text"
                value={addForm.exchange}
                onChange={(e) => setAddForm({ ...addForm, exchange: e.target.value })}
                placeholder="e.g., Binance, Coinbase"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                type="text"
                value={addForm.notes}
                onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={addItemLoading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={addItemLoading}>
              {addItemLoading ? 'Adding...' : 'Add Holding'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AllCoins;
