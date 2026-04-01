# Placement Drive Registration & Tracking System (Groq AI + JWT + RBAC) ✅

A final-year BTech full-stack mini project.

✅ Frontend: React (Vite) + TailwindCSS (Glassmorphism / Liquid Glass UI)  
✅ Backend: Node.js + Express.js  
✅ MongoDB Atlas (free tier)  
✅ AI: Groq API → Resume analysis + Mock interview questions  
✅ Security: JWT, bcrypt, RBAC, validation, sanitization, Helmet, rate limit, optional CSRF  

---

## Folder Structure
```
placement-drive-groq-rbac/
  frontend/
  backend/
  README.md
```

---

# Features

## Student
- Register for placement drive
- Upload resume PDF
- AI resume suggestions automatically generated
- Check selection status

## Admin
- View all registered students
- Update selection status (pending / selected / rejected)
- Remove ineligible entries
- Generate mock interview questions using Groq

## Advanced
- Search/filter by name, drive, skills, status
- Dashboard analytics (counts)
- Optional email notifications (Resend)

---

# 1) Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend: `http://localhost:5000`

Fill `.env`:
- `MONGODB_URI`
- `JWT_SECRET`
- `GROQ_API_KEY` (console.groq.com)

---

# 2) Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

---

# 3) RBAC - Create Admin
All signups are created as `role=student`.

To create admin:
1. Signup once from UI
2. MongoDB Atlas → Collections → `users`
3. Change:
```json
"role": "admin"
```

Login again → admin dashboard enabled.

---

# 4) Groq AI Setup
Backend `.env`:
```
GROQ_API_KEY=...
GROQ_MODEL=llama-3.1-8b-instant
```

---

# Optional Email (Resend)
Add:
```
RESEND_API_KEY=...
ADMIN_EMAIL=delivered@resend.dev
```

---

# Deployment (Free Tier)

## Backend → Render
- Root: `backend`
- Build: `npm install`
- Start: `npm start`
- Add env vars

## Frontend → Vercel
- Root: `frontend`
- Add env:
```
VITE_API_BASE_URL=https://<render-backend-url>
```

---

# Security Notes (Viva)
- bcrypt password hashing
- JWT + expiry
- logout invalidation (blacklist TTL)
- helmet
- rate limit
- sanitization + validation
- optional CSRF (`ENABLE_CSRF=1`)
- HTTPS ready

---

## Author
Final Year BTech Mini Project - Placement Drive Tracking System
