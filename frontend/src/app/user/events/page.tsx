"use client";

import React, { useEffect, useState } from "react";
<<<<<<< HEAD
<<<<<<< HEAD
import { Typography, Button, Spin, Select, Space, Tag } from "antd";
import { FilterOutlined, ClockCircleOutlined } from "@ant-design/icons";
import EventCards from "../../components/event_card/eventcard";
import { EventData } from "../../../types/types";

const { Title, Paragraph } = Typography;
const { Option } = Select;
=======
import { Typography, Button, Spin } from "antd";
import Link from "next/link";
import EventCards from "../../components/event_card/eventcard";

const { Title, Paragraph } = Typography;
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
=======
import { Typography, Button, Spin, Select, Space, Tag } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import EventCards from "../../components/event_card/eventcard";

const { Title, Paragraph } = Typography;
const { Option } = Select;
>>>>>>> 4123f05 (implemented event filtering for dietary preferences and added food tags to event creation form)

interface Food {
  food_id: number;
  food_name: string;
  quantity: number;
  event_id: number;
<<<<<<< HEAD
<<<<<<< HEAD
  dietary_tags?: string;
=======
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
=======
  dietary_tags?: string;
>>>>>>> 4123f05 (implemented event filtering for dietary preferences and added food tags to event creation form)
}

<<<<<<< HEAD
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
<<<<<<< HEAD
=======
>>>>>>> 4123f05 (implemented event filtering for dietary preferences and added food tags to event creation form)
=======
>>>>>>> 0b8fe20 (implemented event duration filtering so users can view events that just started, ending soon etc)
const dietaryOptions = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-Free', value: 'gluten-free' },
  { label: 'Dairy-Free', value: 'dairy-free' },
  { label: 'Nut-Free', value: 'nut-free' },
  { label: 'Kosher', value: 'kosher' },
  { label: 'Halal', value: 'halal' }
];

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
=======
>>>>>>> 4123f05 (implemented event filtering for dietary preferences and added food tags to event creation form)
=======
// time filter options
const timeFilterOptions = [
  { label: 'All Events', value: 'all' },
  { label: 'Just Started (30 min)', value: 'just_started' },
  { label: 'Within the Hour', value: 'within_hour' },
  { label: 'Ending Soon', value: 'ending_soon' },
  { label: 'Running Now', value: 'running_now' },
  { label: 'Fresh Food Available', value: 'fresh_food' }
];

// freshness window options
const freshnessOptions = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 }
];

>>>>>>> 0b8fe20 (implemented event duration filtering so users can view events that just started, ending soon etc)
export default function UserEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [activeEvents, setActiveEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD
<<<<<<< HEAD
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [freshnessWindow, setFreshnessWindow] = useState<number>(30);

// fetch events based on filters
const fetchEvents = async (restrictions: string[] = [], timeFilterValue: string = 'all', freshnessValue: number = 30) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      throw new Error("No access token found. Please log in again.");
    }

    // build query parameters
    const queryParams = new URLSearchParams();
    
    if (restrictions.length > 0) {
      queryParams.append('dietary_restrictions', restrictions.join(','));
    }
    
    if (timeFilterValue !== 'all') {
      queryParams.append('time_filter', timeFilterValue);
    }
    
    if (timeFilterValue === 'fresh_food') {
      queryParams.append('freshness_window', freshnessValue.toString());
    }
    
    // determine endpoint
    const endpoint = `http://localhost:5001/events/filtered?${queryParams.toString()}`;

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
    const formattedData: EventData[] = data.map((event: any) => ({
      ...event,
      start_time: event.start_time || event.date, // Ensure start_time exists
      date: event.date || event.start_time // Ensure date exists
    }));
    setEvents(formattedData);

<<<<<<< HEAD
=======
=======
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
>>>>>>> 4123f05 (implemented event filtering for dietary preferences and added food tags to event creation form)

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

<<<<<<< HEAD
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
=======
  // handle filter changes
  const handleFilterChange = (value: string[]) => {
    setSelectedRestrictions(value);
    fetchEvents(value);
  };

>>>>>>> 4123f05 (implemented event filtering for dietary preferences and added food tags to event creation form)
  const pastEvents = events.filter(event => new Date(event.last_res_time) <= new Date());

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={1}>Available Events</Title>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 4123f05 (implemented event filtering for dietary preferences and added food tags to event creation form)
=======
    // filter active events
    const now = new Date();
    const active = formattedData.filter((event: EventData) => {
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
  fetchEvents(selectedRestrictions, timeFilter, freshnessWindow);
}, []);

// handle dietary filter changes
const handleDietaryFilterChange = (value: string[]) => {
  setSelectedRestrictions(value);
  fetchEvents(value, timeFilter, freshnessWindow);
};

// handle time filter changes
const handleTimeFilterChange = (value: string) => {
  setTimeFilter(value);
  fetchEvents(selectedRestrictions, value, freshnessWindow);
};

// handle freshness window changes
const handleFreshnessWindowChange = (value: number) => {
  setFreshnessWindow(value);
  if (timeFilter === 'fresh_food') {
    fetchEvents(selectedRestrictions, timeFilter, value);
  }
};

const pastEvents = events.filter(event => new Date(event.last_res_time) <= new Date());

// clear all filters
const handleClearFilters = () => {
  setSelectedRestrictions([]);
  setTimeFilter('all');
  setFreshnessWindow(30);
  fetchEvents([], 'all', 30);
};

// check if any filters are applied
const hasActiveFilters = selectedRestrictions.length > 0 || timeFilter !== 'all';

return (
  <div style={{ padding: "24px" }}>
    <div style={{ marginBottom: "24px" }}>
      <Title level={1}>Available Events</Title>
      
      {/* filter Section */}
      <div style={{ marginTop: "16px", marginBottom: "24px" }}>
        {/* dietary Restrictions Filter */}
        <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
          <span><FilterOutlined /> Dietary Restrictions:</span>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Select dietary restrictions"
            value={selectedRestrictions}
            onChange={handleDietaryFilterChange}
          >
            {dietaryOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </Space>
>>>>>>> 0b8fe20 (implemented event duration filtering so users can view events that just started, ending soon etc)
        
        {/* time Filter */}
        <Space direction="vertical" style={{ width: '100%' }}>
          <span><ClockCircleOutlined /> Event Timing:</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by time"
              value={timeFilter}
              onChange={handleTimeFilterChange}
            >
              {timeFilterOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
<<<<<<< HEAD
          </Space>
        </div>
<<<<<<< HEAD
=======
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
=======
>>>>>>> 4123f05 (implemented event filtering for dietary preferences and added food tags to event creation form)
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
<<<<<<< HEAD
          {selectedRestrictions.length > 0 
            ? "No events found matching your dietary restrictions. Try adjusting your filters."
            : "No active events available at the moment. Check back later!"}
=======
          No active events available at the moment. Check back later!
>>>>>>> 5be5b19 (edited events page so that users can see all active/past events and hosts can see active/past events they've created)
=======
          {selectedRestrictions.length > 0 
            ? "No events found matching your dietary restrictions. Try adjusting your filters."
            : "No active events available at the moment. Check back later!"}
>>>>>>> 4123f05 (implemented event filtering for dietary preferences and added food tags to event creation form)
        </Paragraph>
      )}

      {/* show past events */}
      {pastEvents.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <Title level={2}>Past Events</Title>
          <EventCards events={pastEvents} />
        </div>
      )}
=======
            
            {/* freshness Window (only show when Fresh Food filter is selected) */}
            {timeFilter === 'fresh_food' && (
              <Select
                style={{ width: '200px' }}
                placeholder="Freshness window"
                value={freshnessWindow}
                onChange={handleFreshnessWindowChange}
              >
                {freshnessOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            )}
          </div>
        </Space>
        
        {/* active Filters and clear Button */}
        {hasActiveFilters && (
          <div style={{ marginTop: '16px' }}>
            <Space wrap>
              {selectedRestrictions.map(restriction => {
                const option = dietaryOptions.find(opt => opt.value === restriction);
                return (
                  <Tag 
                    key={restriction} 
                    closable 
                    onClose={() => {
                      const newRestrictions = selectedRestrictions.filter(r => r !== restriction);
                      setSelectedRestrictions(newRestrictions);
                      fetchEvents(newRestrictions, timeFilter, freshnessWindow);
                    }}
                    color="green"
                  >
                    {option?.label || restriction}
                  </Tag>
                );
              })}
              
              {timeFilter !== 'all' && (
                <Tag 
                  closable 
                  onClose={() => {
                    setTimeFilter('all');
                    fetchEvents(selectedRestrictions, 'all', freshnessWindow);
                  }}
                  color="blue"
                >
                  {timeFilterOptions.find(opt => opt.value === timeFilter)?.label}
                  {timeFilter === 'fresh_food' && ` (${freshnessWindow} min)`}
                </Tag>
              )}
              
              <Button type="link" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </Space>
          </div>
        )}
      </div>
>>>>>>> 0b8fe20 (implemented event duration filtering so users can view events that just started, ending soon etc)
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
        {hasActiveFilters 
          ? "No events found matching your filters. Try adjusting your filters."
          : "No active events available at the moment. Check back later!"}
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