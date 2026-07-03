# Lavishn Health Care Guide — Backend API

Node.js + Express + MongoDB REST API for the Lavishn Health Care Guide React frontend.

## Stack

- **Express** — HTTP server
- **MongoDB + Mongoose** — database
- **JWT** — authentication
- **bcryptjs** — password hashing
- **express-validator** — request validation
- **nodemailer** — optional contact email notifications

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

API runs at **http://localhost:5000** by default.

## Environment variables

| Variable                         | Required | Description                                                  |
| -------------------------------- | -------- | ------------------------------------------------------------ |
| `MONGODB_URI`                    | Yes      | MongoDB connection string                                    |
| `JWT_SECRET`                     | Yes      | Secret for signing JWT tokens                                |
| `PORT`                           | No       | Server port (default `5000`)                                 |
| `CLIENT_URL`                     | No       | Frontend origin for CORS (default `http://localhost:5173`)   |
| `JWT_EXPIRES_IN`                 | No       | Token expiry (default `7d`)                                  |
| `SMTP_*`                         | No       | Email settings for contact notifications                     |
| `CONTACT_NOTIFY_EMAIL`           | No       | Recipient for contact alerts (default `support@lavishn.com`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | No       | Seed first admin user if none exists                         |

## API endpoints

### Health

```
GET /api/health
```

### Contact (public)

```
POST /api/contact
```

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919035987707",
  "subject": "Hospital inquiry",
  "message": "I need help finding a cardiac specialist."
}
```

Saves to MongoDB collection `contact_inquiries`. Sends email to `support@lavishn.com` when SMTP is configured.

### Auth

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me          (Bearer token required)
```

**Register / Login body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

`name` is only required for register.

**Login response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "user" },
    "token": "eyJhbG..."
  }
}
```

Store the token and send it as:

```
Authorization: Bearer <token>
```

### Appointments (authenticated)

```
POST   /api/appointments
GET    /api/appointments
GET    /api/appointments/:id
PATCH  /api/appointments/:id/status
DELETE /api/appointments/:id        (admin only)
```

**Create appointment body:**

```json
{
  "patientName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+919035987707",
  "hospital": "Apollo Hospital Bangalore",
  "service": "Cardiac Consultation",
  "preferredDate": "2026-07-15",
  "preferredTime": "10:00",
  "notes": "First visit"
}
```

- Regular users see only their own appointments.
- Admins see all appointments and can update any status or delete.
- Users can cancel their own appointments via `PATCH` with `{ "status": "cancelled" }`.

## Frontend integration

Replace SheetDB in `ContactForm.jsx`:

```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function submitContact(form) {
  const response = await fetch(`${API_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  if (!response.ok) {
    throw new Error("Contact submission failed");
  }

  return response.json();
}
```

For login, call `POST /api/auth/login` and store the JWT in `localStorage` for appointment requests.

## Deploy on Vercel (free)

### 1. Push to GitHub

Push the repo. Do **not** commit `.env`.

### 2. Import on Vercel

1. [vercel.com](https://vercel.com) → sign up with GitHub
2. **Add New → Project** → import repo
3. **Root Directory** → `backend`
4. Framework: **Other**
5. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
6. **Deploy**

### 3. Test

`https://YOUR-PROJECT.vercel.app/api/health`

### 4. Custom domain

Vercel → **Settings → Domains** → add `backend.lavishn.com`

### 5. Namecheap DNS

**Advanced DNS** → CNAME: Host `backend` → Value from Vercel (e.g. `cname.vercel-dns.com`)

Remove any A record for `backend` first.

### 6. Frontend

```env
VITE_API_URL=https://backend.lavishn.com
```

### MongoDB Atlas

**Network Access** → allow `0.0.0.0/0` for Vercel serverless.

## Contact

- **Phone/WhatsApp:** +91 9035987707
- **Email:** support@lavishn.com
- **Address:** 01 Bhavani Road, Hebbagodi, Bangalore, Karnataka, India
