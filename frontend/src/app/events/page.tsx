"use client";

import React, { useEffect, useState } from "react";
import { Typography, Button, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import EventCards from "../components/event_card/eventcard";

const { Title, Paragraph } = Typography;

interface Food {
  food_id: number;
  food_name: string;
  quantity: number;
  event_id: number;
}

interface Event {
  event_id: number;
  event_name: string;
  description: string | null;
  date: string;
  creator_id: number | null;
  created_at: string;
  last_res_time: string;
  foods?: Food[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
          throw new Error("No access token found. Please log in again.");
        }

        const response = await fetch('http://localhost:5001/events', {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        
        const data = await response.json();
        setEvents(data);

        // filter active events (events that haven't ended yet)
        const now = new Date();
        const active = data.filter((event: Event) => {
          const endTime = new Date(event.last_res_time);
          return endTime > now;
        });

        setActiveEvents(active);
      } catch (error: any) {
        console.error("Error fetching events:", error.message);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Title level={1}>Active Events</Title>
        <Link href="/createevent">
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Create Event
          </Button>
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: "16px" }}>
            Loading events...
          </Paragraph>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Paragraph type="danger">
            {error}
          </Paragraph>
        </div>
      ) : activeEvents.length > 0 ? (
        <EventCards events={activeEvents} />
      ) : (
        <Paragraph style={{ textAlign: 'center' }}>
          No active events found. Create your first event!
        </Paragraph>
      )}

      {/* show past events */}
      {events.length > activeEvents.length && (
        <div style={{ marginTop: "24px" }}>
          <Title level={2}>Past Events</Title>
          <EventCards events={events.filter(event => 
            new Date(event.last_res_time) <= new Date()
          )} />
        </div>
      )}
    </div>
  );
}