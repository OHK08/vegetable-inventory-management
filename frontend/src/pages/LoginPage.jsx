import React, { useState } from 'react';
import SignInWithGoogle from '../components/SignInWithGoogle';

const LoginPage = () => {
  const [error, setError] = useState('');

  const handleGoogleSuccess = (user) => {
    console.log('Signed in user:', user);
    // Redirect or update app state (e.g., navigate to dashboard)
    // Example: history.push('/dashboard');
  };

  const handleGoogleError = (error) => {
    setError('Failed to sign in with Google. Please try again.');
    console.error('Google sign-in error:', error);
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center login-page">
      <div className="row w-100">
        <div className="col-md-6 col-lg-4 mx-auto">
          <div className="card shadow-lg border-0 mt-3">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h1 className="display-4 fw-bold text-success">FARM FRESH</h1>
                <p className="text-muted">Vegetable Inventory Management System</p>
              </div>
              <div className="text-center mb-4">
                <img
                  src="https://habs.uq.edu.au/files/55381/why-eat-vegetables-2.jpg"
                  alt="Vegetables"
                  className="img-fluid rounded-circle shadow-sm"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              </div>
              <h3 className="text-center mb-4 fw-semibold text-dark">
                Welcome to FARM FRESH
              </h3>
              <p className="text-center text-muted mb-4">
                Sign in or sign up with your Google account to manage your vegetable inventory.
              </p>
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError('')}
                    aria-label="Close"
                  ></button>
                </div>
              )}
              <SignInWithGoogle onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-muted small">
              By signing in, you agree to our{' '}
              <a href="#" className="text-success text-decoration-none">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-success text-decoration-none">
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;