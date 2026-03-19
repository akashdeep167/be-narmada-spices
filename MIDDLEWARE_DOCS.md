# Authentication & Authorization Middleware

## Overview

This project now includes JWT-based authentication and role-based authorization middleware for protected routes.

## Middleware Files

### `src/middleware/auth.middleware.ts`

Contains two middleware functions:

#### 1. `authMiddleware`

- Verifies JWT token from `Authorization` header (format: `Bearer <token>`)
- If token is invalid or expired, returns `401 Unauthorized` with redirect to `/login`
- Extracts user ID and role, stores in `req.user`
- All protected routes should use this middleware

#### 2. `authorize(...allowedRoles: string[])`

- Takes role names as parameters
- Checks if authenticated user's role is in allowed roles
- Returns `403 Forbidden` if user lacks required role
- Must be used after `authMiddleware`

## Role-Based Route Access

### PURCHASER (Form Fill & View Own Slips)

- **POST** `/api/purchase-slips` - Create purchase slip
- **GET** `/api/purchase-slips` - View only their own purchase slips (auto-filtered)
- `authorize("PURCHASER")`

### SUPERVISOR (Table View & Confirm)

- **GET** `/api/purchase-slips` - View all purchase slips
- **PUT** `/api/purchase-slips/:id` - Update/confirm purchase slips
- `authorize("SUPERVISOR", "ADMIN")`

### FINANCER (Payment Processing)

- Status: Not yet implemented
- Will need routes for payment processing
- `authorize("FINANCER")`
- Suggested endpoints:
  - `PUT /api/purchase-slips/:id/process-payment`
  - `PUT /api/purchase-slips/:id/payment-status`

### ADMIN/Inventory Manager (Payment Done & Full Access)

- **DELETE** `/api/purchase-slips/:id` - Delete purchase slips
- **PUT** `/api/purchase-slips/:id` - Update status to PAYMENT_DONE
- **GET/POST/PUT/DELETE** `/api/users` - User management
- `authorize("ADMIN")`

## Current Protected Routes

### Purchase Slip Routes (`/api/purchase-slips`)

```
POST   /                 → PURCHASER only (create slip)
GET    /                 → PURCHASER (own slips), SUPERVISOR, ADMIN (all slips)
PUT    /:id              → SUPERVISOR, ADMIN
DELETE /:id              → ADMIN only
```

### User Routes (`/api/users`)

```
GET    /                 → ADMIN only
GET    /:id              → ADMIN only
POST   /                 → ADMIN only
PUT    /:id              → ADMIN only
DELETE /:id              → ADMIN only
```

### Auth Routes (`/api/auth`)

```
POST   /signin           → No auth required (public)
```

## Usage Example

### Frontend - Login & Get Token

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "akash",
    "password": "password123"
  }'
```

Response:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "akash",
    "name": "Akash",
    "role": "PURCHASER"
  }
}
```

### Subsequent Requests - Include Token

```bash
curl -X POST http://localhost:5000/api/purchase-slips \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "slipNo": "PS001",
    "date": "2026-03-19",
    "farmer": "John Doe",
    ...
  }'
```

## Token Structure

The JWT token contains:

```javascript
{
  id: number,        // User ID
  role: string,      // User role (PURCHASER, SUPERVISOR, FINANCER, ADMIN)
  iat: number,       // Issued at
  exp: number        // Expires in 7 days
}
```

## Error Responses

### 401 Unauthorized (No/Invalid Token)

```json
{
  "message": "Access denied. No token provided.",
  "redirectTo": "/login"
}
```

### 401 Unauthorized (Token Expired)

```json
{
  "message": "Token expired. Please login again.",
  "redirectTo": "/login"
}
```

### 403 Forbidden (Insufficient Permissions)

```json
{
  "message": "Access denied. Required roles: ADMIN"
}
```

## Next Steps

1. **Payment Routes** - Create endpoints for FINANCER payment processing
2. **Frontend Integration** - Store token in localStorage/sessionStorage
3. **Request Interceptor** - Add token to all API requests automatically
4. **Token Refresh** - Implement refresh token mechanism (optional)
5. **Route Guards** - Add frontend route protection based on user role

## Environment Variables

Ensure `.env` has:

```
JWT_SECRET=your_secret_key_here
```
