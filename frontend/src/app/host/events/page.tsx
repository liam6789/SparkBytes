// grab the most recent event of the creator and display
// how many rsvp, location (additional)
// event name, description, start time, last reservation, count of food items (select by id = id), reservation has an id
// view all active and past events the host has created

'use client';

import { useEffect, useState } from "react";
import { Typography, Card, Tag, Button, Spin } from "antd";
import { useRouter } from "next/navigation";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import EventCards from "../../components/eventcard";
import { EventData } from "@/types/types";

const { Title, Paragraph, Text } = Typography;

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
  location?: string;
  rsvp_count: number;
  food_count: number;
  foods: Food[];
}

export default function HostEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [activeEvents, setActiveEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // fetch only the current user's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
          throw new Error("No access token found. Please log in again.");
        }

        const response = await fetch('https://sparkbytes.onrender.com/events', {
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

  const pastEvents = events.filter(event => new Date(event.last_res_time) <= new Date());

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Title level={1}>My Events</Title>
        <Link href="../../host/createevent">
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
          You haven't created any active events yet.
        </Paragraph>
      )}

      {/* show past events */}
      {pastEvents.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <Title level={2}>Past Events</Title>
          <EventCards events={pastEvents} />
        </div>
      )}
    </div>
  );
}