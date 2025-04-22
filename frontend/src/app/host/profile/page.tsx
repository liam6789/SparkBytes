'use client';

// Imports: components, effects, eventcard component, nav etc
import React, { useEffect, useState } from 'react';
import { Typography, Divider, Spin, Alert, Card, Rate } from 'antd';
import { EventData } from '@/types/types';
import { useRouter } from 'next/navigation';
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function HostProfile() {
  // Local states to store the events
  const [activeEvents, setActiveEvents] = useState<EventData[]>([]);
  const [archivedEvents, setArchivedEvents] = useState<EventData[]>([]);
  // Load and error fetch
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch events on load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:5001/host/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load events');
        }

        const data = await res.json();
        setActiveEvents(data.active_events || []);
        setArchivedEvents(data.archived_events || []);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Loading spinner
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Render cards for a list of events
  const renderEventCards = (events: EventData[]) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
      {events.map((event) => (
        <Card
          key={event.event_id}
          hoverable
          style={{ height: '100%' }}
        >
          <Title level={3}>{event.event_name}</Title>
          <Paragraph>{event.description || "No description provided"}</Paragraph>

          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <CalendarOutlined style={{ marginRight: "8px" }} />
              <Text>{new Date(event.date).toLocaleDateString()}</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <ClockCircleOutlined style={{ marginRight: "8px" }} />
              <Text>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </div>
          </div>

          {/* Show average rating and RSVP count */}
          <Divider />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Text strong>Avg Rating: </Text>
              <Rate disabled allowHalf value={event.average_rating || 0} />
            </div>
            <div>
              <Text strong>RSVPs: </Text>
              {event.total_rsvp || 0}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Full page render
  return (
    <div style={{ padding: '40px 24px' }}>
      <Title level={2}>Your Active Events</Title>
      {activeEvents.length > 0 ? renderEventCards(activeEvents) : <Paragraph>No active events found.</Paragraph>}

      <Divider />

      <Title level={2}>Archived Events</Title>
      {archivedEvents.length > 0 ? renderEventCards(archivedEvents) : <Paragraph>No archived events found.</Paragraph>}
    </div>
  );
}
