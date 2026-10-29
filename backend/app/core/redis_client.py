"""
MandiSetu — Redis Client with resilient in-memory fallback
"""
import json
from typing import Any, Optional
from app.core.config import settings

_redis = None
_memory_cache = {}


async def get_redis():
    global _redis
    if _redis is None:
        import redis.asyncio as aioredis
        _redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=2.0,
        )
    return _redis


async def cache_set(key: str, value: Any, ttl: int = settings.CACHE_TTL_SECONDS) -> None:
    try:
        r = await get_redis()
        await r.setex(key, ttl, json.dumps(value))
    except Exception:
        _memory_cache[key] = value


async def cache_get(key: str) -> Optional[Any]:
    try:
        r = await get_redis()
        data = await r.get(key)
        return json.loads(data) if data else None
    except Exception:
        return _memory_cache.get(key)


async def cache_delete(key: str) -> None:
    try:
        r = await get_redis()
        await r.delete(key)
    except Exception:
        _memory_cache.pop(key, None)
