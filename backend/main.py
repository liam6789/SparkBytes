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
import os
import jwt
import bcrypt
import smtplib # Send emails
from email.mime.text import MIMEText  # Format "forget" email


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
    allow_origins=["http://localhost:3000"],
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
    role: Literal['regular_user', 'event_creator'] = 'regular_user' # Only want valid roles

# Model for returning user information (excludes password)
class User(BaseModel):
    user_id: int 
    email: EmailStr
    role: str

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

class CreateEvent(BaseModel):
    name: str
    description: str
    start: datetime
    end: datetime 
    food: list[FoodItem]

class CreateRes(BaseModel):
    food_id: int
    event_id: int
    quantity: int
    pickup_time: datetime
    note: str


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
            role=user_data["role"]
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

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

    response = (
        supabase.table("events")
        .insert({"creator_id": creator_id, "event_name": name, "description": description, "start_time": start_time, "last_res_time":last_res_time})
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
            .insert({"food_name": food.name, "quantity": food.quantity, "event_id": event_id})
            .execute()
        )
        # print (response)
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert food item"
            )

    return {"message": "Success"}

@app.post("/createreservation")
async def create_reservation(data: CreateRes, current_user: User = Depends(get_current_user)):
    user_id = current_user.user_id
    response = (
        supabase.table("reservations")
        .insert({"user_id": user_id, "food_id": data.food_id, "event_id": data.event_id, "quantity": data.quantity, "res_time": data.pickup_time.isoformat(), "notes": data.note})
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
            "role": user_data.role
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
            role=created_user["role"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

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
            role=user_data["role"]
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
        sender_password = os.getenv("SENDER_PASSWORD")  # Account password
        smtp_server = "smtp.gmail.com" # Sever for gmail
        smtp_port = 587

        # Email content
        subject = "Password Reset Request - Spark! Bytes"
        content = f"""
        Hello {email},

        We received a request to reset your password for your SparkBytes account. 
        Click the link below to reset your password (Valid for 30 minutes):

        http://localhost:3000/reset-password?token={reset_token}

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
        if datetime.now(timezone.utc) > datetime.fromtimestamp(payload["exp"]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token has expired.")
        
        # Hash the new password
        new_hashed_password = hash_password(request.new_password)
        
        # Update the user's password in the database
        response = supabase.table("users").update({"password": new_hashed_password}).eq("user_id", user_id).execute()
        
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update password.")
        
        return {"message": "Password has been successfully reset. You can now log in with your new password."}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The reset link has expired. Please request a new one.")
    
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token.")

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


# ==================== MAIN ==================== #
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)