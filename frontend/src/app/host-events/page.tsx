// grab the most recent event of the creator and display
// how many rsvp, location (additional)
// event name, description, start time, last reservation, count of food items (select by id = id), reservation has an id

'use client';

import { useEffect, useState } from "react";
import { Typography, Card, Tag, Button } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph, Text } = Typography;

interface Food {
  food_id: number;
  food_name: string;
  quantity: number;
}

interface Event {
  event_id: number;
  event_name: string;
  description: string;
  date: string;
  last_res_time: string;
  location?: string;
  rsvp_count: number;
  food_count: number;
  foods: Food[];
}