import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import VegetableForm from './pages/VegetableForm';
import VegetableList from './pages/VegetableList';
import AddDailyStock from './pages/AddDailyStock';
import ViewDailyStock from './pages/ViewDailyStock';
import LoginPage from './pages/LoginPage';

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser && window.location.pathname === '/login') {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/vegetable-add"
          element={
            <ProtectedRoute user={user}>
              <VegetableForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vegetables"
          element={
            <ProtectedRoute user={user}>
              <VegetableList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-stock"
          element={
            <ProtectedRoute user={user}>
              <ViewDailyStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-stock/add"
          element={
            <ProtectedRoute user={user}>
              <AddDailyStock />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;