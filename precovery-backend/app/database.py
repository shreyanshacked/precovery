from supabase import create_client, Client
from app.config import get_settings
from functools import lru_cache

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """
    Returns a Supabase client using the SERVICE ROLE key.
    This bypasses RLS — all access control is enforced at the API layer via JWT/RBAC.
    """
    global _supabase_client
    if _supabase_client is None:
        s = get_settings()
        if not s.supabase_url or not s.supabase_service_role_key:
            raise RuntimeError(
                "Supabase credentials not configured. "
                "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
            )
        _supabase_client = create_client(s.supabase_url, s.supabase_service_role_key)
    return _supabase_client


def get_supabase_anon() -> Client:
    """
    Returns a Supabase client using the ANON key.
    Use only for operations that should respect RLS.
    """
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_anon_key)
