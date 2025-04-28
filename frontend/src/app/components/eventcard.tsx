"use client";

import React, { useEffect, useState } from "react";
import { Card, Typography, Tag, List, Divider, Rate, Tooltip, Skeleton } from "antd";
import { CalendarOutlined, ClockCircleOutlined, CoffeeOutlined, StarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useRouter } from 'next/navigation';
import dayjs from "dayjs";
import { EventData } from "@/types/types";

const { Title, Paragraph, Text } = Typography;

interface EventCardsProps {
  events: EventData[];
}

// event card component with ratings
const EventCard = ({ event }: { event: EventData }) => {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // fetch ratings for specific event
  useEffect(() => {
    const fetchEventRatings = async () => {
      try {
        setLoading(true);
        
        // make sure event_id exists and is valid
        if (!event.event_id) {
          setLoading(false);
          return;
        }
        
        // use API endpoint
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await fetch(`https://sparkbytes.onrender.com/ratings/${event.event_id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ratings: ${response.status}`);
        }
        
        const data = await response.json();
        
        // calcualte average rating
        if (data.ratings && data.ratings.length > 0) {
          const sum = data.ratings.reduce((acc: number, r: any) => acc + r.rating, 0);
          setAverageRating(sum / data.ratings.length);
          setTotalRatings(data.ratings.length);
        } else {
          setAverageRating(null);
          setTotalRatings(0);
        }
      } catch (err) {
        setAverageRating(null);
        setTotalRatings(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEventRatings();
  }, [event.event_id]);

  // format dates
  const formatDate = (date: any) => {
    if (!date) return "Date not available";
    try {
      return dayjs(date).format("MMM D, YYYY");
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatTime = (date: any) => {
    if (!date) return "Time not available";
    try {
      return dayjs(date).format("h:mm A");
    } catch (e) {
      return "Invalid time";
    }
  };

  const dateToUse = event.start_time || event.date;

  return (
    <Card
      key={event.event_id}
      onClick={() => { router.push(`/events/${event.event_id}`) }}
      hoverable
      style={{ height: "100%" }}
      title={event.event_name}
    >
      <Paragraph>{event.description || "No description provided"}</Paragraph>
      
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <CalendarOutlined style={{ marginRight: "8px" }} />
          <Text>{formatDate(dateToUse)}</Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <ClockCircleOutlined style={{ marginRight: "8px" }} />
          <Text>{formatTime(dateToUse)}</Text>
        </div>
        
        {/* Location display */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <EnvironmentOutlined style={{ marginRight: "8px" }} />
          {event.location_address ? (
            <Text ellipsis={{ tooltip: event.location_address }}>
              {event.location_address}
            </Text>
          ) : (
            <Text type="secondary">No location provided</Text>
          )}
        </div>
        
        {/* Ratings display */}
        <div style={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
          <StarOutlined style={{ marginRight: "8px" }} />
          {loading ? (
            <Skeleton.Input active style={{ width: 120, height: 16 }} />
          ) : (
            <Tooltip title={`${totalRatings} rating${totalRatings !== 1 ? 's' : ''}`}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Rate 
                  disabled 
                  allowHalf 
                  value={averageRating || 0} 
                  style={{ fontSize: 14 }} 
                />
                <Text style={{ marginLeft: 8 }}>
                  {totalRatings > 0 
                    ? `${averageRating?.toFixed(1)} (${totalRatings})`
                    : "No ratings yet"}
                </Text>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
      
      {event.foods && event.foods.length > 0 && (
        <>
          <Divider orientation="left">
            <CoffeeOutlined /> Food Items
          </Divider>
          <List
            size="small"
            dataSource={event.foods}
            renderItem={(item) => (
              <List.Item>
                <Text>{item.food_name}</Text>
                <Tag color="green">{item.quantity}</Tag>
              </List.Item>
            )}
          />
        </>
      )}
    </Card>
  );
};

// main component
export default function EventCards({ events }: EventCardsProps) {
  // no available events
  if (!events || events.length === 0) {
    return (
      <div style={{ textAlign: "center", margin: "40px 0" }}>
        <Title level={4}>No events available</Title>
        <Paragraph>Create a new event to get started!</Paragraph>
      </div>
    );
  }

  // render in a grid
  return (
    <div className="event-cards-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
      {events.map((event) => (
        <EventCard key={event.event_id} event={event} />
      ))}
    </div>
  );
}