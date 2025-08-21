import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful! Welcome back!');
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={6} lg={5} xl={4}>
            <Card className="shadow border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-2">
                    <span className="text-primary">Trend</span> vault
                  </h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>
                
                {error && (
                  <Alert variant="danger" className="mb-3">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-envelope me-2"></i>Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      disabled={loading}
                      className="form-control-lg"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>
                      <i className="fas fa-lock me-2"></i>Password
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        disabled={loading}
                        className="form-control-lg"
                        required
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        type="button"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>Sign In
                      </>
                    )}
                  </Button>
                </Form>
                
                <hr className="my-4" />
                
                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account? 
                    <Link to="/register" className="text-decoration-none ms-2">
                      <strong>Sign up here</strong>
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4">
              <small className="text-muted">
                <i className="fas fa-shield-alt me-2"></i>
                Your data is secure and encrypted
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
