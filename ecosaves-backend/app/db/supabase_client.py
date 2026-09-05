from functools import lru_cache
from supabase import create_client, Client
from app.core.config import settings


@lru_cache
def get_supabase() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_KEY not set. Add them to your .env file.")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


@lru_cache
def get_supabase_anon() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise RuntimeError("SUPABASE_URL / SUPABASE_KEY not set. Add them to your .env file.")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)