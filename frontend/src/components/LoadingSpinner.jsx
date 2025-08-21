import React from 'react';
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center min-vh-100">
      <FontAwesomeIcon icon="spinner" spin size="3x" className="text-primary mb-3" />
      <p className="text-muted">{message}</p>
    </Container>
  );
};

export default LoadingSpinner;
