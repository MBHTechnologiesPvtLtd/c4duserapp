import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { getDeviceId } from '../utils/device'; // Import the helper to get device ID
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import Layout from './Layout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const deviceId = getDeviceId();
  const userCookie = Cookies.get('user');
 
  const Tokens = Cookies.get('Tokens');

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log(userCookie);
      console.log(deviceId);

      if (!userCookie) {
        handleLogout();
        return;
      }
      try {
        const userObject = JSON.parse(userCookie);
        const response = await api.post('UserApi/UserProfile', {
          Tokens: Tokens,
          UId: userObject.UID,
          Device_Address: deviceId,  // Pass the device ID to the server
        });

        if (response.data.rescode === 0) {
          toast.success('Welcome User');
          Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
          setUserProfile(response.data.user); // Update state with new user data
        } else {
          toast.error('Error fetching profile');
          handleLogout(); // Logout on unsuccessful response
        }
      } catch (error) {
        toast.error('Error fetching profile');
        handleLogout();
      }
    };
    fetchUserProfile();
  }, [Tokens, deviceId, userCookie]);

  const handleLogout = () => {
    Cookies.remove('user');
    Cookies.remove('Tokens');
    window.location.href = '/';
  };

  if (!userProfile) return <div>Loading...</div>;

  return (
    <Layout>
    <Container className="mt-5">
    <Row className="justify-content-center">
      <Col md={6}>
        <Card className="p-4">
          <Card.Body>
            <h1 className="text-center mb-4">Welcome, {userProfile.Name}!</h1> 
            <h3 className="text-center mb-4">Wallet Balance: ₹{userProfile.WalletBalance}</h3>

            <div className="text-center">
              <Button
                variant="primary"
                className="mb-3"
                onClick={() => navigate('/createorder')}
              >
                Create Order
              </Button> <br />
              <Button
                variant="primary"
                className="mb-3"
                onClick={() => navigate('/AllOrders')}
              >
                All Orders
              </Button>
              <br />
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
  </Layout>
  );
};

export default Dashboard;
