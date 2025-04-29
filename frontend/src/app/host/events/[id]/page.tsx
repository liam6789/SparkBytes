"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { Typography, Button, Input, Table, Modal, DatePicker, GetProps, Divider, InputNumber } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { FoodData, EventData } from "@/types/types";
import type { TableColumnsType } from 'antd';
import { GoogleMap, Autocomplete, Marker } from '@react-google-maps/api';
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

interface ReservationData {
    res_id: number,
    food_id: number,
    food_name: string,
    user_id: number,
    event_id: number,
    quantity: number,
    res_time: number,
    notes: Text,
    user_name: Text,
}

const mapStyle = {
    height: "300px",
    width: "500px",
}

const defaultCenter = {
    lat: 42.35005952363728, 
    lng: -71.10318646684273
}

export default function EventDetails() {
    const router = useRouter()
    const { id } = useParams();
    const [event, setEvent] = useState<EventData | null>(null);
    const [foodOpts, setFoodOpts] = useState<FoodData[]>([]);
    const [resOpts, setResOpts] = useState<ReservationData[]>([]);

    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [startTime, setStartTime] = useState<Dayjs | null | undefined>(null);
    const [endTime, setEndTime] = useState<Dayjs | null | undefined>(null);
    const [description, setDescription] = useState("")
    const [name, setName] = useState<string>("");

    const [editFoodOpts, setEditFoodOpts] = useState<FoodData[]>([]);
    const [filteredFoodOpts, setFilteredFoodOpts] = useState<FoodData[]>([]);

    const [editResOpts, setEditResOpts] = useState<ReservationData[]>([]);
    const [filteredResOpts, setFilteredResOpts] = useState<ReservationData[]>([]);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [locationStr, setLocationStr] = useState<string>("");

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };
    
    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry) {
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            setLocation({
                lat: lat ?? 0,
                lng: lng ?? 0,
                address: place.formatted_address ?? "Selected location",
            });
            setLocationStr(place.formatted_address ?? "Selected location");
            }
        }
    };

    const fetchEventDetails = async () => {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`https://sparkbytes.onrender.com/events/${id}`, {
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
            setStartTime(dayjs(data.event.start_time))
            setEndTime(dayjs(data.event.last_res_time))
            setDescription(data.event.description)
            setName(data.event.event_name)
            setEditFoodOpts(data.food.map((item : FoodData) => ({...item})))
            setFilteredFoodOpts(data.food.map((item : FoodData) => ({...item})))
            setEditResOpts(data.reservations.map((res: ReservationData) => ({...res})))
            setLocation({lat: data.event.location_lat, lng: data.event.location_lng, address: data.event.location_address})
        }
    }

    const deleteEvent = async () => {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`https://sparkbytes.onrender.com/events/delete/${id}`, {
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

    const updateDB = async () => {
        const token = localStorage.getItem("accessToken");
        const body = JSON.stringify({
            "eventName": name,
            "eventDescription": description,
            "start": startTime?.format(),
            "end": endTime?.format(),
            "foods": editFoodOpts,
            "reservations": editResOpts,
            "location_lat": location?.lat,
            "location_lng": location?.lng,
            "location_address": location?.address,
        })
        const res = await fetch(`https://sparkbytes.onrender.com/events/update/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body,
        })

        if (res.ok) {
            // Fetch the updated details
            fetchEventDetails()
        }
    }

    const foodData = foodOpts.map((food) => ({
        key: food.food_id,
        food_name: food.food_name,
        quantity: food.quantity,
    }));

    const editFoodData = filteredFoodOpts.map((food) => ({
        key: food.food_id,
        food_name: food.food_name,
        quantity: food.quantity,
    }))

    const resData = resOpts.map((res) => ( {
        key: res.res_id,
        name: res.user_name,
        food_id: res.food_name,
        quantity: res.quantity,
        res_time: dayjs(res.res_time).format('h:mm A'),
    }))

    const editResData = filteredResOpts.map((res) => ({
        key: res.res_id,
        name: res.user_name,
        food_id: res.food_name,
        quantity: res.quantity,
        res_time: dayjs(res.res_time).format('h:mm A'),
    }))

    const foodColumns = [
        { title: "Food Name", dataIndex: "food_name", key: "food_name"},
        { title: "Quantity", dataIndex: "quantity", key: "quantity"},
    ]

    const editFoodColumns : TableColumnsType<FoodTableData> = [
        { title: "Food Name", dataIndex: "food_name", key: "food_name"},
        { title: "Quantity", dataIndex: "quantity", key: "quantity", render: (value: number, record: FoodTableData) => 
            <InputNumber
              min={0}
              value={value}
              onChange={(value) => {
                const newQuantities = editFoodOpts.map(item => 
                    item.food_id === record.key ? {...item, quantity: value ?? 0} : item
                )
                setEditFoodOpts(newQuantities)
                setFilteredFoodOpts(newQuantities)
              }}
            />
        },
        { title: "Action", dataIndex: "action", key:"action", render: (record: FoodTableData) => 
            <Button type="primary" onClick={() => {
                const updatedFoodOpts = editFoodOpts.map(item => 
                    item.food_id === record.key ? {...item, quantity: 0} : item
                )
                setEditFoodOpts(updatedFoodOpts)
                setFilteredFoodOpts(updatedFoodOpts.filter(item => item.quantity > 0))
            }}>Delete</Button>
        },
    ]

    const resColumns = [
        {title: "Reservation Name", dataIndex: "name", key: "name"},
        {title: "Food Name", dataIndex: "food_id", key: "food_id"},
        {title: "Quantity", dataIndex: "quantity", key: "quantity"},
        {title: "Reservation Time", dataIndex: "res_time", key: "res_time"},
    ]

    const editResColumns : TableColumnsType<ResTableData> = [
        {title: "Reservation Name", dataIndex: "name", key: "name"},
        {title: "Food Name", dataIndex: "food_id", key: "food_id"},
        {title: "Quantity", dataIndex: "quantity", key: "quantity"},
        {title: "Reservation Time", dataIndex: "res_time", key: "res_time"},
        {title: "Action", dataIndex: "action", key: "action", render: (record: ResTableData) => 
            <Button type="primary" onClick={() => {
                const updatedResOpts = editResOpts.map(res => 
                    res.res_id === record.key ? {...res, quantity: 0} : res
                );
                setEditResOpts(updatedResOpts);
                setFilteredResOpts(updatedResOpts.filter(item => item.quantity > 0))
            }}>Delete</Button>
        },
    ]

    useEffect(() => {
        fetchEventDetails();
    },[])

    useEffect(() => {
        if (editMode && event) {
            setStartTime(dayjs(event.start_time))
            setEndTime(dayjs(event.last_res_time))
            setDescription(event.description)
            setName(event.event_name)
            setEditFoodOpts(foodOpts.map((item : FoodData) => ({...item})))
            setFilteredFoodOpts(foodOpts.map((item : FoodData) => ({...item})))
            setEditResOpts(resOpts.map((res: ReservationData) => ({...res})))
            setFilteredResOpts(resOpts.map((res: ReservationData) => ({...res})))
        }
    }, [editMode])

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "-20px"}}>
                {editMode ? 
                <Input
                    style={{width:"600px", height: "50px", fontSize: "30px", fontWeight:"bold", marginBottom:"10px"}}
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                    }}>
                </Input> : 
                <Typography.Title level={1}>{event?.event_name}</Typography.Title>}

                <div>
                    {editMode ? <><Button type="primary" onClick={() => setEditMode(false)}>Cancel Edits</Button>
                    <Button type="primary" onClick={() => setConfirm(true)} style={{marginLeft: "6px"}}>Confirm Edits</Button>
                    <Modal
                        title="Are you sure you want to confirm these changes?"
                        open={confirm}
                        okType="danger"
                        onOk={() => {
                            // Call function to update database
                            updateDB()
                            setConfirm(false)
                            setEditMode(false)
                        }}
                        onCancel={() => {
                            setConfirm(false)
                        }}
                    >
                        {"You cannot undo this!!!"}
                    </Modal>
                    </> : 
                    <Button type="primary" onClick={() => {
                        setEditMode(true)
                    }}>Edit Event</Button>}

                    <Button type="primary" onClick={() => setOpen(true)} style={{marginLeft:"6px"}}>Delete Event</Button>
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
            </div>
            <Divider style={{borderColor:"black"}}></Divider>
            
            <Typography.Title level={3}>Event Description</Typography.Title>
            {editMode ?
            <Input
                value={description}
                onChange={(e) => {
                    setDescription(e.target.value)
                }}
            ></Input>:
            <Typography.Paragraph style={{fontSize: "16px"}}>{event?.description}</Typography.Paragraph>}
            <Typography.Title level={3}>Event Date</Typography.Title>
            {editMode? <RangePicker
                            showTime={{ format: 'h:mm A' }}
                            format="MM/DD/YYYY h:mm A"
                            minDate={dayjs()}
                            value={[startTime, endTime]}
                            onOk={(values: RangePickerProps['value']) => {
                                if (values) {
                                    setStartTime(values[0])
                                    setEndTime(values[1])
                                }
                            }}
                        />:
            <Typography.Title level={4} style={{marginTop: "-8px"}}>{dayjs(event?.start_time).format('MM/DD h:mm A')} - {dayjs(event?.last_res_time).format('MM/DD h:mm A')} </Typography.Title>}
            
            <Typography.Title level={3}>Location</Typography.Title>
            {editMode ?
            <><Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
            >
                <Input placeholder={"Search for a location"} value={locationStr} onChange={(e) => setLocationStr(e.target.value)}></Input>
            </Autocomplete>
            <GoogleMap
                mapContainerStyle={mapStyle}
                center={{lat: location?.lat ?? defaultCenter.lat, lng: location?.lng ?? defaultCenter.lng}}
                zoom={15}
            >
                <Marker
                    position={{lat: location?.lat ?? defaultCenter.lat, lng: location?.lng ?? defaultCenter.lng}}
                />
            </GoogleMap></> :
            <GoogleMap
                mapContainerStyle={mapStyle}
                center={{lat: location?.lat ?? defaultCenter.lat, lng: location?.lng ?? defaultCenter.lng}}
                zoom={15}
            >
                <Marker
                    position={{lat: location?.lat ?? defaultCenter.lat, lng: location?.lng ?? defaultCenter.lng}}
                />
            </GoogleMap>}

            {foodOpts.length != 0 ? 
            <><Typography.Title level={3}>Amount of Unreserved Food</Typography.Title>
            {editMode ? 
            <Table dataSource={editFoodData} columns={editFoodColumns} pagination={false} style={{fontSize: "16px"}}></Table>:
            <Table dataSource={foodData} columns={foodColumns} pagination={false} style={{fontSize: "16px"}}/>}</>
            : <Typography.Title level={3}>No Remaining Unreserved Food</Typography.Title>}
            
            {resOpts.length != 0 ?
            <><Typography.Title level={3}>Reservations</Typography.Title>
            {editMode ? 
            <Table dataSource={editResData} columns={editResColumns} pagination={false} style={{fontSize: "16px"}}></Table>:
            <Table dataSource={resData} columns={resColumns} pagination={false} style={{fontSize: "16px"}}/>}</>
            : <Typography.Title level={3}>No Reservations for This Event</Typography.Title>}    
        </>
    )
}