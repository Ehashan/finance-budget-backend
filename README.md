# Finance Budget Backend

Backend REST API for the Personal Finance & Budget Tracking System.

This backend handles authentication, transaction management, budget tracking, category management, dashboard analytics, and database operations.

---

## Features

- User Registration & Login Authentication
- JWT Authentication & Protected Routes
- Password Encryption using bcrypt
- Transaction CRUD Operations
- Budget CRUD Operations
- Category CRUD Operations
- Dashboard Summary APIs
- MongoDB Database Integration
- Error Handling Middleware
- RESTful API Architecture

---

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt.js
- dotenv
- cors
- nodemon

---

## Project Structure

```bash
finance-budget-backend/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── budgetController.js
│   ├── categoryController.js
│   ├── dashboardController.js
│   └── transactionController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Transaction.js
│   ├── Budget.js
│   └── Category.js
│
├── routers/
│   ├── authRoutes.js
│   ├── budgetRoutes.js
│   ├── categoryRoutes.js
│   ├── dashboardRoutes.js
│   └── transactionRoutes.js
│
├── .env
├── index.js
├── package.json
└── README.md
```

---

## Installation

Clone repository, move into project folder, and install dependencies:

```bash
git clone https://github.com/your-username/finance-budget-backend.git && cd finance-budget-backend && npm install
```

---

## Environment Variables

Create a `.env` file in the project root and add:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/finance_budget
JWT_SECRET=your_secret_key
```

---

## Run Backend

Start backend in development mode:

```bash
npm run dev
```

Start backend in production mode:

```bash
npm start
```

Backend server will run at:

```bash
http://localhost:5001
```

---

## API Endpoints

### Authentication

```bash
POST /api/auth/register
POST /api/auth/login
```

### Transactions

```bash
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

### Budgets

```bash
GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/:id
DELETE /api/budgets/:id
```

### Categories

```bash
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Dashboard

```bash
GET /api/dashboard
```

---

## Quick Start (One Command)

Clone, install dependencies, and run backend:

```bash
git clone https://github.com/your-username/finance-budget-backend.git && cd finance-budget-backend && npm install && npm run dev
```

---


## Security Features

- JWT Authentication
- Password hashing with bcrypt
- Protected middleware routes
- Environment variable configuration
- Secure API architecture

---

## Future Improvements

- Email verification
- Password reset functionality
- Monthly financial reports
- Budget notifications
- Role-based access control
- Audit logging
- Cloud database deployment

---

## Author

**Eranda Hashan**
