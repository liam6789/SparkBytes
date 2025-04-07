"use client";

import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { Typography, Button, Spin, Select, Space, Tag } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import EventCards from "../../components/event_card/eventcard";

const { Title, Paragraph } = Typography;
const { Option } = Select;
=======
import { Typography, Button, Spin } from "antd";
import Link from "next/link";
import EventCards from "../../components/event_card/eventcard";

const { Title, Paragraph } = Typography;
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)

interface Food {
  food_id: number;
  food_name: string;
  quantity: number;
  event_id: number;
<<<<<<< HEAD
  dietary_tags?: string;
=======
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
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

<<<<<<< HEAD
const dietaryOptions = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-Free', value: 'gluten-free' },
  { label: 'Dairy-Free', value: 'dairy-free' },
  { label: 'Nut-Free', value: 'nut-free' },
  { label: 'Kosher', value: 'kosher' },
  { label: 'Halal', value: 'halal' }
];

=======
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
export default function UserEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);

  // fetch events based on filters
  const fetchEvents = async (restrictions: string[] = []) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        throw new Error("No access token found. Please log in again.");
      }

      // use filtered endpoint if restrictions exist
      const endpoint = restrictions.length > 0 
        ? `http://localhost:5001/events/filtered?dietary_restrictions=${restrictions.join(',')}`
        : 'http://localhost:5001/events/all';

      const response = await fetch(endpoint, {
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

      // filter active events
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

  useEffect(() => {
    fetchEvents();
  }, []);

  // handle filter changes
  const handleFilterChange = (value: string[]) => {
    setSelectedRestrictions(value);
    fetchEvents(value);
  };

=======

  // fetch all events using the new endpoint
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
          throw new Error("No access token found. Please log in again.");
        }

        const response = await fetch('http://localhost:5001/events/all', {
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

>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
  const pastEvents = events.filter(event => new Date(event.last_res_time) <= new Date());

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={1}>Available Events</Title>
<<<<<<< HEAD
        
        {/* simple dropdown filter */}
        <div style={{ marginTop: "16px", marginBottom: "24px" }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <span><FilterOutlined /> Dietary Restrictions:</span>
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Select dietary restrictions"
              value={selectedRestrictions}
              onChange={handleFilterChange}
            >
              {dietaryOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Space>
        </div>
=======
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
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
<<<<<<< HEAD
          {selectedRestrictions.length > 0 
            ? "No events found matching your dietary restrictions. Try adjusting your filters."
            : "No active events available at the moment. Check back later!"}
=======
          No active events available at the moment. Check back later!
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
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