import React, { useState } from 'react';
import { Navbar as BSNavbar, Nav, Container, NavDropdown, Offcanvas, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  return (
    <>
      <BSNavbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow">
        <Container>
          <LinkContainer to="/dashboard">
            <BSNavbar.Brand className="fw-bold">
              <span className="text-primary">Trend</span>Vault
            </BSNavbar.Brand>
          </LinkContainer>
          
          <Button
            variant="outline-light"
            className="d-lg-none"
            onClick={handleShow}
          >
            <FontAwesomeIcon icon="bars" />
          </Button>

          <BSNavbar.Collapse id="basic-navbar-nav" className="d-none d-lg-flex">
            <Nav className="me-auto">
              <LinkContainer to="/dashboard">
                <Nav.Link>
                  <FontAwesomeIcon icon="tachometer-alt" className="me-2" />
                  Dashboard
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/highlights">
                <Nav.Link>
                  <FontAwesomeIcon icon="star" className="me-2" />
                  Highlights
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/all">
                <Nav.Link>
                  <FontAwesomeIcon icon="coins" className="me-2" />
                  All Coins
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/portfolio">
                <Nav.Link>
                  <FontAwesomeIcon icon="briefcase" className="me-2" />
                  Portfolio
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/collections">
                <Nav.Link>
                  <FontAwesomeIcon icon="layer-group" className="me-2" />
                  Collections
                </Nav.Link>
              </LinkContainer>
            </Nav>
            
            <Nav>
              <NavDropdown 
                title={
                  <span>
                    <FontAwesomeIcon icon="user" className="me-2" />
                    {user?.first_name || user?.username || 'User'}
                  </span>
                } 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Header>
                  <div className="fw-bold">{user?.full_name}</div>
                  <small className="text-muted">{user?.email}</small>
                </NavDropdown.Header>
                <NavDropdown.Divider />
                <LinkContainer to="/profile">
                  <NavDropdown.Item>
                    <FontAwesomeIcon icon="user-edit" className="me-2" />
                    Profile Settings
                  </NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FontAwesomeIcon icon="sign-out-alt" className="me-2" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </BSNavbar.Collapse>
        </Container>
      </BSNavbar>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas show={show} onHide={handleClose} placement="start" className="bg-dark text-light">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>
            <span className="text-primary">DejaVu</span> NFT
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <LinkContainer to="/dashboard" onClick={handleClose}>
              <Nav.Link className="text-light py-3 border-bottom">
                <FontAwesomeIcon icon="tachometer-alt" className="me-3" />
                Dashboard
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/highlights" onClick={handleClose}>
              <Nav.Link className="text-light py-3 border-bottom">
                <FontAwesomeIcon icon="star" className="me-3" />
                Highlights
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/all" onClick={handleClose}>
              <Nav.Link className="text-light py-3 border-bottom">
                <FontAwesomeIcon icon="coins" className="me-3" />
                All Coins
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/portfolio" onClick={handleClose}>
              <Nav.Link className="text-light py-3 border-bottom">
                <FontAwesomeIcon icon="briefcase" className="me-3" />
                Portfolio
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/collections" onClick={handleClose}>
              <Nav.Link className="text-light py-3 border-bottom">
                <FontAwesomeIcon icon="layer-group" className="me-3" />
                Collections
              </Nav.Link>
            </LinkContainer>
            
            <div className="mt-4 pt-3 border-top">
              <div className="px-3 mb-3">
                <div className="fw-bold text-light">{user?.full_name}</div>
                <small className="text-muted">{user?.email}</small>
              </div>
              <LinkContainer to="/profile" onClick={handleClose}>
                <Nav.Link className="text-light py-2">
                  <FontAwesomeIcon icon="user-edit" className="me-3" />
                  Profile Settings
                </Nav.Link>
              </LinkContainer>
              <Nav.Link className="text-light py-2" onClick={handleLogout}>
                <FontAwesomeIcon icon="sign-out-alt" className="me-3" />
                Logout
              </Nav.Link>
            </div>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Navbar;
