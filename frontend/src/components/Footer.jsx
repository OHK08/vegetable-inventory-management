import React from 'react';

const Footer = () => {
  return (
    <footer className="py-4" style={{ backgroundColor: '#218838', color: 'white', textAlign: 'center' }}>
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5>About Us</h5>
            <p>Hi! I am made by Omshree 😊</p>
          </div>
          <div className="col-md-4 mb-3">
            <h5>Contact</h5>
            <p>Email: info@farmfresh.com</p>
            <p>Phone: +012-3456789</p>
          </div>
          <div className="col-md-4 mb-3">
            <h5>Follow Us</h5>
            <a href="#" className="text-white me-2"><i className="bi bi-facebook fs-4"></i></a>
            <a href="#" className="text-white me-2"><i className="bi bi-twitter fs-4"></i></a>
            <a href="#" className="text-white"><i className="bi bi-instagram fs-4"></i></a>
          </div>
        </div>
        <p className="mt-3">&copy; 2025 FarmFresh. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;