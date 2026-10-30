"""
MandiSetu — Automated Database Initializer
Tests PostgreSQL connection, creates mandisetu_db if missing, and initializes all 12 module tables and demo users.
"""
import asyncio
import sys
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def init():
    print("=" * 60)
    print("🌾 MandiSetu Database Initializer")
    print("=" * 60)

    # 1. Test connecting to default postgres DB first to create mandisetu_db
    conn_strings = [
        "postgresql+asyncpg://mandisetu:mandisetu@localhost:5432/mandisetu_db",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres",
        "postgresql+asyncpg://postgres:admin@localhost:5432/postgres",
        "postgresql+asyncpg://postgres:root@localhost:5432/postgres",
    ]

    connected = False
    for cs in conn_strings:
        try:
            print(f"[*] Testing connection: {cs.split('@')[0]}@...")
            engine = create_async_engine(cs, isolation_level="AUTOCOMMIT")
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
                print(f"[✓] Successfully connected to PostgreSQL!")
                connected = True

                # If connected to postgres root, create mandisetu user and db
                if "mandisetu_db" not in cs:
                    print("[*] Creating database 'mandisetu_db' and user 'mandisetu'...")
                    try:
                        await conn.execute(text("CREATE USER mandisetu WITH PASSWORD 'mandisetu';"))
                    except Exception:
                        pass
                    try:
                        await conn.execute(text("ALTER USER mandisetu CREATEDB;"))
                    except Exception:
                        pass
                    try:
                        await conn.execute(text("CREATE DATABASE mandisetu_db OWNER mandisetu;"))
                        print("[✓] Created database 'mandisetu_db'!")
                    except Exception as e:
                        print(f"[*] Database note: {e}")
                await engine.dispose()
                break
        except Exception as e:
            # Try next
            continue

    # 2. Now run table initialization
    try:
        from app.core.database import create_all_tables, AsyncSessionLocal
        from app.models import User, UserRole
        from app.core.security import hash_password
        from sqlalchemy import select

        print("[*] Creating tables for all 12 modules...")
        await create_all_tables()
        print("[✓] Tables created successfully!")

        # 3. Seed demo and owner users
        print("[*] Seeding default demo and owner accounts...")
        accounts = [
            {"email": "tanmayapradhan2322@gmail.com", "full_name": "TanmayA (Platform Owner)", "role": UserRole.ADMIN, "state": "Odisha", "district": "Cuttack", "password": "sanurimi@2210"},
            {"email": "farmer@demo.com", "full_name": "Ramesh Patel (Farmer)", "role": UserRole.FARMER, "state": "Maharashtra", "district": "Nashik", "password": "demo1234"},
            {"email": "buyer@demo.com", "full_name": "AgriCorp Traders (Buyer)", "role": UserRole.BUYER, "state": "Maharashtra", "district": "Navi Mumbai", "business_name": "AgriCorp Agro Commodities Ltd", "password": "demo1234"},
            {"email": "admin@demo.com", "full_name": "Demo Admin (Restricted)", "role": UserRole.ADMIN, "state": "Delhi", "district": "New Delhi", "password": "demo1234"},
        ]

        async with AsyncSessionLocal() as db:
            for acc in accounts:
                res = await db.execute(select(User).where(User.email == acc["email"]))
                if not res.scalar_one_or_none():
                    u = User(
                        email=acc["email"],
                        full_name=acc["full_name"],
                        hashed_password=hash_password(acc["password"]),
                        role=acc["role"],
                        state=acc["state"],
                        district=acc["district"],
                        business_name=acc.get("business_name"),
                        is_active=True,
                        is_verified=True,
                    )
                    db.add(u)
            await db.commit()
            print("[✓] Accounts seeded: TanmayA (Owner), farmer@demo.com, buyer@demo.com, admin@demo.com")

        print("\n✨ MANDISETU BACKEND & DATABASE ARE READY TO RUN!")
        print("Run: uvicorn app.main:app --reload --port 8000\n")

    except Exception as e:
        print(f"\n[!] Note: {e}")
        print("Tip: If you're using a custom postgres password, update DATABASE_URL in backend/.env")

if __name__ == "__main__":
    asyncio.run(init())
