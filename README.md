# MandiSetu 🌾

> **Market-intelligence and transaction-enablement platform bridging smallholder farmers/FPOs with buyers**

[![CI/CD](https://github.com/YOUR_USERNAME/mandisetu/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/mandisetu/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 Overview

MandiSetu ("Market Bridge") is a full-stack agricultural platform that eliminates information asymmetry between smallholder farmers and buyers by providing:

- **Real-time mandi price discovery** from Agmarknet / data.gov.in
- **ML-driven price forecasting** using Facebook Prophet
- **True net-realization calculator** — takes-home value after transport, commission, storage costs
- **Optimal sale-window recommendations** combining price forecast + perishability curves
- **Digital lot listing + buyer matching** with verified buyer credibility scoring
- **CV-based quality grading** from produce images
- **Weather-integrated risk advisory** (IMD + OpenWeatherMap)
- **End-to-end transaction tracking** with dispute resolution

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Frontend                           │
│               (Vite + Tailwind CSS + Recharts)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────▼──────────────────────────────────────┐
│                       FastAPI Backend                            │
│                    (Python 3.11 + asyncio)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Auth/RBAC│ │ ML Engine│ │ Price Svc│ │ Weather/Grading  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
└──────┬───────────────────────────────────────────┬─────────────┘
       │                                           │
┌──────▼───────┐                        ┌──────────▼──────────┐
│  PostgreSQL  │                        │    Redis Cache       │
│  (SQLAlchemy)│                        │  (1hr price cache)   │
└──────────────┘                        └─────────────────────┘
```

---

## 📦 Modules

| # | Module | Key Feature |
|---|--------|-------------|
| 1 | User & Role Management | JWT auth, RBAC (Admin/Farmer/Buyer/FPO) |
| 2 | Price Discovery & Trend Engine | Agmarknet API + Prophet ML forecasting |
| 3 | Net-Realization Calculator | Transport + commission + storage cost ranking |
| 4 | Produce Listing / Lot Creation | Digital lot with quality grading integration |
| 5 | Buyer–Farmer Matching | Match-score algorithm + offer system |
| 6 | Transaction Tracking | State-machine with full audit trail |
| 7 | Sale-Window Recommendations | Price forecast × spoilage curve optimization |
| 8 | Buyer Verification & Scoring | Reliability score + Gold/Silver/Bronze badge |
| 8b| Logistics Coordination | Distance-based freight cost estimation |
| 9 | Dispute Resolution | Ticket system with evidence upload |
| 10| Quality Grading (CV) | ONNX model / heuristic image analysis |
| 11| Weather Risk Advisory | OpenWeatherMap + commodity risk profiles |
| 12| Analytics / Admin Dashboard | Platform-wide stats + Recharts visualizations |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ · Node.js 20+ · PostgreSQL 16+ · Redis 7+

### 1. Generate seed dataset

```bash
cd backend
python app/ml/prepare_dataset.py
```

### 2. Start backend

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # edit with your API keys
uvicorn app.main:app --reload
```

### 3. Start frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Or use Docker Compose

```bash
docker-compose up --build
```

→ **Frontend**: http://localhost:5173  
→ **API Docs**: http://localhost:8000/api/docs  

---

## 🔑 API Keys Needed

| Key | Where to Get | Used For |
|-----|-------------|---------|
| `DATA_GOV_IN_API_KEY` | [data.gov.in](https://data.gov.in) free registration | Live mandi prices |
| `OPENWEATHER_API_KEY` | [openweathermap.org](https://openweathermap.org/appid) free tier | Weather advisory |

> **Note**: The platform works without API keys using the bundled synthetic seed dataset (2 years of realistic price data for 6 commodities × 4 mandis each).

---

## 📊 Data Sources

| Source | Data | License |
|--------|------|---------|
| [Agmarknet / data.gov.in](https://data.gov.in) | Daily mandi prices | Government Open Data (OGD) |
| [OpenWeatherMap](https://openweathermap.org) | Real-time weather | CC BY-SA 4.0 |
| [eNAM portal](https://enam.gov.in) | Trade reference data | Government Open Data |
| IMD (Indian Met Dept) | Rainfall / weather | Public domain |

---

## 🧪 Testing

```bash
cd backend
pytest tests/ -v --asyncio-mode=auto
```

---

## 📁 Project Structure

```
mandisetu/
├── backend/          # FastAPI + SQLAlchemy + ML services
├── frontend/         # React + Vite + Tailwind CSS
├── research_paper/   # IEEE-style LaTeX paper
├── docker-compose.yml
├── DEPLOYMENT.md     # Full deployment guide (Vercel/Render + AWS)
└── README.md
```

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

## 🤝 Contributing

1. Fork → create feature branch → PR to `develop`
2. Run `pytest` before submitting
3. Follow module numbering convention in router/service names
