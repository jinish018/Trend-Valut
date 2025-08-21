import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.password_confirm) newErrors.password_confirm = 'Please confirm your password';
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await register(formData);
    
    if (result.success) {
      toast.success('Registration successful! Welcome to DejaVu NFT!');
      navigate('/dashboard', { replace: true });
    } else {
      if (typeof result.error === 'object') {
        setErrors(result.error);
      } else {
        setErrors({ general: result.error });
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="shadow border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-2">
                    <span className="text-primary">Trend</span> vault
                  </h2>
                  <p className="text-muted">Create your account</p>
                </div>
                
                {errors.general && (
                  <Alert variant="danger" className="mb-3">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errors.general}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          disabled={loading}
                          isInvalid={!!errors.first_name}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.first_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          disabled={loading}
                          isInvalid={!!errors.last_name}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.last_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
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
                      isInvalid={!!errors.email}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user me-2"></i>Username
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      disabled={loading}
                      isInvalid={!!errors.username}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-lock me-2"></i>Password
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        disabled={loading}
                        isInvalid={!!errors.password}
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
                    <Form.Control.Feedback type="invalid" className="d-block">
                      {errors.password}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Password must be at least 8 characters long
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <i className="fas fa-lock me-2"></i>Confirm Password
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="password_confirm"
                        value={formData.password_confirm}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        disabled={loading}
                        isInvalid={!!errors.password_confirm}
                        required
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                        type="button"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                    <Form.Control.Feedback type="invalid" className="d-block">
                      {errors.password_confirm}
                    </Form.Control.Feedback>
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>Create Account
                      </>
                    )}
                  </Button>
                </Form>
                
                <hr className="my-4" />
                
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account? 
                    <Link to="/login" className="text-decoration-none ms-2">
                      <strong>Sign in here</strong>
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4">
              <small className="text-muted">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
