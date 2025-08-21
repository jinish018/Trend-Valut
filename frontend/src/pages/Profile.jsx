import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaSave, FaUserEdit } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile update state
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    if (profileError) setProfileError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    if (passwordError) setPasswordError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');

    const result = await updateProfile(profileData);
    
    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      if (typeof result.error === 'object') {
        setProfileError(JSON.stringify(result.error));
      } else {
        setProfileError(result.error);
      }
    }
    
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');

    const result = await changePassword({
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
      new_password_confirm: passwordData.new_password_confirm
    });
    
    if (result.success) {
      toast.success('Password changed successfully!');
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
      });
    } else {
      if (typeof result.error === 'object') {
        setPasswordError(JSON.stringify(result.error));
      } else {
        setPasswordError(result.error);
      }
    }
    
    setPasswordLoading(false);
  };

  return (
    <Container fluid className="px-3 px-md-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h2 mb-2">
            <FaUser className="me-3 text-primary" />
            Profile Settings
          </h1>
          <p className="text-muted">
            Manage your account settings and preferences
          </p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0">
              <div className="text-center py-3">
                <div className="position-relative d-inline-block">
                  <div 
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <FaUser size="2rem" className="text-white" />
                  </div>
                </div>
                <h4 className="mt-3 mb-1">{user?.full_name || user?.username}</h4>
                <p className="text-muted">{user?.email}</p>
              </div>
            </Card.Header>

            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(tab) => setActiveTab(tab)}
                className="mb-4"
                fill
              >
                <Tab eventKey="profile" title={
                  <span>
                    <FaUserEdit className="me-2" />
                    Profile Information
                  </span>
                }>
                  <Form onSubmit={handleProfileSubmit}>
                    {profileError && (
                      <Alert variant="danger" className="mb-3">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {profileError}
                      </Alert>
                    )}

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="first_name"
                            value={profileData.first_name}
                            onChange={handleProfileChange}
                            placeholder="Enter first name"
                            disabled={profileLoading}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="last_name"
                            value={profileData.last_name}
                            onChange={handleProfileChange}
                            placeholder="Enter last name"
                            disabled={profileLoading}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Email address cannot be changed
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={user?.username || ''}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Username cannot be changed
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone_number"
                        value={profileData.phone_number}
                        onChange={handleProfileChange}
                        placeholder="Enter phone number"
                        disabled={profileLoading}
                      />
                    </Form.Group>

                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-100"
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="password" title={
                  <span>
                    <FaLock className="me-2" />
                    Change Password
                  </span>
                }>
                  <Form onSubmit={handlePasswordSubmit}>
                    {passwordError && (
                      <Alert variant="danger" className="mb-3">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {passwordError}
                      </Alert>
                    )}

                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showOldPassword ? 'text' : 'password'}
                          name="old_password"
                          value={passwordData.old_password}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          disabled={passwordLoading}
                          required
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          disabled={passwordLoading}
                          type="button"
                        >
                          {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showNewPassword ? 'text' : 'password'}
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          disabled={passwordLoading}
                          required
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={passwordLoading}
                          type="button"
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Password must be at least 8 characters long
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="new_password_confirm"
                          value={passwordData.new_password_confirm}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          disabled={passwordLoading}
                          required
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={passwordLoading}
                          type="button"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </InputGroup>
                    </Form.Group>

                    <Button 
                      type="submit" 
                      variant="warning" 
                      className="w-100"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Changing...
                        </>
                      ) : (
                        <>
                          <FaLock className="me-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
