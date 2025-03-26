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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email below and we’ll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Display error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Display success message */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {/* Email input field */}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}                              // ✅ Using the `email` state
                onChange={(e) => setEmail(e.target.value)}  // ✅ Updating state using `setEmail`
              />
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Sending...' : 'Send Recovery Email'}
            </button>
          </div>

          {/* Link to go back to login page */}
          <div className="text-sm text-center mt-4">
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Remembered your password? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}