'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

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
}