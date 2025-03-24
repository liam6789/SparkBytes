# ==================== IMPORTS ==================== #

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import uvicorn
from supabase import create_client, Client
from dotenv import load_dotenv
import os


# ==================== DATABASE SETUP ==================== #
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

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

# ==================== ROUTES ==================== #
@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


# ==================== MAIN ==================== #
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)