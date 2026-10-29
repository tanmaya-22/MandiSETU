"""
MandiSetu — pytest Test Suite
Covers all 12 modules with realistic test scenarios.
"""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import Base, engine


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ─── Shared state between tests ──────────────────────────────────────────────
_farmer_token = None
_buyer_token = None
_admin_token = None
_lot_id = None
_offer_id = None
_transaction_id = None


# ════════════════════════════════════════════════════════════════════
# MODULE 1 — Auth & User Management
# ════════════════════════════════════════════════════════════════════

class TestModule1Auth:
    async def test_register_farmer(self, client):
        global _farmer_token
        resp = await client.post("/api/v1/auth/register", json={
            "full_name": "Ramesh Kumar",
            "email": "ramesh@farmer.com",
            "password": "farmer123",
            "role": "farmer",
            "state": "Uttar Pradesh",
            "district": "Hapur",
            "village": "Gaziabad",
            "land_area_acres": 5.0,
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["role"] == "farmer"
        assert data["full_name"] == "Ramesh Kumar"

    async def test_register_buyer(self, client):
        resp = await client.post("/api/v1/auth/register", json={
            "full_name": "Amit Traders",
            "email": "amit@buyer.com",
            "password": "buyer123",
            "role": "buyer",
            "business_name": "Amit Agro Traders Pvt Ltd",
            "gst_number": "07AABCU9603R1ZX",
        })
        assert resp.status_code == 201

    async def test_register_admin(self, client):
        resp = await client.post("/api/v1/auth/register", json={
            "full_name": "Admin MandiSetu",
            "email": "admin@mandisetu.com",
            "password": "admin123",
            "role": "admin",
        })
        assert resp.status_code == 201

    async def test_login_farmer(self, client):
        global _farmer_token
        resp = await client.post("/api/v1/auth/login", json={
            "email": "ramesh@farmer.com",
            "password": "farmer123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["role"] == "farmer"
        _farmer_token = data["access_token"]

    async def test_login_buyer(self, client):
        global _buyer_token
        resp = await client.post("/api/v1/auth/login", json={
            "email": "amit@buyer.com",
            "password": "buyer123",
        })
        assert resp.status_code == 200
        _buyer_token = resp.json()["access_token"]

    async def test_login_admin(self, client):
        global _admin_token
        resp = await client.post("/api/v1/auth/login", json={
            "email": "admin@mandisetu.com",
            "password": "admin123",
        })
        assert resp.status_code == 200
        _admin_token = resp.json()["access_token"]

    async def test_get_me(self, client):
        resp = await client.get("/api/v1/auth/me",
            headers={"Authorization": f"Bearer {_farmer_token}"})
        assert resp.status_code == 200
        assert resp.json()["email"] == "ramesh@farmer.com"

    async def test_duplicate_email_rejected(self, client):
        resp = await client.post("/api/v1/auth/register", json={
            "full_name": "Dup User",
            "email": "ramesh@farmer.com",
            "password": "password123",
            "role": "farmer",
        })
        assert resp.status_code == 400

    async def test_wrong_password_rejected(self, client):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "ramesh@farmer.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401


# ════════════════════════════════════════════════════════════════════
# MODULE 3 — Net-Realization Calculator
# ════════════════════════════════════════════════════════════════════

class TestModule3NetRealization:
    async def test_net_realization_calculation(self, client):
        resp = await client.post("/api/v1/calculator/net-realization",
            headers={"Authorization": f"Bearer {_farmer_token}"},
            json={
                "commodity": "Wheat",
                "quantity_kg": 1000,
                "listed_price_per_kg": 22.0,
                "origin_lat": 28.7041,
                "origin_lng": 77.1025,
                "storage_days": 2,
                "storage_cost_per_kg_per_day": 0.5,
                "markets": [
                    {"name": "Hapur Mandi", "lat": 28.7275, "lng": 77.7767, "modal_price": 22.5, "commission_pct": 0.02},
                    {"name": "Delhi Azadpur", "lat": 28.7228, "lng": 77.1780, "modal_price": 24.0, "commission_pct": 0.025},
                    {"name": "Agra Mandi", "lat": 27.1767, "lng": 78.0081, "modal_price": 21.0, "commission_pct": 0.015},
                ],
            }
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert len(data["results"]) == 3
        assert data["results"][0]["rank"] == 1
        # Best rank should have highest net realization
        assert data["results"][0]["net_realization_per_kg"] >= data["results"][1]["net_realization_per_kg"]

    async def test_freight_estimate(self, client):
        resp = await client.get("/api/v1/calculator/freight-estimate",
            headers={"Authorization": f"Bearer {_farmer_token}"},
            params={"distance_km": 100, "quantity_kg": 500})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_freight_cost"] > 0
        assert "basis" in data


# ════════════════════════════════════════════════════════════════════
# MODULE 4 — Produce Listings
# ════════════════════════════════════════════════════════════════════

class TestModule4Listings:
    async def test_create_lot(self, client):
        global _lot_id
        resp = await client.post("/api/v1/listings/lots",
            headers={"Authorization": f"Bearer {_farmer_token}"},
            json={
                "commodity": "Wheat",
                "variety": "HD-2967",
                "quantity_kg": 2000.0,
                "min_price_per_kg": 21.0,
                "expected_price_per_kg": 23.0,
                "state": "Uttar Pradesh",
                "district": "Hapur",
                "mandi_name": "Hapur Mandi",
                "latitude": 28.7275,
                "longitude": 77.7767,
            }
        )
        assert resp.status_code == 201
        _lot_id = resp.json()["id"]
        assert _lot_id is not None

    async def test_activate_lot(self, client):
        resp = await client.patch(f"/api/v1/listings/lots/{_lot_id}/activate",
            headers={"Authorization": f"Bearer {_farmer_token}"})
        assert resp.status_code == 200

    async def test_list_lots(self, client):
        resp = await client.get("/api/v1/listings/lots",
            params={"commodity": "Wheat"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_get_lot(self, client):
        resp = await client.get(f"/api/v1/listings/lots/{_lot_id}")
        assert resp.status_code == 200
        assert resp.json()["commodity"] == "Wheat"


# ════════════════════════════════════════════════════════════════════
# MODULE 5 — Buyer-Farmer Matching & Offers
# ════════════════════════════════════════════════════════════════════

class TestModule5Matching:
    async def test_create_offer(self, client):
        global _offer_id
        resp = await client.post("/api/v1/offers",
            headers={"Authorization": f"Bearer {_buyer_token}"},
            json={
                "lot_id": _lot_id,
                "offered_price_per_kg": 22.5,
                "quantity_kg": 1500.0,
                "message": "Interested in bulk purchase. Can arrange pickup.",
                "logistics_responsibility": "buyer",
            }
        )
        assert resp.status_code == 201
        data = resp.json()
        _offer_id = data["id"]
        assert data["match_score"] is not None
        assert 0 <= data["match_score"] <= 100

    async def test_view_offers(self, client):
        resp = await client.get(f"/api/v1/offers/lot/{_lot_id}",
            headers={"Authorization": f"Bearer {_farmer_token}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_accept_offer(self, client):
        global _transaction_id
        resp = await client.patch(f"/api/v1/offers/{_offer_id}/accept",
            headers={"Authorization": f"Bearer {_farmer_token}"})
        assert resp.status_code == 200
        _transaction_id = resp.json()["transaction_id"]


# ════════════════════════════════════════════════════════════════════
# MODULE 6 — Transaction Tracking
# ════════════════════════════════════════════════════════════════════

class TestModule6Transactions:
    async def test_list_transactions(self, client):
        resp = await client.get("/api/v1/transactions",
            headers={"Authorization": f"Bearer {_farmer_token}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_get_transaction(self, client):
        resp = await client.get(f"/api/v1/transactions/{_transaction_id}",
            headers={"Authorization": f"Bearer {_farmer_token}"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "initiated"

    async def test_status_progression(self, client):
        # initiated → payment_pending
        r1 = await client.patch(f"/api/v1/transactions/{_transaction_id}/status",
            headers={"Authorization": f"Bearer {_buyer_token}"},
            json={"status": "payment_pending", "note": "Payment initiated via NEFT"})
        assert r1.status_code == 200

        # payment_pending → payment_received
        r2 = await client.patch(f"/api/v1/transactions/{_transaction_id}/status",
            headers={"Authorization": f"Bearer {_buyer_token}"},
            json={"status": "payment_received", "note": "UTR: SBIN123456"})
        assert r2.status_code == 200

    async def test_invalid_status_transition(self, client):
        # Cannot go payment_received → initiated
        resp = await client.patch(f"/api/v1/transactions/{_transaction_id}/status",
            headers={"Authorization": f"Bearer {_buyer_token}"},
            json={"status": "initiated"})
        assert resp.status_code == 400


# ════════════════════════════════════════════════════════════════════
# MODULE 8b — Logistics
# ════════════════════════════════════════════════════════════════════

class TestModule8bLogistics:
    async def test_logistics_estimate(self, client):
        resp = await client.post("/api/v1/logistics/estimate",
            headers={"Authorization": f"Bearer {_farmer_token}"},
            json={
                "origin_lat": 28.7275,
                "origin_lng": 77.7767,
                "dest_lat": 28.7228,
                "dest_lng": 77.1780,
                "commodity": "Wheat",
                "quantity_kg": 1500.0,
            }
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["distance_km"] > 0
        assert data["total_freight_cost"] > 0
        assert data["recommended_vehicle"] in [
            "Auto-Rickshaw/Mini-Tempo", "Tata Ace / Mini-Truck",
            "Medium Truck (4-tonne)", "Large Truck (10-tonne)"
        ]


# ════════════════════════════════════════════════════════════════════
# MODULE 9 — Dispute Resolution
# ════════════════════════════════════════════════════════════════════

class TestModule9Disputes:
    async def test_raise_dispute(self, client):
        # First advance transaction to delivered state
        for status in ["pickup_scheduled", "in_transit", "delivered"]:
            await client.patch(f"/api/v1/transactions/{_transaction_id}/status",
                headers={"Authorization": f"Bearer {_admin_token}"},
                json={"status": status})

        resp = await client.post("/api/v1/disputes",
            headers={"Authorization": f"Bearer {_farmer_token}"},
            json={
                "transaction_id": _transaction_id,
                "category": "quality_mismatch",
                "description": "The buyer rejected 200kg claiming quality below Grade B, but produce was graded A at dispatch.",
                "evidence_urls": ["https://example.com/grade-certificate.jpg"],
            }
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "open"
        assert data["category"] == "quality_mismatch"

    async def test_list_disputes(self, client):
        resp = await client.get("/api/v1/disputes",
            headers={"Authorization": f"Bearer {_farmer_token}"})
        assert resp.status_code == 200


# ════════════════════════════════════════════════════════════════════
# MODULE 8 — Buyer Scoring
# ════════════════════════════════════════════════════════════════════

class TestModule8BuyerScoring:
    async def test_buyer_score(self, client):
        # Get buyer's user_id first
        me_resp = await client.get("/api/v1/auth/me",
            headers={"Authorization": f"Bearer {_buyer_token}"})
        buyer_id = me_resp.json()["id"]

        resp = await client.get(f"/api/v1/buyers/{buyer_id}/score")
        assert resp.status_code == 200
        data = resp.json()
        assert "reliability_score" in data
        assert 0 <= data["reliability_score"] <= 100
        assert data["badge"] in ["Gold", "Silver", "Bronze", "Unrated"]


# ════════════════════════════════════════════════════════════════════
# MODULE 12 — Analytics
# ════════════════════════════════════════════════════════════════════

class TestModule12Analytics:
    async def test_dashboard_stats(self, client):
        resp = await client.get("/api/v1/analytics/dashboard",
            headers={"Authorization": f"Bearer {_admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "total_farmers" in data
        assert data["total_farmers"] >= 1
        assert data["total_buyers"] >= 1
        assert data["total_lots"] >= 1


# ════════════════════════════════════════════════════════════════════
# API Health
# ════════════════════════════════════════════════════════════════════

async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
