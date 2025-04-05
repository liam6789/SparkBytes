"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Typography, Button, Input, Dropdown, Menu, TimePicker, Table, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { FoodData, EventData, ReservationData } from "@/types/types";

export default function EventDetails() {
    const router = useRouter()
    const { id } = useParams();
    const [event, setEvent] = useState<EventData | null>(null);
    const [foodOpts, setFoodOpts] = useState<FoodData[]>([]);
    const [resOpts, setResOpts] = useState<ReservationData[]>([]);
    const [open, setOpen] = useState(false);

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
            setResOpts(data.reservations);
        }
        console.log(foodOpts);
    }

    const deleteEvent = async () => {
        console.log("Reached the call to delete event")
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`http://localhost:5001/events/delete/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })

        if (res.ok) {
            alert("Event deleted successfully!");
            router.push('/events')
        }
    }

    const foodData = foodOpts.map((food) => ({
        key: food.food_id,
        food_name: food.food_name,
        quantity: food.quantity,
    }));

    const resData = resOpts.map((res) => ( {
        key: res.res_id,
        food_id: res.food_name,
        quantity: res.quantity,
        res_time: dayjs(res.res_time).format('h:mm A'),
    }))

    const foodColumns = [
        { title: "Name", dataIndex: "food_name", key: "food_name"},
        { title: "Quantity", dataIndex: "quantity", key: "quantity"},
    ]

    const resColumns = [
        {title: "Food Name", dataIndex: "food_id", key: "food_id"},
        {title: "Quantity", dataIndex: "quantity", key: "quantity"},
        {title: "Reservation Time", dataIndex: "res_time", key: "res_time"},
    ]

    useEffect(() => {
        fetchEventDetails();
    },[])

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "-20px"}}>
                <Typography.Title level={1}>{event?.event_name}</Typography.Title>
                <Button type="primary" onClick={() => setOpen(true)}>Delete Event</Button>
                <Modal 
                    title="Are you sure you want to delete this event?"
                    open={open}
                    okType="danger"
                    onOk={() => {
                        deleteEvent()
                        setOpen(false)
                    }}
                    onCancel={()=>setOpen(false)}
                >
                    {"You cannot undo this!!!"}
                </Modal>
            </div>
            <Typography.Title level={3}>Event Description</Typography.Title>
            <Typography.Paragraph style={{fontSize: "16px"}}>{event?.description}</Typography.Paragraph>
            <Typography.Title level={3}>Event Date</Typography.Title>
            <Typography.Title level={4} style={{marginTop: "-8px"}}>{dayjs(event?.start_time).format('MM/DD h:mm A')} - {dayjs(event?.last_res_time).format('MM/DD h:mm A')} </Typography.Title>
            {foodOpts.length != 0 ? 
            <><Typography.Title level={3}>Amount of Unreserved Food</Typography.Title>
            <Table dataSource={foodData} columns={foodColumns} pagination={false} style={{fontSize: "16px"}}/></>
            : <Typography.Title level={3}>No Remaining Unreserved Food</Typography.Title>}
            {resOpts.length != 0 ?
            <><Typography.Title level={3}>Reservations</Typography.Title>
            <Table dataSource={resData} columns={resColumns} pagination={false} style={{fontSize: "16px"}}/></>
            : <Typography.Title level={3}>No Reservations for This Event</Typography.Title>}    
        </>
    )
}