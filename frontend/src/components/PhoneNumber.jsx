import React, { useState } from 'react';

const PhoneNumber = ({ onPhoneVerified }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    if (phone.length === 10 && /^\d+$/.test(phone)) {
      setIsOtpSent(true);
      setError('');
      alert('OTP sent: 1234'); // For demo purposes
    } else {
      setError('Please enter a valid 10-digit phone number');
    }
  };

  const handleVerifyOtp = () => {
    if (otp === '1234') {
      onPhoneVerified(phone);
      setError('');
    } else {
      setError('Invalid OTP. Please enter 1234');
    }
  };

  return (
    <div className="mb-3">
      <label htmlFor="phone" className="form-label">Phone Number</label>
      {!isOtpSent ? (
        <>
          <input
            type="text"
            className="form-control"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter 10-digit phone number"
          />
          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={handleSendOtp}
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            className="form-control"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP (1234)"
          />
          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={handleVerifyOtp}
          >
            Verify OTP
          </button>
        </>
      )}
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
};

export default PhoneNumber;