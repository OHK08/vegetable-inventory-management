import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneNumber from '../components/PhoneNumber';

const Profile = ({ email }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: email || '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    vegetables: [],
  });
  const [vegetablesList, setVegetablesList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://omshreevegies-e5q6islzdq-uc.a.run.app/vegetables')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setVegetablesList(data);
      })
      .catch((err) => setError('Failed to load vegetables: ' + err.message));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVegetableCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let updatedVegetables = [...formData.vegetables];
    if (checked) {
      updatedVegetables.push(value);
    } else {
      updatedVegetables = updatedVegetables.filter((veg) => veg !== value);
    }
    setFormData({ ...formData, vegetables: updatedVegetables });
  };

  const handlePhoneVerified = (phone) => {
    setFormData({ ...formData, phone });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.phone) {
      setError('Please verify your phone number');
      return;
    }
    if (formData.role === 'vendor' && formData.vegetables.length === 0) {
      setError('Vendors must select at least one vegetable');
      return;
    }

    fetch('https://omshreevegies-e5q6islzdq-uc.a.run.app/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        vegetables: formData.vegetables,
        role: formData.role,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess('Profile created successfully!');
          setTimeout(() => navigate('/home'), 2000);
        }
      })
      .catch((err) => setError('Failed to create profile: ' + err.message));
  };

  return (
    <div className="container my-5" style={{ backgroundColor: '#e8f5e9', borderRadius: '10px', padding: '2rem' }}>
      <img
        src="https://www.merieuxnutrisciences.com/eu/wp-content/uploads/2023/04/Header-ObstGemuese_72dpi.jpg"
        alt="Vegetable Banner"
        className="img-fluid rounded mb-4"
        style={{ maxHeight: '250px', width: '100%', objectFit: 'cover' }}
      />
      <h2 className="text-success mb-4 text-center">Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" className="form-control" id="email" name="email" value={formData.email} readOnly />
        </div>

        <PhoneNumber onPhoneVerified={handlePhoneVerified} />

        <div className="mb-3">
          <label className="form-label d-block">Role</label>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="role" id="customer" value="customer" checked={formData.role === 'customer'} onChange={handleInputChange} />
            <label className="form-check-label" htmlFor="customer">Customer</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="role" id="vendor" value="vendor" checked={formData.role === 'vendor'} onChange={handleInputChange} />
            <label className="form-check-label" htmlFor="vendor">Vendor</label>
          </div>
        </div>

        {formData.role === 'vendor' && (
          <div className="mb-3">
            <label className="form-label">Select Vegetables</label>
            <div className="row">
              {vegetablesList.map((veg) => (
                <div className="col-md-4" key={veg._id}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={veg._id}
                      id={veg._id}
                      onChange={handleVegetableCheckboxChange}
                      checked={formData.vegetables.includes(veg._id)}
                    />
                    <label className="form-check-label" htmlFor={veg._id}>
                      {veg.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleInputChange} required />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button type="submit" className="btn btn-success w-100">Submit</button>
      </form>
    </div>
  );
};

export default Profile;
