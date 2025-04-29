# ==================== IMPORTS ==================== #

from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from contextlib import asynccontextmanager
import uvicorn
import asyncpg
import secrets
import hashlib
from typing import Optional, Literal
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import Optional, List
import os
import jwt
import bcrypt
import smtplib # Send emails
from email.mime.text import MIMEText  # Format "forget" email
from email.mime.multipart import MIMEMultipart


# ==================== DATABASE SETUP ==================== #
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
JWT_SECRET = os.getenv("JWT_SECRET", "YOUR_SECRET_KEY_CHANGE_THIS")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==================== APP SETUP ==================== #
# FastAPI instance
app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme
security = HTTPBearer()

# ==================== MODELS ==================== #
# Model for user registration, validates input data for user registration
class UserCreate(BaseModel):
    email: EmailStr # Uses EmailStr for email validation
    password: str 
    name: str
    role: Literal['regular_user', 'event_creator'] = 'regular_user' # Only want valid roles

# Model for returning user information (excludes password)
class User(BaseModel):
    user_id: int 
    email: EmailStr
    role: str
    name: str
    optin: bool 

# Model for login requests
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    # Validates login credentials 

# Model for login responses, includes token and user info
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Validate forgotten password req, email format
class ForgotRequest(BaseModel):
    email: EmailStr

# Model to reset password
class ResetPasswordRequest(BaseModel):  #
    token: str
    new_password: str

class FoodItem(BaseModel):
    name: str
    quantity: int
    dietary_tags: str = ""

class CreateEvent(BaseModel):
    name: str
    description: str
    start: datetime
    end: datetime 
    food: list[FoodItem]
    location_lat: float
    location_lng: float
    location_address: str

class CreateRes(BaseModel):
    food_id: int
    food_name: str
    event_id: int
    quantity: int
    pickup_time: datetime
    note: str

class ReservationData(BaseModel):
    res_id: int
    food_id: int
    food_name: str
    user_id: int
    event_id: int
    quantity: int
    res_time: datetime
    notes: str

class FoodData(BaseModel):
    food_id: int
    food_name: str
    quantity: int
    event_id: int

class UpdateEvent(BaseModel):
    eventName: str
    eventDescription: str
    start: datetime
    end: datetime
    foods: list[FoodData]
    reservations: list[ReservationData]
    location_lat: float
    location_lng: float
    location_address: str

# class for time filter options
class TimeFilter(str, Enum):
    ALL = "all"
    JUST_STARTED = "just_started"  # Events that started within the last 30 minutes
    WITHIN_HOUR = "within_hour"    # Events that started within the last 60 minutes
    ENDING_SOON = "ending_soon"    # Events ending within the next 60 minutes
    RUNNING_NOW = "running_now"    # Currently active events
    FRESH_FOOD = "fresh_food"      # Events that have just ended (for fresh food)

# model for combined filters (dietary and time)
class CombinedFilters(BaseModel):
    dietary_restrictions: List[str] = []
    time_filter: TimeFilter = TimeFilter.ALL
    freshness_window: int = 30  # in minutes, for FRESH_FOOD filter

# Model for creating a rating
class RatingCreate(BaseModel):
    event_id: int
    rating: float 
    description: Optional[str] = None

# ==================== HELPER FUNCTION ==================== #
def hash_password(password: str) -> str:
    """
    Hashes a password using bcrypt
    """
    # Convert password to bytes, generate salt, and hash
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)  
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)

    # Return the hash as a string
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a bcrypt hash
    """
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Create a JWT token with expiration time, takes user data, sets expiration time, encodes using secret key
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Validate JWT token and return current user
    Extracts token from request
    Decodes JWT to get user_id
    Fetches user from database
    """
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Get user from database
        response = supabase.table("users").select("*").eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        user_data = response.data[0]
        
        return User(
            user_id=user_data["user_id"],
            email=user_data["email"],
            role=user_data["role"],
            name=user_data["name"],
            optin=user_data["optin"],
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
def send_email(recipient: str, subject: str, body: str):
    sender_email = os.getenv("SENDER_EMAIL")
    sender_pass = os.getenv("SENDER_PASS")

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = recipient
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_pass)
        server.send_message(message)

# ==================== ROUTES ==================== #
@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}

@app.post("/createevent")
async def create_event(data: CreateEvent, current_user: User = Depends(get_current_user)):
    #print(current_user.user_id)
    #print(data)
    creator_id = current_user.user_id
    name = data.name
    description = data.description
    start_time = data.start.isoformat()
    last_res_time = data.end.isoformat()
    location_lat = data.location_lat
    location_lng = data.location_lng
    location_address = data.location_address

    response = (
        supabase.table("events")
        .insert({"creator_id": creator_id, "event_name": name, "description": description, "start_time": start_time, "last_res_time":last_res_time, "location_lat": location_lat, "location_lng": location_lng, "location_address": location_address})
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to insert event"
        )


    # print(response.data[0]['event_id'])
    event_id = response.data[0]['event_id']

    for food in data.food:
        response = (
            supabase.table("foods")
            .insert({"food_name": food.name, "quantity": food.quantity, "event_id": event_id, "dietary_tags": food.dietary_tags})
            .execute()
        )
        # print (response)
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert food item"
            )
        
    response = (
        supabase.table("users")
        .select("*")
        .execute()
    )

    subject = "New Event Posted"
    message = "Click the link to see the event details: spark-bytes-wheat.vercel.app/events/" + str(event_id) 
    users = response.data
    for user in users:
        if user["role"] == 'regular_user' and user["optin"] == True:
            print(message)
            send_email(user["email"], subject, message)

    return {"message": "Success"}

@app.post("/events/update/{event_id}")
async def update_event(data: UpdateEvent, event_id : int, current_user: User = Depends(get_current_user)):
    user_id = current_user.user_id 
    response = (
        supabase.table("events")
        .select("*")
        .eq("event_id", event_id)
        .execute()
    )
    if not response.data or response.data[0]["creator_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this event"
        )

    response = (
        supabase.table("events")
        .update({"event_name": data.eventName, "description": data.eventDescription, "start_time": data.start.isoformat(), "last_res_time": data.end.isoformat(), "location_lat": data.location_lat, "location_lng": data.location_lng, "location_address": data.location_address})
        .eq("event_id", event_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to insert event"
        )
    
    for food in data.foods:
        food_id = food.food_id
        if (food.quantity <= 0):
            response = (
                supabase.table("foods")
                .delete()
                .eq("food_id", food_id)
                .execute()
            )
        else:
            response = (
                supabase.table("foods")
                .update({"quantity": food.quantity})
                .eq("food_id", food_id)
                .execute()
            )
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update event"
                )

    for res in data.reservations:
        res_id = res.res_id
        food_id = res.food_id
        if (res.quantity <= 0):
            response = (
                supabase.table("reservations")
                .select("quantity")
                .eq("res_id", res_id)
                .execute()
            )
            quant = response.data[0]['quantity']
            response = (
                supabase.table("foods")
                .select("quantity")
                .eq("food_id", food_id)
                .execute()
            )
            if not response.data:
                response = (
                    supabase.table("foods")
                    .insert({"food_name": res.food_name, "quantity": quant, "event_id": event_id})
                    .execute()
                )
            else:
                currentQuant = response.data[0]['quantity']
                response = (
                    supabase.table("foods")
                    .update({"quantity": quant + currentQuant})
                    .eq("food_id", food_id)
                    .execute()
                )
            response = (
                supabase.table("reservations")
                .delete()
                .eq("res_id", res_id)
                .execute()
            )
    

@app.get("/events/filtered")
async def get_filtered_events(dietary_restrictions: str = "", current_user: User = Depends(get_current_user)):
    """
    fetch all events that match the provided dietary restrictions
    """
    # parse list of restrictions
    restrictions = [r.strip() for r in dietary_restrictions.split(",")] if dietary_restrictions else []
    
    # if no restrictions provided, return all events
    if not restrictions:
        return await get_all_events(current_user)
    
    # fetch all events with their foods
    response = (
        supabase.table("events")
        .select("*, foods(*)")
        .execute()
    )
    
    if not response.data:
        return []
    
    # filter events that have foods matching the restrictions
    filtered_events = []
    for event in response.data:
        # get the foods for this event
        foods = event.get("foods", [])
        
        # check if any food in the event has all the requested dietary tags
        matching_foods = False
        for food in foods:
            food_tags = food.get("dietary_tags", "").lower().split(",")
            food_tags = [tag.strip() for tag in food_tags]
            
            # check if this food meets all the requested restrictions
            if all(restriction.lower() in food_tags for restriction in restrictions):
                matching_foods = True
                break
        
        # only include the event if it has matching foods
        if matching_foods:
            filtered_events.append({
                "event_id": event["event_id"],
                "event_name": event["event_name"],
                "description": event.get("description"),
                "date": event["start_time"],
                "creator_id": event["creator_id"],
                "created_at": event["created_at"],
                "last_res_time": event["last_res_time"],
                "foods": [
                    {
                        "food_id": food["food_id"],
                        "food_name": food["food_name"],
                        "quantity": food["quantity"],
                        "event_id": food["event_id"],
                        "dietary_tags": food.get("dietary_tags", "")
                    } for food in foods
                ]
            })
    
    return filtered_events
    


@app.post("/createreservation")
async def create_reservation(data: CreateRes, current_user: User = Depends(get_current_user)):
    user_id = current_user.user_id
    user_name = current_user.name
    response = (
        supabase.table("reservations")
        .insert({"user_id": user_id, "user_name": user_name, "food_id": data.food_id, "food_name": data.food_name, "event_id": data.event_id, "quantity": data.quantity, "res_time": data.pickup_time.isoformat(), "notes": data.note})
        .execute()
    )
    print(response)

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to insert event"
        )
    
    response = (
        supabase.table("foods")
        .select("quantity")
        .eq("food_id", data.food_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch food item"
        )

    food_quantity = response.data[0]['quantity']
    new_quantity = food_quantity - data.quantity
    if new_quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough food available"
        )
    elif new_quantity == 0:
        response = (
            supabase.table("foods")
            .delete()
            .eq("food_id", data.food_id)
            .execute()
        )
    else: 
        response = (
            supabase.table("foods")
            .update({"quantity": new_quantity})
            .eq("food_id", data.food_id)
            .execute()
        )
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update food item"
        )
    
    response = (
        supabase.table("events")
        .select("*")
        .eq("event_id", data.event_id)
        .execute()
    )

    creator_id = response.data[0]["creator_id"]

    response = (
        supabase.table("users")
        .select("*")
        .execute()
    )

    subject = "New Reservation Made on Your Event"
    message = "Click the link to see the details: spark-bytes-wheat.vercel.app/host/events/" + str(data.event_id) 
    users = response.data
    for user in users:
        if user["user_id"] == creator_id and user["optin"] == True:
            print(message)
            send_email(user["email"], subject, message)
    
    return {"message": "Success"}

@app.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    Register a new user
    Checks if email already exists
    Hashes password for storage
    Creates new user in database
    Returns user data (without password)
    """
    # Check if user already exists
    existing_user = supabase.table("users").select("*").eq("email", user_data.email).execute()
    
    if existing_user.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = hash_password(user_data.password)
    
    # Insert the new user
    try:
        new_user = {
            "email": user_data.email,
            "password": hashed_password,
            "role": user_data.role,
            "name": user_data.name,
            "optin": False
        }
        
        response = supabase.table("users").insert(new_user).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        created_user = response.data[0]
        
        return User(
            user_id=created_user["user_id"],
            email=created_user["email"],
            role=created_user["role"],
            name=created_user["name"],
            optin=created_user["optin"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )
    
@app.post("/optupdate")
async def optupdate(current_user: User = Depends(get_current_user)):
    response = (
        supabase.table("users")
        .update({"optin", current_user.optin})
        .eq("user_id",current_user.user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete event"
        )
    
    return {"message" : "success"}

@app.post("/login", response_model=LoginResponse)
async def login_user(login_data: LoginRequest):
    """
    Login a user and return a JWT token
    Verifies email exists
    Checks password against stored hash
    Generates JWT token with user_id
    Returns token and user data 
    """
    # Get user from database
    response = supabase.table("users").select("*").eq("email", login_data.email).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user_data = response.data[0]
    
    # Verify password
    if not verify_password(login_data.password, user_data["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate JWT token
    access_token = create_access_token(
        data={"sub": str(user_data["user_id"])}
    )
    
    # Return token and user info
    return LoginResponse(
        access_token=access_token,
        user=User(
            user_id=user_data["user_id"],
            email=user_data["email"],
            role=user_data["role"],
            name=user_data["name"],
            optin=user_data["optin"],
        )
    )

@app.get("/me", response_model=User)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current user's profile using JWT token 
    Returns user data for authenticated user 
    """
    return current_user


@app.get("/events")
async def get_events(current_user: User = Depends(get_current_user)):
    """
    Fetch all events for the current user
    """
    # fetch events created by the current user
    response = (
        supabase.table("events")
        .select("*, foods(*)")  # select events and their associated foods
        .eq("creator_id", current_user.user_id)
        .execute()
    )

    # if no events found, return an empty list
    if not response.data:
        return []

    # transform the events to match your frontend's expected structure
    events = []
    for event in response.data:
        events.append({
            "event_id": event["event_id"],
            "event_name": event["event_name"],
            "description": event.get("description"),
            "date": event["start_time"],
            "creator_id": event["creator_id"],
            "created_at": event["created_at"],
            "last_res_time": event["last_res_time"],
            "location_lat": event.get("location_lat"),
            "location_lng": event.get("location_lng"),
            "location_address": event.get("location_address"),
            "foods": [
                {
                    "food_id": food["food_id"],
                    "food_name": food["food_name"],
                    "quantity": food["quantity"],
                    "event_id": food["event_id"]
                } for food in event.get("foods", [])
            ]
        })

    return events

@app.get("/events/all")
async def get_all_events(current_user: User = Depends(get_current_user)):
    """
    Fetch all events across the system (not just those created by the current user)
    """
    # fetch all events from the database
    response = (
        supabase.table("events")
        .select("*, foods(*)")  # select events and their associated foods
        .execute()
    )

    # if no events found, return an empty list
    if not response.data:
        return []

    # transform events to match frontend
    events = []
    for event in response.data:
        events.append({
            "event_id": event["event_id"],
            "event_name": event["event_name"],
            "description": event.get("description"),
            "date": event["start_time"],
            "creator_id": event["creator_id"],
            "created_at": event["created_at"],
            "last_res_time": event["last_res_time"],
            "location_lat": event.get("location_lat"),
            "location_lng": event.get("location_lng"),
            "location_address": event.get("location_address"),
            "foods": [
                {
                    "food_id": food["food_id"],
                    "food_name": food["food_name"],
                    "quantity": food["quantity"],
                    "event_id": food["event_id"],
                    "dietary_tags": food.get("dietary_tags", "")
                } for food in event.get("foods", [])
            ]
        })

    return events

@app.get("/events/{event_id}")
async def get_event(event_id: int, current_user: User = Depends(get_current_user)):
    response = (
        supabase.table("events")
        .select("*")
        .eq("event_id", event_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event = response.data[0]
    event_data = {
        "event_id": event["event_id"],
        "event_name": event["event_name"],
        "description": event.get("description"),
        "date": event["start_time"],
        "creator_id": event["creator_id"],
        "start_time": event["start_time"],
        "last_res_time": event["last_res_time"],
        "location_lat": event["location_lat"],
        "location_lng": event["location_lng"],
        "location_address": event["location_address"],
    }
    
    response = (
        supabase.table("foods")
        .select("*")
        .eq("event_id", event_id)
        .execute()
    )

    food = response.data 
    if not response.data:
        food = []


    response = (
        supabase.table("reservations")
        .select("*")
        .eq("event_id", event_id)
        .execute()
    )

    reservations = response.data
    if not response.data:
        reservations = []

    return {"event": event_data, "food": food, "reservations": reservations}

@app.post("/events/delete/{event_id}")
async def delete_event(event_id: int, current_user: User = Depends(get_current_user)):
    response = (
        supabase.table("events")
        .select("*")
        .eq("event_id", event_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    if response.data[0]["creator_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this event"
        )
    
    response = (
        supabase.table("events")
        .delete()
        .eq("event_id", event_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete event"
        )
    return {"message": "Event deleted successfully"}

@app.get("/active-events")
async def get_active_events():
    now = datetime.now(timezone.utc).isoformat()

    response = supabase.table("events").select("*").lte("start_time", now).gte("last_res_time",now).execute()
    if not response.data:
        return {"events": []}
    
    # Translate the supabase response to a format that frontend can use
    events = []
    for event in response.data:
        events.append({
            "event_id": event["event_id"],
            "event_name": event["event_name"],
            "description": event.get("description"),
            "date": event["start_time"],
            "creator_id": event["creator_id"],
            "created_at": event["created_at"],
            "last_res_time": event["last_res_time"]
        })
    return {"events": events}

@app.get("/get-food/{event_id}")
async def get_food(event_id: int):
    response = supabase.table("foods").select("*").eq("event_id", event_id).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No food items found for this event")
    
    # Translate the supabase response to a format that frontend can use
    foods = []
    for food in response.data:
        foods.append({
            "food_id": food["food_id"],
            "food_name": food["food_name"],
            "quantity": food["quantity"],
            "event_id": food["event_id"]
        })
    return {"foods": foods}

# ===== Password: Forgotten and Recovery ===== #

# Extract email to send to
@app.post("/forgot-password")
async def forgot_password(request: ForgotRequest):
    email = request.email

    # Check if the email exists in the users table
    response = supabase.table("users").select("*").eq("email", email).execute()

    # User not in db, generic msg
    if not response.data:
        return {"message": "If an account with that email exists, a recovery email has been sent."}
    
    # Extract user from resp
    user_data = response.data[0]

    # Generate a temporary assword reset 30min
    reset_token = create_access_token(
        data={"sub": str(user_data["user_id"])},
        expires_delta=timedelta(minutes=30)
    )
    
    # Send password recovery email
    try:
        sender_email = os.getenv("SENDER_EMAIL")  # Sender email addr
        sender_password = os.getenv("SENDER_PASS")  # Account password
        smtp_server = "smtp.gmail.com" # Sever for gmail
        smtp_port = 587

        # Email content
        subject = "Password Reset Request - Spark! Bytes"
        content = f"""
        Hello {email},

        We received a request to reset your password for your SparkBytes account. 
        Click the link below to reset your password (Valid for 30 minutes):

        spark-bytes-wheat.vercel.app/reset-password?token={reset_token}

        If you did not request this, please ignore this email.

        Best,
        Spark! Bytes Team
        """

        # Email object
        msg = MIMEText(content)
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = email

        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, msg.as_string())
    
    # Exception if fail
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send recovery email: {str(e)}"
        )

    # Generic success msg
    return {"message": "If an account with that email exists, a recovery email has been sent."}

@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):  # ✅ New route for resetting password
    try:
        # Decode the JWT token to get user_id
        payload = jwt.decode(request.token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token.")
        
        # Check if the token is expired
        if datetime.now(timezone.utc) > datetime.fromtimestamp(payload["exp"], tz=timezone.utc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token has expired.")
        
        # Hash the new password
        new_hashed_password = hash_password(request.new_password)
        
        # Update the user's password in the database
        response = supabase.table("users").update({"password": new_hashed_password}).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update password.")
        
        return {"message": "Password has been successfully reset. You can now log in with your new password."}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The reset link has expired. Please request a new one.")
    
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token.")  

@app.get("/events/filtered")
async def get_filtered_events(
    dietary_restrictions: str = "", 
    time_filter: TimeFilter = TimeFilter.ALL,
    freshness_window: int = 30,
    current_user: User = Depends(get_current_user)
):
    """
    Fetch all events that match the provided dietary restrictions and time filter
    """
    # get current time in universal time
    now = datetime.now(timezone.utc)
    
    # go through list of dietary restrictions
    restrictions = [r.strip() for r in dietary_restrictions.split(",")] if dietary_restrictions else []
    
    # fetch all events with their foods
    response = (
        supabase.table("events")
        .select("*, foods(*)")
        .execute()
    )
    
    if not response.data:
        return []
    
    filtered_events = []
    
    for event in response.data:
        # go through event times
        start_time_str = event["start_time"].replace('Z', '+00:00') if 'Z' in event["start_time"] else event["start_time"]
        last_res_time_str = event["last_res_time"].replace('Z', '+00:00') if 'Z' in event["last_res_time"] else event["last_res_time"]
        
        start_time = datetime.fromisoformat(start_time_str)
        last_res_time = datetime.fromisoformat(last_res_time_str)
        
        # apply time filter
        passes_time_filter = False
        
        if time_filter == TimeFilter.ALL:
            passes_time_filter = True
            
        elif time_filter == TimeFilter.JUST_STARTED:
            # events that started within the last 30 minutes
            time_since_start = now - start_time
            passes_time_filter = time_since_start.total_seconds() >= 0 and time_since_start.total_seconds() <= 30 * 60
            
        elif time_filter == TimeFilter.WITHIN_HOUR:
            # events that started within the last 60 minutes
            time_since_start = now - start_time
            passes_time_filter = time_since_start.total_seconds() >= 0 and time_since_start.total_seconds() <= 60 * 60
            
        elif time_filter == TimeFilter.ENDING_SOON:
            # events ending within the next 60 minutes
            time_until_end = last_res_time - now
            passes_time_filter = time_until_end.total_seconds() >= 0 and time_until_end.total_seconds() <= 60 * 60
            
        elif time_filter == TimeFilter.RUNNING_NOW:
            # currently active events (started but not yet ended)
            passes_time_filter = start_time <= now and last_res_time >= now
            
        elif time_filter == TimeFilter.FRESH_FOOD:
            # events that have just ended (food should still be fresh)
            time_since_end = now - last_res_time
            passes_time_filter = time_since_end.total_seconds() >= 0 and time_since_end.total_seconds() <= freshness_window * 60
        
        if not passes_time_filter:
            continue
        
        # apply dietary filter
        if not restrictions:
            filtered_events.append(event)
            continue
            
        # check if any food in the event has all the requested dietary tags
        foods = event.get("foods", [])
        matching_foods = False
        
        for food in foods:
            food_tags = food.get("dietary_tags", "").lower().split(",")
            food_tags = [tag.strip() for tag in food_tags]
            
            # check if food meets restrictions
            if all(restriction.lower() in food_tags for restriction in restrictions):
                matching_foods = True
                break
        
        # include events with matching foods
        if matching_foods:
            filtered_events.append(event)
    
    # sort events based on the time filter
    if time_filter == TimeFilter.ENDING_SOON:
        # sort by how soon they're ending (ascending)
        filtered_events.sort(key=lambda e: datetime.fromisoformat(e["last_res_time"].replace('Z', '+00:00') if 'Z' in e["last_res_time"] else e["last_res_time"]))
    elif time_filter == TimeFilter.JUST_STARTED or time_filter == TimeFilter.WITHIN_HOUR:
        # sort by how recently they started (most recent first)
        filtered_events.sort(key=lambda e: datetime.fromisoformat(e["start_time"].replace('Z', '+00:00') if 'Z' in e["start_time"] else e["start_time"]), reverse=True)
    elif time_filter == TimeFilter.FRESH_FOOD:
        # sort by how recently they ended (most recent first)
        filtered_events.sort(key=lambda e: now - datetime.fromisoformat(e["last_res_time"].replace('Z', '+00:00') if 'Z' in e["last_res_time"] else e["last_res_time"]))
    
    formatted_events = []
    for event in filtered_events:
        event_data = {
            "event_id": event["event_id"],
            "event_name": event["event_name"],
            "description": event.get("description"),
            "date": event["start_time"],
            "creator_id": event["creator_id"],
            "created_at": event["created_at"],
            "last_res_time": event["last_res_time"],
            "location_lat": event.get("location_lat"),
            "location_lng": event.get("location_lng"),
            "location_address": event.get("location_address"),
            "foods": [
                {
                    "food_id": food["food_id"],
                    "food_name": food["food_name"],
                    "quantity": food["quantity"],
                    "event_id": food["event_id"],
                    "dietary_tags": food.get("dietary_tags", "")
                } for food in event.get("foods", [])
            ]
        }
        
        if time_filter == TimeFilter.ENDING_SOON:
            last_res_time = datetime.fromisoformat(event["last_res_time"].replace('Z', '+00:00') if 'Z' in event["last_res_time"] else event["last_res_time"])
            minutes_until_end = int((last_res_time - now).total_seconds() / 60)
            event_data["minutes_until_end"] = minutes_until_end
            
        elif time_filter == TimeFilter.JUST_STARTED or time_filter == TimeFilter.WITHIN_HOUR:
            start_time = datetime.fromisoformat(event["start_time"].replace('Z', '+00:00') if 'Z' in event["start_time"] else event["start_time"])
            minutes_since_start = int((now - start_time).total_seconds() / 60)
            event_data["minutes_since_start"] = minutes_since_start
            
        elif time_filter == TimeFilter.FRESH_FOOD:
            last_res_time = datetime.fromisoformat(event["last_res_time"].replace('Z', '+00:00') if 'Z' in event["last_res_time"] else event["last_res_time"])
            minutes_since_end = int((now - last_res_time).total_seconds() / 60)
            event_data["minutes_since_end"] = minutes_since_end
        
        formatted_events.append(event_data)
    
    return formatted_events

# User rates event they've attended
@app.post("/rate-event")
async def rate_event(data: RatingCreate, current_user: User = Depends(get_current_user)):

    # Rating scale 1 to 5
    if data.rating < 0 or data.rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 0 and 5"
        )

    # Check user attended event that is to be rated
    reservation_check = (
        supabase.table("reservations")
        .select("res_id")
        .eq("user_id", current_user.user_id)
        .eq("event_id", data.event_id)
        .execute()
    )

    if not reservation_check.data:
        raise HTTPException(
            status_code=403,
            detail="You can only rate events you have attended"
        )

    # Add rating to table
    insert_resp = (
        supabase.table("ratings")
        .insert({
            "event_id": data.event_id,
            "user_id": current_user.user_id,
            "rating": data.rating,
            "description": data.description or ""
        })
        .execute()
    )

    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to submit rating")

    return {"message": "Rating submitted successfully!"}

# Get ratings for event
@app.get("/ratings/{event_id}")
async def get_ratings_for_event(event_id: int):
    # Return the rating of event
    response = (
        supabase.table("ratings")
        .select("*")
        .eq("event_id", event_id)
        .order("id", desc=True)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=500, detail="Could not fetch ratings")

    return {"ratings": response.data}

# ======================== Host POV: Latest event ======================= #
# Define GET endpoint to fetch latest host event
@app.get("/host-latest-event")
async def get_host_latest_event(current_user: User = Depends(get_current_user)):

    # Query for most recent event created by host
    event_resp = (
        # Using the events table
        supabase.table("events")
        # Select all fields from events table
        .select("*")
        # Filter to only get events created by the host
        .eq("creator_id", current_user.user_id)
        # Order events by the creation time
        .order("created_at", desc=True)
        # Extract most recent event - assumption host only hosts 1 event at a time
        .limit(1)
        .execute()
    )

    # If no events found, return a message
    if not event_resp.data:
        return {"message": "No events found for this host."}

    # Return just the event info (no joins, no extras)
    return {
        "event": event_resp.data[0]
    }


# ======================== Host Profile ======================= #
# Profile contains all events created by host. Split into active and archive sections.

@app.get("/host/events")
async def get_host_events(current_user: User = Depends(get_current_user)):
    # Select all fields of events table and the specific food details needed
    # Filter for just users who are event creators, sort by order for neat display
    event_response = (
        supabase.table("events")
        .select("*, foods(food_id, food_name, quantity)")
        .eq("creator_id", current_user.user_id)
        .order("start_time", desc=True)
        .execute()
    )

    if not event_response.data:
        return {"active_events": [], "archived_events": []}

    # Get list of events from query
    all_events = event_response.data

    # Get today's date
    # today_utc = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    now = datetime.now(timezone.utc).isoformat()

    # Categorising events as active or archive
    active = []
    archived = []

    # Loop through all events of the creator
    # If start time is greater than today consider active
    for event in all_events:
        if event["start_time"] <= now and event["last_res_time"] >= now:
            active.append(event)
        else:
            archived.append(event)

    # Get the finalised active-archive lists
    return {
        "active_events": active,
        "archived_events": archived
    }

# ======================== User Profile ======================= #
@app.get("/user/reservations")
async def get_user_reservations(current_user: User = Depends(get_current_user)):
    try:
        # Join reservations with event and food database info
        response = (
            supabase.table("reservations")
            .select("""
                res_id,
                res_time,
                quantity,
                notes,
                food_name,
                events (
                    event_id,
                    event_name,
                    description,
                    start_time,
                    last_res_time
                )
            """)
            # Filter reservations of certain user
            .eq("user_id", current_user.user_id)
            # Descending order
            .order("res_time", desc=True)
            .execute()
        )
        # Check for errors
        if not response.data:
            return {"reservations": []}
        # Return list of reservation
        return {"reservations": response.data}
    # Catch exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

# ==================== MAIN ==================== #
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)