import React from 'react';
import Header from './Header'; // Import the Header component

const Layout = ({ children }) => {
  return (
    <div>
      <Header /> {/* Common header */}
      <main className="container mt-4">
        {children} {/* Render the page content here */}
      </main>
    </div>
  );
};

export default Layout;
