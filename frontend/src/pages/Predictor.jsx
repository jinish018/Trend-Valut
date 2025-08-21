import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChartLine, faArrowUp, faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash';
import api from '../utils/api';

const Predictor = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [daysAhead, setDaysAhead] = useState(7);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const searchCoins = async (searchQuery) => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            console.log(`Searching for: ${searchQuery}`); // Debug log
            const response = await api.get(`/dashboard/predict/search/?q=${searchQuery}`);
            console.log('API Response:', response.data); // Debug log
            setSuggestions(response.data.coins);
        } catch (err) {
            console.error("Error searching coins:", err.response || err.message); // Enhanced error log
            setSuggestions([]);
        }
    };

    const debouncedSearch = useCallback(debounce(searchCoins, 300), []);

    const handleQueryChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        // If user types after selecting a coin, reset the selection
        if (selectedCoin && newQuery !== selectedCoin.name) {
            setSelectedCoin(null);
        }
        // If query is cleared/too short, also clear prediction to avoid accessing null selectedCoin
        if (newQuery.length < 2) {
            setPrediction(null);
            setSuggestions([]);
        } else {
            debouncedSearch(newQuery);
        }
    };

    const handleSelectCoin = (coin) => {
        setSelectedCoin(coin);
        setQuery(coin.name);
        setSuggestions([]);
        setPrediction(null);
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        if (!selectedCoin) {
            setError('Please select a coin first.');
            return;
        }
        setLoading(true);
        setError('');
        setPrediction(null);
        try {
            const response = await api.post('/dashboard/predict/', {
                coin_id: selectedCoin.id,
                days_ahead: daysAhead,
            });
            setPrediction(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while fetching the prediction.');
        }
        setLoading(false);
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'BULLISH':
                return <FontAwesomeIcon icon={faArrowUp} className="text-success" />;
            case 'BEARISH':
                return <FontAwesomeIcon icon={faArrowDown} className="text-danger" />;
            default:
                return <FontAwesomeIcon icon={faMinus} className="text-warning" />;
        }
    };

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title as="h2" className="text-center mb-4">
                                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                                Crypto Price Predictor
                            </Card.Title>
                            <Form onSubmit={handlePredict}>
                                <Form.Group className="mb-3 position-relative">
                                    <Form.Label><strong>Search for a Cryptocurrency</strong></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g., Bitcoin"
                                        value={query}
                                        onChange={handleQueryChange}
                                        autoComplete="off"
                                    />
                                    {suggestions.length > 0 && (
                                        <ListGroup className="position-absolute w-100" style={{ zIndex: 1000 }}>
                                            {suggestions.map(coin => (
                                                <ListGroup.Item key={coin.id} action onClick={() => handleSelectCoin(coin)}>
                                                    <img src={coin.image} alt={coin.name} width="20" className="me-2" />
                                                    {coin.name} ({coin.symbol})
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label><strong>Prediction Horizon (in days)</strong></Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={daysAhead}
                                        onChange={(e) => setDaysAhead(parseInt(e.target.value))}
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={loading || !selectedCoin}>
                                        {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <FontAwesomeIcon icon={faSearch} />}
                                        <span className="ms-2">{loading ? 'Predicting...' : 'Predict Price'}</span>
                                    </Button>
                                </div>
                            </Form>

                            {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
                        </Card.Body>
                    </Card>

                    {prediction && selectedCoin && (
                        <Card className="mt-4 shadow-sm">
                            <Card.Header as="h4" className="text-center">
                                Prediction for {selectedCoin.name} ({selectedCoin.symbol})
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6} className="text-center border-end">
                                        <h5>Current Price</h5>
                                        <p className="fs-4">${prediction.current_price.toLocaleString()}</p>
                                        <h5>Predicted Price ({daysAhead} days)</h5>
                                        <p className="fs-4 fw-bold text-primary">${prediction.predicted_price.toLocaleString()}</p>
                                    </Col>
                                    <Col md={6} className="text-center">
                                        <h5>Trend</h5>
                                        <p className={`fs-4 fw-bold text-${prediction.trend === 'BULLISH' ? 'success' : prediction.trend === 'BEARISH' ? 'danger' : 'warning'}`}>
                                            {getTrendIcon(prediction.trend)} {prediction.trend}
                                        </p>
                                        <h5>Potential Change</h5>
                                        <p className={`fs-4 fw-bold text-${prediction.price_change_percent >= 0 ? 'success' : 'danger'}`}>
                                            {prediction.price_change_percent.toFixed(2)}%
                                        </p>
                                    </Col>
                                </Row>
                                <hr />
                                <div className="text-center">
                                    <h5>Potential Profit/Loss on $1,000</h5>
                                    <p className={`fs-5 fw-bold text-${prediction.potential_profit_loss >= 0 ? 'success' : 'danger'}`}>
                                        ${prediction.potential_profit_loss.toFixed(2)}
                                    </p>
                                </div>
                                {/* <Alert variant="info" className="mt-3 small">
                                    <strong>Disclaimer:</strong> {prediction.disclaimer}
                                </Alert> */}
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Predictor;
