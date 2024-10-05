import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { getDeviceId } from '../utils/device'; // Import the helper to get device ID
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';

const MobileEntry = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const deviceId = getDeviceId(); // Get the unique device ID

    try {
      const response = await api.post('Access/VerifyMobile', {
        PhoneNumber: mobileNumber,
        Device_Address: deviceId,  // Pass the device ID to the server
      });

      if (response.data.rescode === 0) {
        toast.success(response.data.resmsg);
        navigate('/otp', { state: { phoneNumber: mobileNumber } });
      } else {
        toast.error(response.data.resmsg);
      }
    } catch (error) {
      toast.error('API Error');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
      <Row className="w-100">
        <Col md={{ span: 4, offset: 4 }}>
          <Card className="p-4">
            <Card.Body>
              <div className="text-center">
                <img
                  src="https://click4delivery.in/content/assets/img/delivery-logo.png"
                  alt="Delivery Logo"
                  style={{ width: '250px', marginBottom: '20px' }}
                />
              </div>
              <h2 className="text-center mb-4">Login</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="mobileNumber">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="tel" // Input type to accept only numbers
                    pattern="[0-9]{10}" // Regex pattern to accept only 10 digits
                    placeholder="Enter 10-digit Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))} // Only allow digits
                    maxLength="10" // Limit input to 10 digits
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3">
                  Submit
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>

    // <form onSubmit={handleSubmit}>
    //   <input
    //     type="text"
    //     value={mobileNumber}
    //     onChange={(e) => setMobileNumber(e.target.value)}
    //     placeholder="Enter Mobile Number"
    //     maxLength="10"
    //   />
    //   <button type="submit">Submit</button>
    // </form>
  );
};

export default MobileEntry;
