import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MobileEntry from './components/MobileEntry';
import OTPEntry from './components/OTPEntry';
import Dashboard from './components/Dashboard';
import CreateOrder from './components/CreateOrder';
import AllOrders from './components/AllOrders';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!user ? <MobileEntry /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/otp"
          element={!user ? <OTPEntry /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element=<Dashboard />
            />
        <Route
          path="/CreateOrder"
          element=<CreateOrder />
        />
        <Route
          path="/AllOrders"
          element=<AllOrders />
        />
      </Routes>
    </Router>
  );
};

export default App;
