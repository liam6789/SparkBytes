"use client";

import { Typography, Button, Input, DatePicker, Select, Space, Tag } from "antd";
import React, { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import dayjs, { Dayjs } from "dayjs";
import { CreateFoodItem } from "@/types/types";
import type { GetProps } from "antd";
import { GoogleMap, Autocomplete, Marker } from "@react-google-maps/api";

const  { RangePicker } = DatePicker;
const { Option } = Select;
type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;

const dietaryOptions = [
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Gluten-Free', value: 'gluten-free' },
    { label: 'Dairy-Free', value: 'dairy-free' },
    { label: 'Nut-Free', value: 'nut-free' },
    { label: 'Kosher', value: 'kosher' },
    { label: 'Halal', value: 'halal' },
  ];

const mapStyle = {
    height: "300px",
    width: "500px",
    marginTop: "16px",
}

const defaultCenter = {
    lat: 42.35005952363728, 
    lng: -71.10318646684273
}

export default function EventCreationPage() {
    const router = useRouter()
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [foods, setFoods] = useState<CreateFoodItem[]>([]);

    const [startTime, setStartTime] = useState<Dayjs | null | undefined>(null);
    const[endTime, setEndTime] = useState<Dayjs | null | undefined>(null);

    const [foodName, setFoodName] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [quantStr, setQuantStr] = useState("");
    const [validQuant, setValidQuant] = useState(true);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

    const createevent = async () => {
        if (!(name && description && startTime && endTime && foods && location)) {
            alert("All fields must be updated")
            return
        }
        const token = localStorage.getItem("accessToken");
        const body = JSON.stringify({
            "name": name,
            "description": description,
            "start": startTime?.format(),
            "end": endTime?.format(),
            "food": foods,
            "location_lat": location?.lat,
            "location_lng": location?.lng,
            "location_address": location?.address,
        })

        const res = await fetch(`https://sparkbytes.onrender.com/createevent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body,
        });
        if (res.ok) {
            alert("Event created successfully!");
            router.push('/host/events')
            setName("")
            setDescription("")
            setFoods([])
            setStartTime(null)
            setEndTime(null)
            setFoodName("")
            setQuantity(0)
            setQuantStr("")
            setValidQuant(true)
        } else {
            alert("Failed to create event. Please try again.");
        }
    }
        
    return (
        <>
            <Typography.Title level={1}>
                Create Event
            </Typography.Title>

            <Typography.Title level={3}>
                Event Name
            </Typography.Title>
            <Input
                value={name}
                onChange={(e) => {
                    setName(e.target.value)
                }}
            >
            </Input>
            
            <Typography.Title level={3}>
                Event Description
            </Typography.Title>
            <Input
                value={description}
                onChange={(e) => {
                    setDescription(e.target.value)
                }}
            >
            </Input>

            <Typography.Title level={3}>
                Event Time
            </Typography.Title>
            <RangePicker
                showTime={{ format: 'h:mm A' }}
                format="YYYY-MM-DD HH:mm"
                minDate={dayjs()}
                onOk={(values: RangePickerProps['value']) => {
                    if (values && values[0] && values[1]) {
                    const start = values[0];
                    const end = values[1];

                    if (!start.isSame(end, 'day')) {
                        alert("Start time and end time must be on the same day.");
                        return;
                    }

                    setStartTime(start);
                    setEndTime(end);
                    }
                }}
            />
            <Typography.Title level={3}>
                Event Location
            </Typography.Title>
            
            
            <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
            >
                <Input placeholder="Search for a location" value={locationStr} onChange={(e) => setLocationStr(e.target.value)}/>
            </Autocomplete>
            {location && (
                <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                    <strong>Selected Location:</strong> {location.address}
                </div>
            )}
            <GoogleMap
                mapContainerStyle={mapStyle}
                center={{lat: location?.lat ?? defaultCenter.lat, lng: location?.lng ?? defaultCenter.lng}}
                zoom={15}
            >
                <Marker position={{lat: location?.lat ?? defaultCenter.lat, lng: location?.lng ?? defaultCenter.lng}} />
            </GoogleMap>

            <Typography.Title level={2}>
                Add Food Items
            </Typography.Title>
            <Typography.Title level={3}>
                Food Name
            </Typography.Title>
            <Input
                value={foodName}
                onChange={(e) => {
                    setFoodName(e.target.value)
                }}
            >
            </Input>

            <Typography.Title level={3}>
                Quantity of Aforementioned Food Item
            </Typography.Title>
            <Input
                value={quantStr}
                onChange={(e) => {
                    setQuantStr(e.target.value)
                    setQuantity(parseInt(e.target.value))
                    setValidQuant(true)
                }}
            >
            </Input>
            {validQuant ? null : <Typography.Paragraph style={{color:"red"}}>Enter a valid number</Typography.Paragraph>}

            <Typography.Title level={3}>
                Dietary Tags
            </Typography.Title>
            <Select
                mode="multiple"
                allowClear
                style={{ width: '100%', marginBottom: "16px" }}
                placeholder="Select dietary tags for this food"
                value={selectedTags}
                onChange={(value) => setSelectedTags(value)}
            >
                {dietaryOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
            </Select>        



            <div>
                <Button
                    onClick={() => {
                        if (isNaN(quantity)) {
                            setValidQuant(false)
                        } else {
                            const item: CreateFoodItem = {
                                name: foodName,
                                quantity: quantity,
                                dietary_tags: selectedTags.join(',')
                            }
                            setFoods([...foods, item])
                        }
                        setFoodName("")
                        setQuantStr("")
                        setQuantity(0)
                        setSelectedTags([]);
                    }}
                    style={{marginTop:"4px"}}
                >
                    Add Item
                </Button>
            </div>

            {/* Display added food items with their tags */}
            {foods.length > 0 && (
                <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                    <Typography.Title level={4}>Added Food Items:</Typography.Title>
                    <ul>
                        {foods.map((food, index) => (
                            <li key={index}>
                                <Space>
                                    <strong>{food.name}</strong>
                                    <span>(Qty: {food.quantity})</span>
                                    {food.dietary_tags && food.dietary_tags.split(',').map(tag => (
                                        <Tag key={tag} color="blue">{tag}</Tag>
                                    ))}
                                </Space>
                            </li>
                        ))}
                    </ul>
                </div>
    )}
            
            <div>   
                <Button
                    onClick={() => {
                        createevent();
                    }}
                    style={{ marginTop: "12px" }}
                    type="primary"
                >
                    Create Event
                </Button>
            </div>
        </>
    );
}