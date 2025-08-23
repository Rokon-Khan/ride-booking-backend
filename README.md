# Ride Booking System

A secure, scalable, and role-based backend API for a ride booking system, inspired by platforms like Uber and Pathao. Built with Express.js and Mongoose, this system supports riders requesting rides, drivers managing ride assignments, and admins overseeing operations.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Usage](#api-usage)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Project Overview
The Ride Booking System is a RESTful API designed to facilitate ride-hailing services with distinct roles: riders, drivers, and admins. It includes JWT-based authentication, role-based authorization, and comprehensive ride management logic. The system ensures secure password hashing, modular architecture, and proper handling of edge cases for a production-ready solution.

## **Live API**: [https://ride-booking-sytem.vercel.app/](https://ride-booking-sytem.vercel.app/)
## Admin Password for admin actions
```
{
  "email": "admin@admin.com",
  "password": "Pass@135"
}
```

## Features
- **Authentication & Authorization**:
  - JWT-based login with roles: admin, rider, driver.
  - Secure password hashing using bcrypt.
  - Token refresh and logout functionality.
- **Rider Capabilities**:
  - Request rides with pickup and destination locations (lat/lng or address).
  - Cancel rides before driver acceptance.
  - View ride history and current ride status.
- **Driver Capabilities**:
  - Set online/offline availability.
  - Accept/reject ride requests.
  - Update ride status (picked_up, in_transit, completed).
  - View earnings and ride history.
- **Admin Capabilities**:
  - Manage users (block/unblock) and drivers (approve/suspend/reactivate).
  - View all rides and generate reports (ride stats, user activity, earnings).
  - Manually update ride statuses for support purposes.
- **Utility Features**:
  - Fare estimation based on distance.
  - Nearby driver search using coordinates.
  - Server health check endpoint.
- **Business Rules**:
  - One active ride per rider/driver.
  - Suspended drivers cannot accept rides.
  - Full ride history with timestamps for all status changes.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **Deployment**: Vercel
- **Tools**: TypeScript, ESLint, Prettier

## Installation
To run the project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Rokon-Khan/ride-booking-backend.git
   cd ride-booking-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory with the following:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ride_booking
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Run MongoDB**:
   Ensure MongoDB is running locally or provide a cloud MongoDB URI.

5. **Start the Server**:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000`.

## API Usage
The API follows RESTful conventions and is documented with detailed endpoints. Below is a summary of key endpoints:

### Authentication
- `POST /api/auth/register`: Register a new user (rider/driver).
- `POST /api/auth/login`: Login and receive JWT.
- `POST /api/auth/logout`: Blacklist JWT (optional).
- `GET /api/auth/me`: Get current user profile.

### Rider Endpoints
- `POST /api/rides/request`: Request a new ride.
- `PATCH /api/rides/:id/cancel`: Cancel a ride (pre-acceptance).
- `GET /api/rides/history`: View past rides.
- `GET /api/rides/current`: View active ride.

### Driver Endpoints
- `GET /api/drivers/available-rides`: List pending ride requests.
- `PATCH /api/rides/:id/accept`: Accept a ride.
- `PATCH /api/drivers/availability`: Set online/offline status.
- `GET /api/drivers/earnings`: View earnings.

### Admin Endpoints
- `GET /api/users`: List all users.
- `PATCH /api/drivers/:id/approve`: Approve a driver.
- `GET /api/reports/rides`: Generate ride statistics.

### Utility Endpoints
- `GET /api/fare/estimate`: Estimate ride fare.
- `GET /api/health`: Check server status.

**Full Documentation**: Use tools like Postman or Swagger to explore all endpoints at [https://ride-booking-sytem.vercel.app/](https://ride-booking-sytem.vercel.app/).

**Example Request** (Ride Request):
```bash
curl -X POST https://ride-booking-sytem.vercel.app/api/rides/request \
-H "Authorization: Bearer <your_jwt_token>" \
-H "Content-Type: application/json" \
-d '{
  "pickup": { "lat": 23.8103, "lng": 90.4125 },
  "destination": { "lat": 23.8041, "lng": 90.4152 }
}'
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "rideId": "507f1f77bcf86cd799439011",
    "status": "requested",
    "pickup": { "lat": 23.8103, "lng": 90.4125 },
    "destination": { "lat": 23.8041, "lng": 90.4152 }
  }
}
```

## Deployment
The API is deployed on Vercel and accessible at:  
[https://ride-booking-sytem.vercel.app/](https://ride-booking-sytem.vercel.app/)

To deploy your own instance:
1. Push the repository to GitHub.
2. Connect to Vercel via the Vercel CLI:
   ```bash
   vercel
   ```
3. Configure environment variables in Vercel dashboard.
4. Deploy and monitor using Vercel’s pipeline.

## Project Structure
```plaintext
src/
├── modules/
│   ├── auth/          # Authentication logic
│   ├── user/          # User management
│   ├── driver/        # Driver-specific logic
│   ├── ride/          # Ride management
├── middlewares/       # JWT, role-based middleware
├── config/            # Database, env configs
├── utils/             # Helper functions
├── app.ts             # Express app setup
├── server.ts           # Entry point
```

## Full API Usage GuideLines

# Ride Booking System API Endpoints

## Authentication & Authorization
| Method | Endpoint | Role | Description | Notes |
|--------|----------|------|-------------|-------|
| POST | `/api/auth/register` | Public | Register user (rider/driver). | Requires email, password, role (rider/driver), and profile data. Returns JWT. Role specified in payload. Uses bcrypt for password hashing. |
| POST | `/api/auth/login` | Public | Login for all roles (admin, rider, driver). | Requires email and password. Returns JWT with userId, role, and status (active/suspended). |
| POST | `/api/auth/logout` | Authenticated | Blacklist JWT (optional). | Invalidates token if using short-expiry JWT. Returns 200 on success. |
| GET | `/api/auth/me` | Authenticated | Get current user profile. | Returns role-based data (e.g., driver approval status). 401 if invalid JWT. |

## Rider-Specific Endpoints
| Method | Endpoint | Role | Description | Notes |
|--------|----------|------|-------------|-------|
| POST | `/api/rides/request` | Rider | Request a new ride. | Requires pickup and destination (lat/lng or address). Returns ride ID and status. 400 if rider is blocked or has active ride. |
| PATCH | `/api/rides/:id/cancel` | Rider | Cancel a ride. | Only allowed if not accepted by driver. Returns 403 if already accepted. 404 if ride not found. |
| GET | `/api/rides/history` | Rider | List all past rides. | Returns paginated list of completed/canceled rides. |
| GET | `/api/rides/current` | Rider | Get active ride. | Returns current ride details or 404 if none active. |
| GET | `/api/rides/:id` | Rider | View specific ride details. | Only accessible for rider's own rides. Returns 403 if unauthorized, 404 if not found. |

## Driver-Specific Endpoints
| Method | Endpoint | Role | Description | Notes |
|--------|----------|------|-------------|-------|
| GET | `/api/drivers/available-rides` | Driver | List pending ride requests. | Returns nearby unaccepted rides (geo-filter optional). 403 if driver is offline or suspended. |
| PATCH | `/api/rides/:id/accept` | Driver | Accept a ride request. | Requires driver to be online, approved, and without active ride. Returns 400 if ride already taken. |
| PATCH | `/api/rides/:id/reject` | Driver | Reject a ride request. | Requires ride to be available. Returns 400 if invalid. |
| PATCH | `/api/rides/:id/status` | Driver | Update ride status. | Allowed transitions: `picked_up` → `in_transit` → `completed`. Logs timestamps. 403 if not assigned driver. |
| GET | `/api/rides/current` | Driver | Get currently assigned ride. | Returns active ride or 404 if none. |
| GET | `/api/rides/history` | Driver | View completed rides. | Returns paginated list of completed rides. |
| PATCH | `/api/drivers/availability` | Driver | Set online/offline status. | Payload: `{ available: true }`. 403 if driver is suspended. |
| GET | `/api/drivers/earnings` | Driver | View earnings history. | Returns total and per-ride earnings based on fare logic. |

## Ride Management (Shared & Admin)
| Method | Endpoint | Role | Description | Notes |
|--------|----------|------|-------------|-------|
| GET | `/api/rides` | Admin | List all rides. | Supports filters (status, date, user, driver). Returns paginated list. |
| GET | `/api/rides/:id` | Admin | View any ride by ID. | Returns full ride details. 404 if not found. |
| PATCH | `/api/rides/:id/status` | Admin | Manually update ride status. | Optional for debugging/support. Logs timestamps. 403 if invalid transition. |
| DELETE | `/api/rides/:id` | Admin | Delete ride record. | Only allowed for `requested` rides not yet accepted. 403 otherwise. |

## User & Driver Management (Admin-Only)
| Method | Endpoint | Role | Description | Notes |
|--------|----------|------|-------------|-------|
| GET | `/api/users` | Admin | List all users. | Returns paginated list with filters (role, status). |
| GET | `/api/users/:id` | Admin | View user details. | Includes role-specific data (e.g., driver vehicle info). 404 if not found. |
| PATCH | `/api/users/:id/block` | Admin | Block a user account. | Prevents login and actions. 400 if user not found. |
| PATCH | `/api/users/:id/unblock` | Admin | Unblock a user account. | Restores access. 400 if user not found. |
| GET | `/api/drivers` | Admin | List all drivers. | Includes approval status, availability, vehicle info. |
| PATCH | `/api/drivers/:id/approve` | Admin | Approve a driver. | Enables ride acceptance. 400 if already approved. |
| PATCH | `/api/drivers/:id/suspend` | Admin | Suspend a driver. | Disables ride acceptance. 400 if already suspended. |
| PATCH | `/api/drivers/:id/reactivate` | Admin | Reactivate a driver. | Restores driver permissions. 400 if not suspended. |

## Reports & Analytics (Admin-Only)
| Method | Endpoint | Role | Description | Notes |
|--------|----------|------|-------------|-------|
| GET | `/api/reports/rides` | Admin | Daily/monthly ride stats. | Returns ride count and revenue data. |
| GET | `/api/reports/users` | Admin | User stats. | Returns active users and signup trends. |
| GET | `/api/reports/drivers` | Admin | Driver stats. | Returns online drivers, completion rate, avg earnings. |
| GET | `/api/reports/earnings` | Admin | Platform revenue. | Returns commission and revenue breakdown. |

## Utility & Info Endpoints
| Method | Endpoint | Role | Description | Notes |
|--------|----------|------|-------------|-------|
| GET | `/api/location/nearby-drivers` | Rider | Find nearby available drivers. | Optional. Uses coordinates for geo-search. Returns list of drivers. |
| GET | `/api/fare/estimate` | Rider | Estimate ride fare. | Requires pickup and destination (lat/lng). Returns estimated cost. |
| GET | `/api/health` | Public | Server health check. | Returns 200 if server is operational. |

## Notes
- **Authentication**: All protected routes use `authenticateJWT` middleware. JWT includes `userId`, `role`, and `status`. Returns 401 for invalid tokens and 403 for unauthorized roles.
- **Role-Based Access**:
  - Rider: Access to ride request, cancellation, history, current ride, profile, and utility endpoints.
  - Driver: Access to ride acceptance/rejection, status updates, availability, earnings, and profile.
  - Admin: Access to all endpoints, including management and analytics.
- **Ride Lifecycle**: Statuses: `requested` → `accepted` → `picked_up` → `in_transit` → `completed`. Timestamps logged for each change.
- **Validations**:
  - Only one active ride per driver/rider (400 if violated).
  - Suspended drivers cannot go online or accept rides (403).
  - Riders cannot cancel accepted rides (403).
  - Admin-only actions require `authorizeRole(['admin'])` middleware.
- **Data Storage**:
  - Locations stored as lat/lng for geo-search compatibility.
  - Ride history includes full details (pickup, destination, driver, rider, timestamps, status).
- **Edge Cases**:
  - No drivers available: `/api/rides/request` returns 503.
  - Invalid status transitions: Returns 403.
  - Non-existent resources: Returns 404.
- **Status Codes**:
  - 200: Successful GET/PATCH.
  - 201: Successful POST (e.g., ride request).
  - 400: Invalid request or business rule violation.
  - 401: Invalid/missing JWT.
  - 403: Unauthorized role or action.
  - 404: Resource not found.
  - 503: Service unavailable (e.g., no drivers).


## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please ensure code follows ESLint and Prettier rules. Include tests for new features.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
