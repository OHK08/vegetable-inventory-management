import { useState } from 'react';
import { Link } from 'react-router-dom';
import UploadFile from '../components/UploadFile';

const VegetableForm = () => {
  const [vegetable, setVegetable] = useState({
    name: '',
    price: '',
    category: '',
    photo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUploadSuccess = (url) => {
    setVegetable({ ...vegetable, photo: url });
    setError('');
  };

  const handleInputChange = (field, value) => {
    if (field === 'price') {
      // Remove leading zeros and ensure valid number
      const cleanedValue = value.replace(/^0+/, '') || '0';
      setVegetable({ ...vegetable, [field]: cleanedValue });
    } else {
      setVegetable({ ...vegetable, [field]: value });
    }
  };

  const handleSubmit = async () => {
    console.log("Sending payload:", {
      ...vegetable,
      price: Number(vegetable.price),
    });
    setError('');
    setSuccess('');
    try {
      const response = await fetch('https://omshreevegies-e5q6islzdq-uc.a.run.app/vegetables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...vegetable,
          price: Number(vegetable.price),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create vegetable: HTTP ${response.status}`);
      }

      setSuccess('Vegetable created successfully!');
      setVegetable({ name: '', price: '', category: '', photo: '' });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message.includes('MongoDB') ? 'Unable to connect to the database. Please try again later.' : error.message);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Add New Vegetable</h2>
      <div className="card shadow-sm p-4">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')} aria-label="Close"></button>
          </div>
        )}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Enter vegetable name"
                value={vegetable.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                className="form-select"
                id="category"
                value={vegetable.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="stem">Stem</option>
                <option value="root">Root</option>
                <option value="bulb">Bulb</option>
                <option value="leaves">Leaves</option>
                <option value="fruits">Fruits</option>
                <option value="herb">Herb</option>
                <option value="seeds">Seeds</option>
                <option value="vegetable">Vegetable</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="price" className="form-label">Price (per kg)</label>
              <input
                type="text"
                className="form-control"
                id="price"
                placeholder="Enter price"
                value={vegetable.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Upload Vegetable Image</h5>
                <UploadFile onUploadSuccess={handleUploadSuccess} />
                {vegetable.photo && (
                  <div className="mt-3">
                    <img
                      src={vegetable.photo}
                      alt="Uploaded vegetable"
                      className="img-fluid rounded"
                      style={{ maxHeight: '150px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 text-center">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!vegetable.name.trim() || !vegetable.category || !vegetable.photo}
            >
              Create Vegetable
            </button>
            <Link to="/vegetables" className="btn btn-outline-secondary ms-2">
              View Vegetables
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VegetableForm;