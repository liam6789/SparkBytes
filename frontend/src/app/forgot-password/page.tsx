//forget password make changes to the msg error msg and success msg is swapped (user w exist get error)


'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const API_URL = 'http://localhost:5001'; // Your backend API URL

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');       // Store email input
  const [error, setError] = useState('');       // Store error messages
  const [success, setSuccess] = useState('');   // Store success messages
  const [loading, setLoading] = useState(false); // Track loading state
  const router = useRouter(); // Nav between pages

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Post req to the backend API
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      setSuccess(response.data.message); // Display success message
      setEmail(''); // Clear the email input field
    } catch (error: any) {
      setError(error?.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false); // Always end with stop loading indicator
    }
  };

  //  Forgot password form
  return (
    <div style={{
      minHeight: '600px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f7fa',
      padding: '16px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '32px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2' }}>
          <h2>
            Forgot your password?
          </h2>
          <p>
            Enter your email and we’ll send you a link to reset your password.
          </p>
        </div>

        {/* Success and error messages */}
        {(success || error) && (
          <div style={{
            color: 'green',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '10px',
            backgroundColor: '#e6ffea'
          }}>
            <p>
              If user exists, a verification email has been sent. Follow the instructions to reset your password.
            </p>
          </div>
        )}

        {/* Form starts */}
        <form onSubmit={handleSubmit}>
          {/* Email input field */}
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '10px',
            }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#f55536',
                color: 'white',
                border: 'none'
              }}
            >
              {loading ? 'Sending...' : 'Send Recovery Email'}
            </button>
          </div>

          {/* Link to login page */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link href="/login">
              Login instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
