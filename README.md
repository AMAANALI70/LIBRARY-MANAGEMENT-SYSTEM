# Library Management System (LibSys)

A robust, full-stack application designed to manage library operations efficiently. This system handles user authentication, book inventory with real-time stock tracking, borrowing/returning logic with fine calculations, and administrative dashboards.

## 🚀 Features

### 🔐 Authentication & Security
-   **User Registration & Login**: Secure access using JSON Web Tokens (JWT).
-   **Role-Based Access Control**: Distinct features for **Admins** and **Users**.
-   **Password Hashing**: Passwords are encrypted using `bcryptjs`.

### 📚 Book Management (Admin)
-   **Add Books**: Admins can add new books with details like Title, Author, ISBN, Genre, Year, and Total Copies.
-   **Inventory Tracking**: Automatically tracks `Total Copies` vs `Available Copies`.
-   **Statistics Dashboard**: View real-time stats on total inventory, active borrows, and overdue books.

### 📖 Borrowing System
-   **Real-Time Availability**: Users can only borrow books if copies are available.
-   **Duplicate Check**: Prevents users from borrowing the same book twice if they already have an active copy.
-   **Due Dates**: Automatically sets a due date (14 days from borrow).
-   **Transactions**: Uses MySQL transactions to ensure data integrity (e.g., locking stock during borrow).

### ↩️ Returning & Fines
-   **Return Processing**: Updates stock immediately upon return.
-   **Fine Calculation**: Automatically calculates fines for overdue books at a rate of **$1.00 per day**.
-   **History**: Users can view their full borrowing history and any fines incurred.

### 🔍 Search & Discovery
-   **Advanced Search**: Find books by Title, Author, or ISBN.
-   **Filters**: Filter results by Genre and Publication Year.

---

## 🛠️ Tech Stack

-   **Frontend**: React.js, Vite, Vanilla CSS (Custom Design System).
-   **Backend**: Node.js, Express.js.
-   **Database**: MySQL.
-   **Authentication**: JWT (JSON Web Tokens).

---

## ⚙️ Setup Instructions

### 1. Prerequisites
-   Node.js installed.
-   MySQL Server installed and running.

### 2. Database Setup
Navigate to the root directory and run the setup scripts in order:
```bash
# 1. Create Database and Tables
node create_tables.js

# 2. Insert Sample Data (Optional)
node insert_sample_data.js
```
*Note: Ensure your MySQL user is `root` with no password, or update the connection config in `server.js` and the scripts.*

### 3. Backend Setup
```bash
# Install dependencies
npm install

# Start the server
node server.js
```
The server will run on `http://localhost:3000`.

### 4. Frontend Setup
Navigate to the client directory:
```bash
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will open at `http://localhost:5173`.

---

## 👤 Usage Guide

### Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@lib.com` | `admin123` |
| **User** | `user@lib.com` | `user123` |

### Key Workflows
1.  **Log in** as an Admin to add books and view stats.
2.  **Log in** as a User to browse, search, and borrow books.
3.  Go to **"My Books"** to view due dates and return books (fines will appear if overdue).
