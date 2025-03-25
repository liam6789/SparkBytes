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
}