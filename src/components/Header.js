import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Header = () => {
  const navigate = useNavigate();
  const userCookie = Cookies.get('user');
  const userObject = userCookie ? JSON.parse(userCookie) : null;

  // Handle logout function
  const handleLogout = () => {
    Cookies.remove('user');
    Cookies.remove('Tokens'); // Remove tokens if needed
    navigate('/'); // Redirect to login or home
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">MyApp</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/Dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/CreateOrder">Create Order</Nav.Link>
            <Nav.Link as={Link} to="/AllOrders">All Orders</Nav.Link>
          </Nav>
          <Navbar.Text className="me-3">
            Signed in as: <strong>{userObject?.Name}</strong>
          </Navbar.Text>
          <Button variant="outline-danger" onClick={handleLogout}>
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
