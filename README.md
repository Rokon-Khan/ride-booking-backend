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

**Live API**: [https://ride-booking-sytem.vercel.app/](https://ride-booking-sytem.vercel.app/)

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
