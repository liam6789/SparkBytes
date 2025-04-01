'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const API_URL = 'http://localhost:5001'; // API URL

export default function LoginPage() {
  const [email, setEmail] = useState(''); // store and update email input
  const [password, setPassword] = useState(''); // store and update password input
  const [error, setError] = useState(''); // track and display error messages
  const [loading, setLoading] = useState(false); // track loading state 
  const router = useRouter();

  // for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // send login credentials to backend API
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });
      // extract token and user data from form response
      const { access_token, user } = response.data;
      
      // store authentication data in local storage
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // configure axios to include the token in all future requests
      axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      
      // redirect to home page after successful login
      router.push('/');
    } catch (error: any) {
      // login failure -> error message
      setError(error?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f7fa',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '0.5rem'
          }}>
            Sign in to your account
          </h2>
          <p style={{
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Or{' '}
            <Link
              href="/register"
              style={{
                color: '#f55536',
                fontWeight: 500
              }}
            >
              create a new account
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              <span>{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#f55536',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}