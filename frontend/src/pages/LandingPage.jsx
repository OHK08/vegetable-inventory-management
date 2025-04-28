import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="container-fluid px-0" style={{ backgroundColor: '#f4fff4', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div
        className="p-5 mb-5 bg-success text-white shadow-lg animate__animated animate__fadeIn"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 100, 0, 0.7), rgba(0, 100, 0, 0.7)), url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAtcRUcGCK2F8Q5aDT-808ZGWUZJQP5AGDAkCsyzVpPA&s&ec=72940543)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-5">
          <h1 className="display-4 fw-bold">Welcome to Farm Fresh</h1>
          <p className="col-md-8 fs-4">
            Manage your vegetable inventory with ease. Track daily stock, add new vegetables, and explore stock history seamlessly.
          </p>
          <div className="d-flex gap-3">
            <Link to="/vegetables" className="btn btn-light btn-lg animate__animated animate__pulse animate__infinite">
              Explore Vegetables
            </Link>
            <Link to="/vegetable-add" className="btn btn-outline-light btn-lg">
              Add New Vegetable
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mb-5">
        <div className="text-center mb-5 animate__animated animate__fadeInUp">
          <h2 className="text-success">Explore Our Features</h2>
          <p className="text-muted">Discover how our app simplifies vegetable inventory management.</p>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 border-success shadow-sm animate__animated animate__fadeInLeft feature-card">
              <img
                src="https://www.maggi.co.uk/sites/default/files/fruits-and-vegetables.jpg"
                alt="Manage Vegetables"
                className="card-img-top"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h3 className="card-title text-success">Manage Vegetables</h3>
                <p className="card-text">
                  Add, edit, and delete vegetables with detailed information like price, stock, and images.
                </p>
                <Link to="/vegetables" className="btn btn-outline-success">View Vegetables</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-success shadow-sm animate__animated animate__fadeInUp feature-card">
              <img
                src="https://compote.slate.com/images/e88ca7fa-5a15-4dea-b0ae-9fbb3d329ee4.jpeg?crop=2847%2C1898%2Cx540%2Cy514&width=1560"
                alt="Track Daily Stock"
                className="card-img-top"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h3 className="card-title text-success">Track Daily Stock</h3>
                <p className="card-text">
                  Update daily stock quantities and prices, with support for daily images via Firebase Storage.
                </p>
                <Link to="/daily-stock/add" className="btn btn-outline-success">Add Stock</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-success shadow-sm animate__animated animate__fadeInRight feature-card">
              <img
                src="https://images.unsplash.com/photo-1540420828642-fca2c5c18abe?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
                alt="Stock History"
                className="card-img-top"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h3 className="card-title text-success">Stock History</h3>
                <p className="card-text">
                  Review past stock data to analyze trends and make informed inventory decisions.
                </p>
                <Link to="/stock-history" className="btn btn-outline-success">View History</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div
        className="p-5 mb-5 bg-light rounded-3 shadow-sm animate__animated animate__fadeIn"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1516594798947-e65505dbb29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="container py-4 bg-white bg-opacity-75 rounded-3 p-4">
          <h2 className="text-success mb-4">About the App</h2>
          <p className="lead">
            The Vegetable Inventory app is designed to streamline the management of vegetable stock for farmers, vendors, and markets. Built with React, MongoDB, and Firebase, it offers a user-friendly interface to:
          </p>
          <ul className="list-unstyled">
            <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Maintain a catalog of vegetables with detailed attributes.</li>
            <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Track daily stock updates with real-time data.</li>
            <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Store and retrieve stock history for analysis.</li>
            <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Upload images to Firebase for visual stock management.</li>
          </ul>
          <p>
            Start managing your inventory today with a modern, efficient, and visually appealing solution!
          </p>
          <Link to="/signup" className="btn btn-success btn-lg">Get Started</Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;