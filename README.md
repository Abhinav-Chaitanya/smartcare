# SmartCare - Hospital Management System

SmartCare is a comprehensive, full-stack Hospital Management System designed to streamline healthcare operations. It provides dedicated interfaces for patients, doctors, and administrators, facilitating appointment booking, schedule management, payments, and analytics.

---

## 🌟 Key Features

### 🧑‍⚕️ Patient Portal (Frontend)
- **User Authentication:** Secure registration and login for patients.
- **Appointment Booking:** Browse doctors, view available slots, and book appointments seamlessly.
- **Appointment Management:** View past and upcoming appointments, with specific date filtering and status tracking.
- **Online Payments:** Secure checkout and payment processing via **Razorpay**.
- **Profile Management:** Update personal details and manage profile pictures (securely stored in **Cloudinary**).

### 👨‍💼 Admin Dashboard (Admin)
- **Comprehensive Analytics:** Visual representations of application data and hospital statistics using **Recharts**.
- **Doctor Management:** Add, update, and manage doctor profiles, specializations, and availability slots.
- **Appointment Insights:** Advanced filtering and tracking of all system appointments.
- **Report Generation:** Export tabular data and reports to PDF (**jsPDF**) and Excel (**xlsx**) formats.
- **User Management:** Oversee patient accounts and platform activities.

### ⚙️ Backend & API
- **RESTful API Architecture:** Robust endpoints securely routing all data requests between clients and the database.
- **Secure Authentication:** Utilizing **JSON Web Tokens (JWT)** and **bcrypt** for data protection.
- **Database Management:** Efficient schema management with **MongoDB** and **Mongoose**.
- **Automated Tasks:** Scheduled chron jobs (e.g. appointment reminders/status updates) via **node-cron**.
- **Email Notifications:** Automated email alerts and communication using **Nodemailer**.

---

## 💻 Tech Stack

### Frontend & Admin Panel
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Data Visualization & Export:** Recharts, jsPDF, xlsx (Admin)
- **Notifications:** React Toastify

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) + Mongoose
- **Authentication:** JWT, bcrypt
- **File Storage:** Cloudinary, Multer
- **Payment Gateway:** Razorpay
- **Email Service:** Nodemailer

---

## 📂 Project Structure

```bash
SmartCare/
├── admin/          # React + Vite admin dashboard application
├── backend/        # Node.js + Express API server
└── frontend/       # React + Vite patient web application
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine
- [MongoDB](https://www.mongodb.com/) instance running (local or Atlas)
- **Cloudinary** account for image hosting and API keys
- **Razorpay** account for payment gateway credentials
- SMTP Email credentials for **Nodemailer**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd SmartCare
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file and add your environment variables:
   # PORT, MONGODB_URI, JWT_SECRET, CLOUDINARY_*, RAZORPAY_*, etc.
   npm run dev    # Starts server using nodemon
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file with your required frontend variables (e.g., VITE_API_URL, VITE_RAZORPAY_KEY_ID)
   npm run dev    # Starts Vite dev server
   ```

4. **Admin Panel Setup:**
   ```bash
   cd ../admin
   npm install
   # Create a .env file with your required admin variables (e.g., VITE_API_URL)
   npm run dev    # Starts Vite dev server
   ```

---

## 📄 Scripts Overview

### Backend (`/backend`)
- `npm start`: Run the Node server for production
- `npm run dev`: Run the server with nodemon for active development

### Frontend (`/frontend`) & Admin (`/admin`)
- `npm run dev`: Start the fast Vite development server
- `npm run build`: Build the application for production deployment
- `npm run lint`: Run ESLint analysis across the project files
- `npm run preview`: Preview the minified production build locally

---

## 📝 License
This project is licensed under the ISC License.