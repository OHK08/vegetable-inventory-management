import React, { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';

const SignInWithGoogle = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="btn btn-success d-flex align-items-center justify-content-center w-100 py-2 shadow-sm"
      style={{ backgroundColor: '#28a745', borderColor: '#28a745', transition: 'all 0.3s' }}
    >
      {isLoading ? (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="me-2">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v3.2h5.59c-0.8,2.4-3.06,4.1-5.59,4.1c-3.35,0-6.07-2.72-6.07-6.07s2.72-6.07,6.07-6.07c1.62,0,3.09,0.64,4.19,1.68 l2.27-2.27C16.89,4.22,14.58,3.2,12,3.2c-4.97,0-9,4.03-9,9s4.03,9,9,9s8.8-3.83,8.8-8.6C20.8,11.84,20.37,11.1,21.35,11.1z" fill="#4285F4"/>
              <path d="M12,17.33c-2.83,0-5.13-2.3-5.13-5.13s2.3-5.13,5.13-5.13c1.37,0,2.67,0.55,3.64,1.53l-2.27,2.27 c-0.36-0.36-0.85-0.56-1.37-0.56c-1.07,0-1.93,0.86-1.93,1.93s0.86,1.93,1.93,1.93c0.98,0,1.79-0.73,1.9-1.68h-1.9V9.33h5.13 c0.09,0.47,0.14,0.96,0.14,1.47C17.33,14.13,15.03,17.33,12,17.33z" fill="#EA4335"/>
              <rect fill="none" height="24" width="24"/>
            </g>
          </svg>
          <span>Sign in with Google</span>
        </>
      )}
    </button>
  );
};

export default SignInWithGoogle;