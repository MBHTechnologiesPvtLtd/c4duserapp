import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../api';
import Cookies from 'js-cookie';
import moment from 'moment';
import { getDeviceId } from '../utils/device';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import Layout from './Layout';

const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [startDate, setStartDate] = useState(moment().format('MM/DD/YYYY')); // Default to current date
    const [endDate, setEndDate] = useState(moment().format('MM/DD/YYYY')); // Default to current date
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(''); // For status filter
    const [Delivery_Id, setDelivery_Id] = useState(''); // For status filter
    const intervalRef = useRef(null); // Reference to store interval ID


    const deviceId = getDeviceId();
    const userCookie = Cookies.get('user');
    const userObject = JSON.parse(userCookie);
    const Tokens = Cookies.get('Tokens');

    // Function to fetch orders from API
    const fetchOrders = async () => {
        setLoading(true);
        const requestParams = {
            Tokens: Tokens,
            UId: userObject.UID,
            Device_Address: deviceId,
            Delivery_Id: Delivery_Id || null,
            StartDate: startDate,
            EndDate: endDate,
            Status: status || null
        };

        try {
            const response = await api.post('/UserApi/MyOrders_Display', requestParams);
            if (response.data.rescode === 0) {
                setOrders(response.data.MyOrders); // Assuming the response contains "MyOrders"
            } else {
                toast.error('Error fetching orders');
            }
        } catch (error) {
            toast.error('Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 0:
                return 'Processing';
            case 1:
                return 'Confirmed';
            case 2:
                return 'Accepted';
            case 3:
                return 'Picked';
            case 4:
                return 'Delivered';
            case 5:
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };


    const startAutoRefresh = () => {
        // Clear existing interval before setting a new one
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            fetchOrders(); // Refresh orders every minute
        }, 30000); // 60 seconds interval
    };

    // Fetch orders on component mount
    useEffect(() => {
        fetchOrders();
        startAutoRefresh(); // Start auto-refresh when the component mounts
        return () => clearInterval(intervalRef.current);
    }, []);

    // Handle form submit to search by date range
    const handleSearch = (e) => {
        e.preventDefault();
        fetchOrders();
        startAutoRefresh();
    };

    return (
        <Layout>
            <Container className="mt-3">
                <h2>All Orders</h2>

                {/* Date Range Picker Form */}
                <Form onSubmit={handleSearch} className="mb-4">
                    <Row>
                        <Col md={3}>
                            <Form.Group controlId="startDate">
                                <Form.Label>Start Date</Form.Label>
                                <Flatpickr
                                    className="form-control"
                                    value={moment(startDate).format('DD/MM/YYYY')}
                                    onChange={(date) => setStartDate(date[0])}
                                    options={{ dateFormat: 'd/m/Y' }} // Display format: dd/MM/yyyy
                                />

                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="endDate">
                                <Form.Label>End Date</Form.Label>
                                <Flatpickr
                                    className="form-control"
                                    value={moment(endDate).format('DD/MM/YYYY')}
                                    onChange={(date) => setStartDate(date[0])}
                                    options={{ dateFormat: 'd/m/Y' }} // Display format: dd/MM/yyyy
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="status">
                                <Form.Label>Status</Form.Label>
                                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="">-- All Statuses --</option>
                                    <option value="0">Processing</option>
                                    <option value="1">Confirmed</option>
                                    <option value="2">Accepted</option>
                                    <option value="3">Picked</option>
                                    <option value="4">Delivered</option>
                                    <option value="5">Cancelled</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3} className="d-flex align-items-end">
                            <Button type="submit" variant="primary">Search</Button>
                        </Col>
                    </Row>
                </Form>


                {/* Display Orders */}
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>OrderID</th>
                                <th>Pickup Address</th>
                                <th>Drop Address</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <tr key={order.Order_Id}
                                        className={order.Status === 4 ? 'table-success' : (order.Status === 1 || order.Status === 2 || order.Status === 3) ? 'table-warning' : ''}
                                    >
                                        <td>{order.Delivery_Id}</td>
                                        <td>{order.Source_Name}-{order.Source_MobileNo}<br />{order.Source_Address}</td>
                                        <td>{order.Destination_Name}-{order.Destination_Mobile}<br />{order.Destination_Address}</td>
                                        <td>{moment(order.PickDate).format('DD/MM/yyyy hh:mm A')}</td>
                                        <td>{getStatusLabel(order.Status)} </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </Container>
        </Layout>
    );
};

export default AllOrders;
