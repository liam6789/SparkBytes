"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Typography, Button, Input, Dropdown, Menu, TimePicker, Table, Modal, DatePicker, GetProps, Divider, InputNumber } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { FoodData, EventData, ReservationData } from "@/types/types";
import type { TableColumnsType } from 'antd';
const  { RangePicker } = DatePicker;
type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;

interface FoodTableData {
    key: number;
    food_name: string;
    quantity: number;
}

interface ResTableData {
    key: number;
    food_id: string;
    quantity: number;
    res_time: string;
}

export default function EventDetails() {
    const router = useRouter()
    const { id } = useParams();
    const [event, setEvent] = useState<EventData | null>(null);
    const [foodOpts, setFoodOpts] = useState<FoodData[]>([]);

    const [startTime, setStartTime] = useState<Dayjs | null | undefined>(null);
    const [endTime, setEndTime] = useState<Dayjs | null | undefined>(null);
    const [description, setDescription] = useState("")
    const [name, setName] = useState<string>("");

    const fetchEventDetails = async () => {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`http://localhost:5001/events/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })

        if (res.ok) {
            const data = await res.json();
            setEvent(data.event);
            setFoodOpts(data.food);
            setStartTime(dayjs(data.event.start_time))
            setEndTime(dayjs(data.event.last_res_time))
            setDescription(data.event.description)
            setName(data.event.event_name)
        }
    }

    const foodData = foodOpts.map((food) => ({
        key: food.food_id,
        food_name: food.food_name,
        quantity: food.quantity,
    }));

    const foodColumns = [
        { title: "Food Name", dataIndex: "food_name", key: "food_name"},
        { title: "Quantity", dataIndex: "quantity", key: "quantity"},
    ]

    useEffect(() => {
        fetchEventDetails();
    },[])

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "-20px"}}>
                <Typography.Title level={1}>{event?.event_name}</Typography.Title>
            </div>
            <Divider style={{borderColor:"black"}}></Divider>
            
            <Typography.Title level={3}>Event Description</Typography.Title>
            <Typography.Paragraph style={{fontSize: "16px"}}>{event?.description}</Typography.Paragraph>
            <Typography.Title level={3}>Event Date</Typography.Title>
            <Typography.Title level={4} style={{marginTop: "-8px"}}>{dayjs(event?.start_time).format('MM/DD h:mm A')} - {dayjs(event?.last_res_time).format('MM/DD h:mm A')} </Typography.Title>
            
            {foodOpts.length != 0 ? 
            <><Typography.Title level={3}>Amount of Unreserved Food</Typography.Title>
            <Table dataSource={foodData} columns={foodColumns} pagination={false} style={{fontSize: "16px"}}></Table></>
            : <Typography.Title level={3}>No Remaining Unreserved Food</Typography.Title>}
        </>
    )
}