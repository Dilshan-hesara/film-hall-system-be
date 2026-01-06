# MKD Cinema - Smart Movie Ticket Booking System

A comprehensive, full-stack web application designed for modern cinema management. This system features a seamless Customer Booking Portal, a powerful Super Admin Dashboard for resource management, and a Receptionist POS for handling counter sales and shift reports.

Built with the MERN Stack (MongoDB, Express, React, Node).

##  Live Deployment

| Component | Status | URL |
|-----------|:------:|-----|
| **MKD Cinemas (Live System)** | ✅ Live | [https://mkd.dilshanhesara.com](https://mkd.dilshanhesara.com) |

---

## Advanced Features

* **AI Smart Assistant:** Integrated Google Gemini AI (Flash Model) chatbot for instant customer support regarding movies and showtimes.
* **Digital QR Ticketing:** Automated generation of unique QR Codes for secure ticket validation and entrance scanning.
* **PDF Downloads:** Feature to generate and download Booking Tickets and Daily Reception Shift Reports as PDF files.
* **Email Notifications:** Automated email system sending booking confirmations and e-tickets directly to the user.
* **Real-time Seat Booking:** Interactive visual seat map with real-time status updates (Available/Occupied/Selected).
* **POS Shift Reporting:** Auto-calculation of daily Cash/Card sales and Net Cash-in-Hand generation for receptionists.
* **Interactive Analytics Dashboard:** Visual charts and graphs tracking revenue trends, top-performing movies, and user growth.
* **Secure Authentication:** Advanced security using JWT Access Tokens and HttpOnly Refresh Tokens for session management.

---

## Key Features

### Super Admin & Resource Management
*(Complete control over the cinema ecosystem)*

- **Master Dashboard:** Real-time analytics on Total Revenue, Active Users, and Ticket Sales. Visual charts for monthly performance.
- **Hall Management:**
  - **Add/Edit Halls:** Create cinema halls with custom names.
  - **Dynamic Seating:** Define row/column layouts to automatically generate interactive seat maps.
- **Analytics:** Visual charts for monthly revenue, top movies, and user stats.
- **Movie Management:**
  - **CRUD Operations:** Manage movie details (Title, Genre, Cast, Language, Poster).
  - **Status Toggle:** Instantly switch movies between "Now Showing" and "Coming Soon".
- **Schedule & Showtimes:**
  - **Smart Scheduling:** Assign movies to specific halls and time slots.
  - **Conflict Detection:** Prevents double-booking a hall at the same time.
- **Admin Management:** Create and manage accounts for Admins and Receptionists.

### Admin Dashboard
- **Analytics:** Visual charts for monthly revenue, top movies, and user stats.
- **Manage Resources:** CRUD operations for Movies, Halls, and Showtimes.
- **User Management:** Manage users, admins, and staff roles.

### Reception / POS (Counter System)
*(Optimized for fast-paced counter operations)*

- **Point of Sale (POS):** Fast ticket booking interface for walk-in customers.
- **Shift End Reports:**
  - Generate Daily Collection Reports.
  - Automatically calculates Cash vs. Card sales and Net Cash in Hand.
- **Ticket Scanning:** Built-in QR Code scanner to validate tickets at the entrance.
- **Booking Management:** Cancel bookings and process refunds instantly.
- **Search:** Find bookings by Booking ID or Mobile Number.

### User Portal (Customer Side)
*(Engaging and user-friendly experience)*

- **AI Chatbot Assistant:** Integrated Google Gemini AI (Flash Model) to answer questions about movies, showtimes, and ticket prices in natural language.
- **Interactive Booking:**
  - Visual seat selection (Green = Available, Red = Booked, Yellow = Selected).
  - Mobile-responsive design.
- **User Dashboard:** View booking history, download QR tickets, and manage profile.
- **Watchlist:** Save upcoming movies to a personal watchlist.

### Security & Architecture
- **JWT Authentication:** Secure login using Access Tokens and Refresh Tokens (HttpOnly Cookies).
- **RBAC (Role-Based Access Control):** Strict separation between User, Receptionist, Admin, and Super Admin routes.
- **Data Validation:** Robust backend validation using Mongoose schemas.

---

## Tech Stack

### Frontend
- **React.js (Vite):** High-performance UI library.
- **TypeScript:** For type safety and scalable code.
- **Tailwind CSS:** Modern, responsive styling.
- **Lucide React:** Icon set.
- **Axios:** API Integration.

### Backend
- **Node.js & Express.js:** Scalable REST API.
- **MongoDB Atlas:** Cloud Database.
- **Mongoose:** Object Data Modeling.
- **Nodemailer:** Email notifications.
- **Google Generative AI:** AI Chatbot integration.
- **JsonWebToken (JWT):** Secure Authentication.
- **Bcrypt.js:** Password hashing.

### Deployment
- **Frontend:** Vercel
- **Backend:** Vercel (Serverless)
- **Database:** MongoDB Atlas

---

## System Architecture

The system follows a Decoupled Client-Server Architecture utilizing the MERN stack with strict type safety.

- **Client-Server Model:** A React.js Single Page Application (SPA) communicating with a Node.js/Express backend via RESTful endpoints.
- **RESTful API with TypeScript:** Strongly typed API layer ensuring data consistency and scalable code maintenance.
- **Service-Controller Pattern:** Modular backend structure where business logic (services), request handling (controllers), and data models (models) are strictly separated.
- **Secure Authentication Strategy:**
  - **Access Tokens:** Short-lived JWTs for stateless API access.
  - **Refresh Tokens:** Secure HttpOnly cookies for session rotation and auto-login.
  - **RBAC (Role-Based Access Control):** Middleware-enforced permission levels for User, Receptionist, Admin, and Super Admin.
- **AI Service Integration:** Dedicated controller handling communication between the user frontend and Google Gemini API for chatbot responses.
- **Cloud-Native Deployment:**
  - **Frontend & Backend:** Hosted on Vercel.
  - **Database:** Hosted on MongoDB Atlas.
