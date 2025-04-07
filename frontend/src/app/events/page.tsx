"use client";

import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { useRouter } from 'next/navigation';

export default function EventsRouter() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
          // if no token, redirect to login
          router.push('/login');
          return;
        }

        // fetch user data to check role
        const response = await fetch('http://localhost:5001/me', {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const userData = await response.json();
        
        // redirect based on role
        if (userData.role === 'event_creator') {
          router.push('/host/events');
        } else {
          router.push('/user/events');
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        // on error, redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUserRoleAndRedirect();
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {loading && <Spin size="large" />}
    </div>
  );
}