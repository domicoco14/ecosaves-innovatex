# EcoSaves — Backend API

This directory contains the backend REST API services for **EcoSaves**, built with **FastAPI (Python)** and backed by **Supabase (Postgres)**.

## Overview
- **Framework**: FastAPI (Python)
- **Database**: Supabase (Postgres)
- **Authentication**: JWT token authentication
- **Integration**: Consumed by the EcoSaves React Native Expo frontend located in `/frontend`.

## Setup & Running Locally
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload
```
