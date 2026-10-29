# MandiSetu — Deployment Guide

## Option A: Local → Vercel + Render (Recommended for team review)

### Step 1: Push to GitHub

```bash
cd C:\Users\ASUS\.gemini\antigravity\scratch\mandisetu
git init
git add .
git commit -m "feat: MandiSetu prototype — all 12 modules"
git remote add origin https://github.com/YOUR_USERNAME/mandisetu.git
git push -u origin main
```

### Step 2: Deploy Backend to Render (free)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   ```
   DATABASE_URL=postgresql+asyncpg://...   (from Supabase or Render Postgres)
   REDIS_URL=redis://...                   (from Upstash free tier)
   SECRET_KEY=your_production_secret
   OPENWEATHER_API_KEY=your_key
   DATA_GOV_IN_API_KEY=your_key
   ```
5. Add a Render PostgreSQL database (free tier: 90-day, 256MB)

### Step 3: Deploy Frontend to Vercel

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

Set environment variable in Vercel dashboard:
```
VITE_API_URL=https://mandisetu-backend.onrender.com/api/v1
```

---

## Option B: AWS Deployment

### Architecture
```
Route 53 → CloudFront → S3 (Frontend)
         → ALB → ECS Fargate (Backend FastAPI)
                  → RDS PostgreSQL db.t3.micro
                  → ElastiCache Redis cache.t2.micro
```

### Step 1: Build and push Docker image

```bash
cd backend
docker build -t mandisetu-backend .

aws ecr create-repository --repository-name mandisetu-backend
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com
docker tag mandisetu-backend:latest YOUR_AWS_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com/mandisetu-backend:latest
docker push YOUR_AWS_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com/mandisetu-backend:latest
```

### Step 2: Create RDS PostgreSQL

```bash
aws rds create-db-instance \
  --db-instance-identifier mandisetu-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username mandisetu \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20 \
  --region ap-south-1
```

### Step 3: Create ElastiCache Redis

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id mandisetu-redis \
  --cache-node-type cache.t2.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --region ap-south-1
```

### Step 4: Deploy Frontend to S3 + CloudFront

```bash
cd frontend
npm run build

aws s3 mb s3://mandisetu-frontend
aws s3 sync dist/ s3://mandisetu-frontend --delete
aws cloudfront create-distribution --origin-domain-name mandisetu-frontend.s3.amazonaws.com
```

### Step 5: Create ECS Task + Service

Use the AWS Console or Copilot CLI:
```bash
copilot init --app mandisetu --type "Load Balanced Web Service" \
  --name backend --dockerfile backend/Dockerfile
copilot deploy
```

---

## Local Development (no Docker required)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 14+ running locally
- Redis running locally

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Generate seed dataset
python app/ml/prepare_dataset.py

# Copy .env
copy .env.example .env
# Edit .env with your keys

# Run
uvicorn app.main:app --reload
# → http://localhost:8000/api/docs
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### With Docker (all services)

```bash
docker-compose up --build
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000/api/docs
# Postgres: localhost:5432
# Redis:    localhost:6379
```

---

## Free API Keys Required

| Service | Get Key | Purpose |
|---------|---------|---------|
| [data.gov.in](https://data.gov.in/user/register) | Free registration | Agmarknet live prices |
| [openweathermap.org](https://openweathermap.org/appid) | Free tier | Weather advisory |

---

## Vercel + Render Free Tier Limits

| Service | Limit |
|---------|-------|
| Vercel | Unlimited static deploys |
| Render | 750 hrs/month free compute |
| Render Postgres | 90 days, 256MB |
| Upstash Redis | 10,000 requests/day free |
