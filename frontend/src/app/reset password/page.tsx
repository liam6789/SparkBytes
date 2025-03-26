'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const API_URL = 'http://localhost:5001';  // Your FastAPI backend URL

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');    // Store new password
  const [confirmPassword, setConfirmPassword] = useState(''); // Store confirmation password
  const [error, setError] = useState('');                // Store error messages
  const [success, setSuccess] = useState('');            // Store success messages
  const [loading, setLoading] = useState(false);         // Track loading state
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');               // Extract token from URL

  // Handle password reset submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  };
}