import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Footer = () => {
  return (
    <footer className="bg-dark text-light mt-5 py-4">
      <Container>
        <Row>
          <Col lg={4} md={6} className="mb-4 mb-lg-0">
            <h5 className="mb-3">
              <span className="text-primary">Trend</span>vault
            </h5>
            <p className="text-muted">
              Your comprehensive cryptocurrency tracking platform. Stay updated with real-time 
              market data, manage your portfolio, and explore curated collections.
            </p>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h6 className="mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/dashboard" className="text-muted text-decoration-none">Dashboard</a></li>
              <li><a href="/highlights" className="text-muted text-decoration-none">Highlights</a></li>
              <li><a href="/all" className="text-muted text-decoration-none">All Coins</a></li>
              <li><a href="/portfolio" className="text-muted text-decoration-none">Portfolio</a></li>
            </ul>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h6 className="mb-3">Features</h6>
            <ul className="list-unstyled">
              <li><span className="text-muted">Real-time Price Tracking</span></li>
              <li><span className="text-muted">Portfolio Management</span></li>
              <li><span className="text-muted">Market Analytics</span></li>
              <li><span className="text-muted">Curated Collections</span></li>
            </ul>
          </Col>
          
          <Col lg={3} md={6}>
            <h6 className="mb-3">Data Source</h6>
            <p className="text-muted small">
              Market data provided by CoinGecko API. All prices and information are for 
              educational purposes only.
            </p>
            <div className="mt-3">
              <small className="text-muted">
                <FontAwesomeIcon icon="shield-alt" className="me-2" />
                Secure & Reliable
              </small>
            </div>
          </Col>
        </Row>
        
        <hr className="my-4 bg-secondary" />
        
        <Row className="align-items-center">
          <Col md={6}>
            <small className="text-muted">
              © 2025 TrendVault. All rights reserved.
            </small>
          </Col>
          {/* <Col md={6} className="text-md-end">
            <small className="text-muted">
              Made with <FontAwesomeIcon icon="heart" className="text-danger" /> using React & Django
            </small>
          </Col> */}
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
