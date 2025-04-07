'use client';

// Imports: components, effects, eventcard component, nav etc
import React, { useEffect, useState } from 'react';
import { Typography, Divider, Spin, Alert } from 'antd';
import EventCards from "../components/event_card/eventcard";
import { EventData } from '@/types/types';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const router = useRouter();

export default function HostProfile() {
  // Local states to store the events
  const [activeEvents, setActiveEvents] = useState<EventData[]>([]);
  const [archivedEvents, setArchivedEvents] = useState<EventData[]>([]);
  // Load and error fetch
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Token for local storage
        const token = localStorage.getItem('accessToken');
        // Backend requested
        const res = await fetch('http://localhost:5001/host/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Error msg if failed
        if (!res.ok) {
          throw new Error('Failed to load events');
        }

        // Initialising active, archive event lsits
        const data = await res.json();
        setActiveEvents(data.active_events || []);
        setArchivedEvents(data.archived_events || []);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    // Fetch events
    fetchEvents();
  }, []);

  // Loading
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Rendering article card
  return (
    <div style={{ padding: '40px 24px' }}>
      <Title level={2}>Your Active Events</Title>
      <EventCards events={activeEvents} />

      <Divider />

      <Title level={2}>Archived Events</Title>
      <EventCards events={archivedEvents} />
    </div>
  );
}
