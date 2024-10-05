import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { getDeviceId } from '../utils/device'; // Import the helper to get device ID
import Cookies from 'js-cookie';
import moment from 'moment';
import Layout from './Layout';

const CreateOrder = () => {
    const PickupTime = new Date(); // Current date and time
    const formattedDate = moment(PickupTime).format('MM/DD/YYYY hh:mm A'); // Format date


    const deviceId = getDeviceId();
    const userCookie = Cookies.get('user');
    const userObject = JSON.parse(userCookie);
    const Tokens = Cookies.get('Tokens');

    const [addresses, setAddresses] = useState([]);
    const [pickupAddress, setPickupAddress] = useState({ address: '', name: '', mobile: '', lat: '', });
    const [dropAddress, setDropAddress] = useState({ address: '', name: '', mobile: '', lat: '', });
    const navigate = useNavigate();

    useEffect(() => {

        const fetchAddresses = async () => {
            try {
                const response = await api.post('UserApi/User_AddressList', {
                    Tokens: Tokens,
                    UId: userObject.UID,
                    Device_Address: deviceId,  // Pass the device ID to the server
                });

                if (response.data.rescode === 0) {
                    setAddresses(response.data.MyAddresses);
                } else {
                    toast.error('Error fetching Addresses');
                }
            } catch (error) {
                toast.error('Error fetching Addresses');
            }
        };

        fetchAddresses();
    }, []);

    const handleAddressSelect = (event, type) => {
        const selectedId = event.target.value;
        const addressObject = addresses.find((address) => address.Add_ID == selectedId);
        const addressData = {
            address: addressObject.Add_Address || '',
            name: addressObject.Add_Name || '',
            mobile: addressObject.Add_Mobile || '',
            lat: addressObject.Add_Latlong || '',
        };

        if (type === 'pickup') {
            setPickupAddress(addressData);
        } else {
            setDropAddress(addressData);
        }

    };

    const handleChange = (event, type) => {
        const { name, value } = event.target;
        if (type === 'pickup') {
            setPickupAddress({ ...pickupAddress, [name]: value });
        } else if (type === 'drop') {
            setDropAddress({ ...dropAddress, [name]: value });
        }
    };

    const validateLatLong = (latLongStr) => {
        // Split the input string into latitude and longitude
        const [latStr, longStr] = latLongStr.split(',');

        // Convert strings to floating-point numbers
        const lat = parseFloat(latStr);
        const long = parseFloat(longStr);

        // Check if latitude and longitude are valid numbers
        if (isNaN(lat) || isNaN(long)) {
            return false; // Not valid if either is NaN
        }

        // Validate latitude: must be between -90 and 90
        if (lat < -90 || lat > 90) {
            return false; // Invalid latitude
        }

        // Validate longitude: must be between -180 and 180
        if (long < -180 || long > 180) {
            return false; // Invalid longitude
        }

        // If both checks pass, it's valid
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        if (pickupAddress.mobile.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }
        if (dropAddress.mobile.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        if (!validateLatLong(pickupAddress.lat)) {
            toast.error('Invalid Source LatLong');
            return;
        }

        if (!validateLatLong(dropAddress.lat)) {
            toast.error('Invalid Destination LatLong');
            return;
        }


        try {

            var requestparam = {
                Tokens: Tokens,
                UId: userObject.UID,
                Device_Address: deviceId,
                Source_Gaddress: pickupAddress.address,
                Source_Address: pickupAddress.address,
                Source_latLong: pickupAddress.lat,
                Source_Name: pickupAddress.name,
                Source_City: 'Bharuch',
                Source_MobileNo: pickupAddress.mobile,
                Source_Amount: 0.0,
                Destination_Gaddress: dropAddress.address,
                Destination_Address: dropAddress.address,
                Destination_latlong: dropAddress.lat,
                Destination_Name: dropAddress.name,
                Destination_City: 'Bharuch',
                Destination_Mobile: dropAddress.mobile,
                Destination_Amount: 0.0,
                OrderDescription: formData.get('description'),
                Weight: formData.get('weight'),
                Order_Contains: 'food',
                PickDate: formattedDate,
                Subscription_Days: 1,
                PaymentType: 1,
                VehicleId: 1,
                Secured: 0,
                AvoidRing: 0,
                LeaveatDoor: 0,
                LeavewithSecurity: 0,
                Order_Shift: 0,
                usewallet: 1,
                PilotTip: 0
            };

            const response = await api.post('/UserApi/CreateOrders', requestparam);
            if (response.data.rescode === 0) {
                if (response.data.Order.Amount_Online > 0) {
                    toast.error('Sorry, Your Wallet Don have enough balance, Please Topup our Wallet First.');
                } else {
                    handleVerifyPayment(response);
                    // const response = await api.post(`/UserApi/Verify_Payment?Deliverrid=${response.data.Order.Delivery_Id}`);
                    toast.success(response.data.resmsg);
                    navigate('/AllOrders'); // Redirect to All Orders page
                }
            } else {
                toast.error(response.data.resmsg);
            }
        } catch (error) {
            toast.error('Error submitting order');
        }
    };

    const handleVerifyPayment = async (response) => {
        try {
            const deliveryId = response.data.Order.Delivery_Id;
            if (!deliveryId) {
                console.error("Delivery_Id is undefined");
                return;
            }
            const apiResponse = await api.post(`/UserApi/Verify_Payment?Deliverrid=${deliveryId}`);
            console.log(apiResponse.data); // Do something with the response
        } catch (error) {
            console.error("Error verifying payment:", error);
        }
    };

    return (
        <Layout>
            <Container className="mt-3">

                <Form onSubmit={handleSubmit}>
                    <Row>
                        {/* Pickup Address Form */}
                        <Col md={4}>
                            <h4>Source Address</h4>
                            <Form.Group className="mb-2">
                                <Form.Label>Select Pickup Address:</Form.Label>
                                <Form.Select value={pickupAddress.id || ''} onChange={(e) => handleAddressSelect(e, 'pickup')}>
                                    <option value="">-- Select Address --</option>
                                    {addresses.map((address) => (
                                        <option key={address.Add_ID} value={address.Add_ID}>
                                            {address.Add_Name} - {address.Add_Mobile} -  {address.Add_Address.length > 30
                                                ? `${address.Add_Address.slice(0, 30)}...`
                                                : address.Add_Address}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Address:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={pickupAddress.address}
                                    onChange={(e) => handleChange(e, 'pickup')}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Name:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={pickupAddress.name}
                                    onChange={(e) => handleChange(e, 'pickup')}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Mobile:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="mobile"
                                    value={pickupAddress.mobile}
                                    onChange={(e) => handleChange(e, 'pickup')}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Location:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lat"
                                    value={pickupAddress.lat}
                                    onChange={(e) => handleChange(e, 'pickup')}
                                    required
                                />
                            </Form.Group>

                        </Col>

                        {/* Drop Address Form */}
                        <Col md={4}>
                            <h4>Destination Address</h4>
                            <Form.Group className="mb-2">
                                <Form.Label>Select Drop Address:</Form.Label>
                                <Form.Select value={dropAddress.id || ''} onChange={(e) => handleAddressSelect(e, 'drop')}>
                                    <option value="">-- Select Address --</option>
                                    {addresses.map((address) => (
                                        <option key={address.Add_ID} value={address.Add_ID}>
                                            {address.Add_Name} - {address.Add_Mobile} -  {address.Add_Address.length > 30
                                                ? `${address.Add_Address.slice(0, 30)}...`
                                                : address.Add_Address}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Address:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={dropAddress.address}
                                    onChange={(e) => handleChange(e, 'drop')}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Name:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={dropAddress.name}
                                    onChange={(e) => handleChange(e, 'drop')}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Mobile:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="mobile"
                                    value={dropAddress.mobile}
                                    onChange={(e) => handleChange(e, 'drop')}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Location:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lat"
                                    value={dropAddress.lat}
                                    onChange={(e) => handleChange(e, 'drop')}
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <h4>Order Details</h4>
                            <Form.Group className="mb-2">
                                <Form.Label>Description:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="description"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Weight (Kg):</Form.Label>
                                <Form.Select name="weight">
                                    <option value="3">3 Kg</option>
                                    <option value="5">5 Kg</option>
                                    <option value="10">10 Kg</option>
                                    <option value="15">15 Kg</option>
                                </Form.Select>
                            </Form.Group>
                            <Button variant="primary" type="submit" className="mt-3">
                                Submit
                            </Button>
                        </Col>

                    </Row>


                </Form>
            </Container>
        </Layout>
    );
};

export default CreateOrder;
