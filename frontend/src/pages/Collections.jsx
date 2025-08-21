import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/collection/');
      setCollections(response.data);
      
      if (response.data.length === 0) {
        // Auto-create default collections if none exist
        await createDefaultCollections();
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Unable to fetch collections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCollections = async () => {
    try {
      setResetLoading(true);
      setError('');
      
      const response = await axios.post('/api/collection/create-defaults/');
      
      if (response.data.collections) {
        setCollections(response.data.collections);
        toast.success('Default collections created successfully!');
      } else {
        throw new Error('Failed to create collections');
      }
    } catch (error) {
      console.error('Error creating default collections:', error);
      setError('Unable to create default collections.');
      toast.error('Failed to create default collections');
    } finally {
      setResetLoading(false);
    }
  };

  const fetchCollectionDetails = async (collectionId) => {
    try {
      setModalLoading(true);
      const response = await axios.get(`/api/collection/${collectionId}/`);
      setSelectedCollection(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching collection details:', error);
      toast.error('Unable to fetch collection details');
    } finally {
      setModalLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
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

  if (loading) return <LoadingSpinner message="Loading collections..." />;

  return (
    <Container fluid className="px-3 px-md-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1 className="h2 mb-2">
                <FontAwesomeIcon icon="layer-group" className="me-3 text-primary" />
                Cryptocurrency Collections
              </h1>
              <p className="text-muted">
                Curated collections of popular cryptocurrencies organized by categories
              </p>
            </div>
            <div className="d-flex gap-2 mt-3 mt-md-0">
              <Button 
                variant="outline-primary" 
                onClick={fetchCollections}
                disabled={loading || resetLoading}
              >
                <FontAwesomeIcon icon="sync-alt" className="me-2" />
                Refresh
              </Button>
              {/* <Button 
                variant="outline-success" 
                onClick={createDefaultCollections}
                disabled={resetLoading || loading}
              >
                {resetLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon="plus" className="me-2" />
                    Reset Collections
                  </>
                )}
              </Button> */}
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <FontAwesomeIcon icon="exclamation-triangle" className="me-2" />
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-3"
            onClick={fetchCollections}
          >
            Retry
          </Button>
        </Alert>
      )}

      {collections.length === 0 && !loading ? (
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <FontAwesomeIcon icon="layer-group" size="3x" className="text-muted mb-3" />
                <h5 className="text-muted">No Collections Available</h5>
                <p className="text-muted">Create some collections to organize your favorite cryptocurrencies.</p>
                <Button 
                  variant="primary" 
                  onClick={createDefaultCollections}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="plus" className="me-2" />
                      Create Default Collections
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row>
          {collections.map((collection) => (
            <Col lg={4} md={6} key={collection.id} className="mb-4">
              <Card className="h-100 collection-card border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0 pb-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="mb-0 fw-bold text-truncate me-2">
                      {collection.name}
                      {collection.is_featured && (
                        <Badge bg="warning" text="dark" className="ms-2">
                          <FontAwesomeIcon icon="star" className="me-1" />
                          Featured
                        </Badge>
                      )}
                    </h5>
                    <Badge bg="primary" className="fs-6">
                      {collection.items_count} coins
                    </Badge>
                  </div>
                </Card.Header>
                
                <Card.Body className="pt-0">
                  <p className="text-muted mb-3 small">
                    {collection.description}
                  </p>
                  
                  <div className="mb-3">
                    <small className="text-muted">
                      <FontAwesomeIcon icon="calendar-alt" className="me-2" />
                      Created: {new Date(collection.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </Card.Body>
                
                <Card.Footer className="bg-transparent border-0 pt-0">
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      onClick={() => fetchCollectionDetails(collection.id)}
                      disabled={modalLoading}
                    >
                      {modalLoading ? (
                        <>
                          <FontAwesomeIcon icon="spinner" spin className="me-2" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon="eye" className="me-2" />
                          View Collection
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Collection Details Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        size="xl"
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <FontAwesomeIcon icon="layer-group" className="me-2 text-primary" />
            {selectedCollection?.name}
            {selectedCollection?.is_featured && (
              <Badge bg="warning" text="dark" className="ms-2">
                <FontAwesomeIcon icon="star" className="me-1" />
                Featured
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="px-4">
          {selectedCollection && (
            <>
              <div className="mb-4">
                <p className="text-muted mb-3">{selectedCollection.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg="info" className="fs-6">
                    {selectedCollection.items_count} cryptocurrencies
                  </Badge>
                  <small className="text-muted">
                    Last updated: {new Date(selectedCollection.updated_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
              
              {selectedCollection.items && selectedCollection.items.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="border-0">Rank</th>
                        <th className="border-0">Name</th>
                        <th className="border-0 text-end">Price</th>
                        <th className="border-0 text-end d-none d-md-table-cell">24h %</th>
                        <th className="border-0 text-end d-none d-lg-table-cell">7d %</th>
                        <th className="border-0 text-end d-none d-lg-table-cell">Market Cap</th>
                        <th className="border-0 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCollection.items.map((item, index) => {
                        const liveData = item.live_data || {};
                        return (
                          <tr key={item.id} className="align-middle">
                            <td>
                              <Badge bg="light" text="dark" className="fs-6">
                                {liveData.market_cap_rank || index + 1}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {liveData.image && (
                                  <img 
                                    src={liveData.image} 
                                    alt={item.coin_name}
                                    className="coin-image me-3"
                                    style={{ width: '32px', height: '32px' }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
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
                                {formatPrice(liveData.current_price)}
                              </div>
                            </td>
                            <td className="text-end d-none d-md-table-cell">
                              <Badge 
                                bg={liveData.price_change_percentage_24h >= 0 ? 'success' : 'danger'}
                                className="fs-6"
                              >
                                {formatPercentage(liveData.price_change_percentage_24h)}
                              </Badge>
                            </td>
                            <td className="text-end d-none d-lg-table-cell">
                              <Badge 
                                bg={liveData.price_change_percentage_7d_in_currency >= 0 ? 'success' : 'danger'}
                                className="fs-6"
                              >
                                {formatPercentage(liveData.price_change_percentage_7d_in_currency)}
                              </Badge>
                            </td>
                            <td className="text-end d-none d-lg-table-cell">
                              <div className="fw-bold">
                                {formatMarketCap(liveData.market_cap)}
                              </div>
                            </td>
                            <td className="text-center">
                              <Button 
                                as={Link} 
                                to={`/coin/${item.coin_id}`}
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => setShowModal(false)}
                              >
                                <FontAwesomeIcon icon="external-link-alt" className="me-1 d-none d-sm-inline" />
                                <span className="d-none d-sm-inline">View</span>
                                <FontAwesomeIcon icon="eye" className="d-sm-none" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FontAwesomeIcon icon="coins" size="3x" className="text-muted mb-3" />
                  <p className="text-muted">No coins in this collection</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedCollection && (
            <Button 
              as={Link} 
              to="/all" 
              variant="primary"
              onClick={() => setShowModal(false)}
            >
              <FontAwesomeIcon icon="coins" className="me-2" />
              Explore All Coins
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Collections;
