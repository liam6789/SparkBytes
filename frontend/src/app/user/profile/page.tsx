'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Spin, Alert, Tag, Divider, Switch } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

interface Reservation {
  res_id: number;
  res_time: string;
  quantity: number;
  note: string;
  food_name: string;
  events: {
    event_id: number;
    event_name: string;
    description: string;
    start_time: string;
    last_res_time: string;
  };
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opted, setOpted] = useState(false);
  const [welcome, setWelcome] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Fetch reservation data
    const fetchReservations = async () => {
      try {
        // Auth token and API requestion
        const token = localStorage.getItem('accessToken');
        const res = await fetch('https://sparkbytes.onrender.com/user/reservations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Response error message
        if (!res.ok) throw new Error('Failed to fetch reservations');

        // Interpret, update state
        const data = await res.json();
        setReservations(data.reservations || []);

        // Error messages
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Something went wrong');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const optVal = JSON.parse(user).optin
      const name = JSON.parse(user).name
      const message = "Welcome " + name + "!!!"
      setWelcome(message)
      if (optVal != null) {
        setOpted(optVal)
      } 
    }
  },[]) 

  useEffect(() => {
    const OptUpdate = async() => {
      const token = localStorage.getItem("accessToken");
      await fetch(`https://sparkbytes.onrender.com/optupdate/${opted}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      })
    }
    
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const user = localStorage.getItem("user")
    if (user) {
      const userObj = JSON.parse(user)
      userObj.optin = opted
      localStorage.setItem("user", JSON.stringify(userObj))
    }
    OptUpdate()
  }, [opted])

  // Loading phase
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error fetch data
  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <Alert type="error" message="Error" description={error} />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px' }}>
      <Title level={1}>{welcome}</Title>
      <Title level={2}>Opt In To Email Notifications?</Title>
      <Switch
        value={opted}
        checkedChildren={"Yes"}
        unCheckedChildren={"No"}
        onClick={() => {
          setOpted(!opted)
        }}
      ></Switch>
      <Title level={2}>My Reservations</Title>

    {/* Message when no reservations found */}
      {reservations.length === 0 ? (
        <Paragraph>No reservations yet. Go grab some food! :-P</Paragraph>
      ) : (
        reservations.map((res) => (
          // Card render like article
          <Card key={res.res_id} style={{ marginBottom: '24px' }}>
            <Title level={4}>{res.events.event_name}</Title>
            <Paragraph>{res.events.description || 'No event description'}</Paragraph>

            {/* Tags for food, quantity, reservation and event time */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Tag color="blue">{res.food_name}</Tag>
              <Tag color="green">Qty: {res.quantity}</Tag>
              <Tag icon={<ClockCircleOutlined />} color="default">
                Reserved: {dayjs(res.res_time).format('MMM D, YYYY h:mm A')}
              </Tag>
              <Tag icon={<CalendarOutlined />} color="volcano">
                Event: {dayjs(res.events.start_time).format('MMM D, YYYY h:mm A')}
              </Tag>
            </div>

            {/* Host written note section */}
            {res.note && (
              <>
                <Divider />
                <Paragraph>
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  <i>{res.note}</i>
                </Paragraph>
              </>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
