import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { getDeviceId } from '../utils/device'; // Import the helper to get device ID
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import OtpInput from 'react-otp-input';

const OTPEntry = () => {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const { phoneNumber } = location.state || {};

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber) {
      toast.error('Phone number is missing');
      return;
    }

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    const deviceId = getDeviceId(); // Get the unique device ID

    try {
      // console.log(phoneNumber);

      const response = await api.post('Access/VerifyOTP', {
        PhoneNumber: phoneNumber,
        OTP: otp,
        Device_Address: deviceId,  // Pass the device ID to the server
      });

      if (response.data.rescode === 0) {
        Cookies.set('user', JSON.stringify(response.data.User), { expires: 7 });
        Cookies.set('Tokens', response.data.Tokens, { expires: 7 });
        window.location.href = '/dashboard';
      } else {
        toast.error('Invalid OTP');
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
              <Form onSubmit={handleOtpSubmit}>
                <Form.Group controlId="mobileNumber">
                  <Form.Label>Enter One Time Passwod (OTP)</Form.Label>
                  <Form.Control
                    type="tel" // Input type to accept only numbers
                    pattern="[0-9]{6}" // Regex pattern to accept only 10 digits
                    placeholder="Enter 6 Digit OTP "
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow digits
                    maxLength="6" // Limit input to 10 digits
                    required
                    className="text-center"
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

  );
};

export default OTPEntry;
