# ImpactLink — Data-Driven Volunteer Coordination Platform

> Connect volunteers with urgent community needs through intelligent matching and data aggregation.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS      |
| Backend   | Node.js + Express                   |
| Database  | MongoDB (Atlas or local)            |
| Auth      | JWT (jsonwebtoken + bcryptjs)       |
| Charts    | Recharts                            |
| Fonts     | Syne + DM Sans (Google Fonts)       |

---

## Project Structure

```
impactlink/
├── server/          ← Express API
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   ├── seed.js
│   └── .env.example
└── client/          ← React app
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── context/
    │   ├── services/
    │   └── ...
    └── ...
```

---

## Quick Start

### 1. Clone & install dependencies

```bash
# Backend
cd impactlink/server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

```bash
# In server/
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `CLIENT_URL` — `http://localhost:5173`

### 3. Seed demo data

```bash
cd server
node seed.js
```

This creates 3 demo accounts, 1 approved NGO, 6 tasks, and 5 community needs.

### 4. Run the app

Open **two terminals**:

```bash
# Terminal 1 — backend
cd server
npm run dev      # starts on http://localhost:5000

# Terminal 2 — frontend
cd client
npm run dev      # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173)

---

## Demo Accounts

| Email                | Password   | Role        | Dashboard         |
|----------------------|------------|-------------|-------------------|
| volunteer@demo.com   | demo1234   | Volunteer   | /volunteer        |
| ngo@demo.com         | demo1234   | NGO Admin   | /org              |
| admin@demo.com       | demo1234   | Super Admin | /admin            |

---

## Pages & URLs

### Public
| URL         | Page             |
|-------------|------------------|
| `/`         | Landing page     |
| `/login`    | Sign in          |
| `/register` | Create account   |

### Volunteer (`/volunteer/*`)
| URL                        | Page                    |
|----------------------------|-------------------------|
| `/volunteer`               | Dashboard               |
| `/volunteer/tasks`         | Browse all open tasks   |
| `/volunteer/my-tasks`      | Applied / assigned work |
| `/volunteer/profile`       | Edit profile & skills   |
| `/volunteer/notifications` | Inbox                   |
| `/volunteer/leaderboard`   | Top contributors        |

### NGO Admin (`/org/*`)
| URL           | Page                         |
|---------------|------------------------------|
| `/org`        | Dashboard + charts           |
| `/org/tasks`  | Create & manage tasks        |
| `/org/needs`  | Document community needs     |
| `/org/profile`| Edit org info                |

### Super Admin (`/admin/*`)
| URL                 | Page                     |
|---------------------|--------------------------|
| `/admin`            | Platform overview        |
| `/admin/users`      | All users table          |
| `/admin/orgs`       | Approve NGOs             |
| `/admin/analytics`  | Charts + KPIs            |

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/updateprofile

GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/apply
PUT    /api/tasks/:id/applicants/:userId
GET    /api/tasks/org/mine
GET    /api/tasks/volunteer/mine

GET    /api/needs
POST   /api/needs
PUT    /api/needs/:id
DELETE /api/needs/:id

GET    /api/orgs
GET    /api/orgs/mine
GET    /api/orgs/:id
PUT    /api/orgs/:id
PUT    /api/orgs/:id/approve

GET    /api/users/volunteers
GET    /api/users/leaderboard
GET    /api/users/stats

GET    /api/notifications
PUT    /api/notifications/read-all
PUT    /api/notifications/:id/read

GET    /api/health
```

---

## What's next (Phase 2 features to add)

- [ ] File upload — survey CSV/PDF ingestion via Multer + Cloudinary
- [ ] Geospatial needs map — Mapbox heatmap overlay
- [ ] Smart skill-matching algorithm — auto-suggest volunteers per task
- [ ] Real-time notifications — Socket.io
- [ ] Email notifications — Nodemailer (SMTP)
- [ ] Volunteer hours logging + certificates
- [ ] Task comments / messaging thread
- [ ] Mobile-responsive sidebar for NGO/Admin views
