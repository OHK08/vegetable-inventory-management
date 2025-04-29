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
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(null); // null: not checked, true: new, false: existing
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user exists in MongoDB
        try {
          const response = await fetch('https://omshreevegies-e5q6islzdq-uc.a.run.app/users/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email }),
          });
          const data = await response.json();
          if (data.error) {
            console.error('Error checking user:', data.error);
            setIsNewUser(false); // Default to existing user on error
          } else {
            setIsNewUser(!data.exists); // true if user doesn't exist
          }
          // Redirect based on user status
          if (data.exists && window.location.pathname === '/login') {
            navigate('/');
          } else if (!data.exists && window.location.pathname !== '/profile') {
            navigate('/profile');
          }
        } catch (error) {
          console.error('Error checking user:', error);
          setIsNewUser(false); // Default to existing user on error
        }
      } else {
        setIsNewUser(null);
      }
      setLoading(false);
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
          element={user ? <Navigate to={isNewUser ? '/profile' : '/home'} replace /> : <LoginPage />}
        />
        <Route
          path="/profile"
          element={
            user && isNewUser ? <Profile email={user.email} /> : <Navigate to="/home" replace />
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user}>
              <HomePage />
            </ProtectedRoute>
          }
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