import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UploadFile from '../components/UploadFile';

const VegetableList = () => {
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editVegetable, setEditVegetable] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Cache key for localStorage
  const VEGETABLES_CACHE_KEY = 'cached_vegetables';

  // Validate ObjectId format (24-character hexadecimal)
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // Fetch all vegetables on mount
  useEffect(() => {
    const fetchVegetables = async () => {
      try {
        console.log('Fetching vegetables...');
        const response = await fetch('https://omshreevegies-e5q6islzdq-uc.a.run.app/vegetables');
        if (!response.ok) {
          throw new Error(`Failed to fetch vegetables: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched vegetables:', data);
        setVegetables(data);
        // Cache vegetables in localStorage
        localStorage.setItem(VEGETABLES_CACHE_KEY, JSON.stringify(data));
        if (data.length === 0) {
          setError('No vegetables found. Add vegetables to proceed.');
        }
      } catch (err) {
        console.error('Fetch vegetables error:', err);
        // Load from cache if available
        const cachedVegetables = localStorage.getItem(VEGETABLES_CACHE_KEY);
        if (cachedVegetables) {
          const parsedData = JSON.parse(cachedVegetables);
          setVegetables(parsedData);
          setError('Failed to fetch vegetables from server. Using cached data.');
        } else {
          setError('Unable to load vegetables due to server error. Please try again.');
          setVegetables([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // Load cached vegetables immediately if available
    const cachedVegetables = localStorage.getItem(VEGETABLES_CACHE_KEY);
    if (cachedVegetables) {
      const parsedData = JSON.parse(cachedVegetables);
      setVegetables(parsedData);
      console.log('Loaded cached vegetables:', parsedData);
    }

    fetchVegetables();
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    if (!isValidObjectId(id)) {
      setError('Invalid vegetable ID format');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this vegetable?')) return;
    try {
      const response = await fetch(`https://omshreevegies-e5q6islzdq-uc.a.run.app/vegetables/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete vegetable');
      }
      setVegetables(vegetables.filter((veg) => veg._id !== id));
      setSuccess('Vegetable deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle edit
  const handleEdit = (vegetable) => {
    console.log('Editing vegetable with _id:', vegetable._id);
    if (!isValidObjectId(vegetable._id)) {
      setError('Invalid vegetable ID format');
      return;
    }
    setEditVegetable({
      ...vegetable,
      price: vegetable.price.toString(),
    });
    setShowModal(true);
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!editVegetable.name.trim() || !editVegetable.category || !editVegetable.photo) {
      setError('Name, category, and photo are required');
      return;
    }
    const id = editVegetable._id.trim();
    if (!isValidObjectId(id)) {
      setError('Invalid vegetable ID format');
      return;
    }
    const payload = {
      name: editVegetable.name,
      category: editVegetable.category,
      price: Number(editVegetable.price),
      photo: editVegetable.photo,
    };
    console.log('PUT request:', {
      url: `https://omshreevegies-e5q6islzdq-uc.a.run.app/vegetables/${id}`,
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    try {
      const response = await fetch(`https://omshreevegies-e5q6islzdq-uc.a.run.app/vegetables/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update vegetable (HTTP ${response.status})`);
      }
      setVegetables(
        vegetables.map((veg) =>
          veg._id === id
            ? { ...editVegetable, price: Number(editVegetable.price) }
            : veg
        )
      );
      setSuccess('Vegetable updated successfully!');
      setShowModal(false);
      setEditVegetable(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('PUT error:', err.message);
      setError(err.message);
    }
  };

  // Handle input changes in edit modal
  const handleInputChange = (field, value) => {
    if (field === 'price') {
      const cleanedValue = value.replace(/^0+/, '') || '0';
      setEditVegetable({ ...editVegetable, [field]: cleanedValue });
    } else {
      setEditVegetable({ ...editVegetable, [field]: value });
    }
  };

  // Handle photo upload
  const handleUploadSuccess = (url) => {
    setEditVegetable({ ...editVegetable, photo: url });
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 text-success animate__animated animate__fadeIn">Vegetable Inventory</h2>
      <div className="mb-4 text-center">
        <Link to="/vegetable-add" className="btn btn-success btn-lg animate__animated animate__pulse animate__infinite">
          Add New Vegetable
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show animate__animated animate__shakeX" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show animate__animated animate__fadeIn" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')} aria-label="Close"></button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Vegetable Cards */}
      {!loading && vegetables.length === 0 && (
        <p className="text-center text-muted animate__animated animate__fadeIn">No vegetables found. Add some to get started!</p>
      )}
      {!loading && vegetables.length > 0 && (
        <div className="row g-3">
          {vegetables.map((veg) => (
            <div key={veg._id} className="col-12 col-md-3">
              <div className="card h-100 border-success shadow-sm animate__animated animate__fadeInUp vegetable-card">
                <img
                  src={veg.photo || 'https://via.placeholder.com/150'}
                  alt={veg.name}
                  className="card-img-top"
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <div className="card-body p-3">
                  <h5 className="card-title text-success mb-2 text-truncate">{veg.name}</h5>
                  <p className="card-text small">
                    <strong>Category:</strong> {veg.category.charAt(0).toUpperCase() + veg.category.slice(1)}<br />
                    <strong>Price:</strong> ₹{veg.price} per kg<br />
                    <strong>Added:</strong> {new Date(veg.createdAt).toLocaleDateString()}
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm flex-grow-1"
                      onClick={() => handleEdit(veg)}
                    >
                      <i className="bi bi-pencil-fill me-1"></i>Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm flex-grow-1"
                      onClick={() => handleDelete(veg._id)}
                    >
                      <i className="bi bi-trash-fill me-1"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editVegetable && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Vegetable</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="edit-name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="edit-name"
                    value={editVegetable.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-category" className="form-label">Category</label>
                  <select
                    className="form-select"
                    id="edit-category"
                    value={editVegetable.category}
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
                <div className="mb-3">
                  <label htmlFor="edit-price" className="form-label">Price (per kg)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="edit-price"
                    value={editVegetable.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Vegetable Image</label>
                  <UploadFile onUploadSuccess={handleUploadSuccess} />
                  {editVegetable.photo && (
                    <img
                      src={editVegetable.photo}
                      alt="Vegetable"
                      className="img-fluid rounded mt-3"
                      style={{ maxHeight: '150px' }}
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleEditSubmit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VegetableList;