# StyleHub – Modern Online Clothing Store

A complete, responsive, full-stack e-commerce web application designed for selling fashion apparel for men and women. Built from the ground up with clean HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js REST APIs, and MySQL relational database integration.

---

## 📸 Overview & Features

### 🌟 Customer Storefront
- **Home Page (`index.html`)**: Hero banner with seasonal promotions, value proposition guarantees, Shop Men & Shop Women curated portals, dynamic Featured Highlights, New Arrivals carousel, promo codes, and newsletter subscription.
- **Shop Catalog (`shop.html`)**: Complete clothing catalog with instant search, multi-department filtering (Men, Women, All), category filtering (shirts, t-shirts, tops, jeans, pants, dresses, jackets), size selection, price slider, and sorting (Price, Newest, Name).
- **Product Details (`product.html`)**: Rich gallery zoom, description, color pills, dynamic stock alerts ("Low stock" vs "In stock"), interactive size selection, quantity increments, and related item recommendations.
- **Shopping Cart (`cart.html`)**: Persistent `localStorage` bag, item quantity adjusters, item removal, live free shipping progress tracker ($75 threshold), coupon code calculation (`STYLE20` for 20% off), sales tax estimation, and simulated checkout modal.
- **About Page (`about.html`)**: Brand story, sustainable textile practices, and tailoring principles.
- **Contact Page (`contact.html`)**: Client inquiry form with strict frontend and backend validation.

### 🔐 Staff Management Portal (`admin/login.html` & `admin/dashboard.html`)
- **JWT & Bcrypt Authentication**: Secure login with hashed passwords and protected endpoints.
- **Inventory Metrics**: Real-time counter of total styles, inventory units, average item price, and low stock warnings.
- **Full Product CRUD**: Add new garments, edit existing price/sizes/stock/images, and delete discontinued items with instant modal interfaces.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Custom Properties & Flexbox/Grid), Vanilla JavaScript (ES6+), Fetch API |
| **Backend** | Node.js, Express.js, RESTful API architecture |
| **Security** | JWT (jsonwebtoken), Bcrypt password hashing (bcryptjs), CORS, Input validation |
| **Database** | MySQL with `mysql2/promise` connection pooling & parameterized queries |
| **Version Control** | Git & GitHub |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.x or v20+ recommended)
- **Git**
- **MySQL** (Optional for local testing; the backend includes a built-in fallback mode so the application starts instantly even before MySQL is configured!)

### 2. Installation
```powershell
# Navigate to the backend folder
cd "c:\Users\Public\hrutika_first project\backend"

# Install dependencies
npm install
```

### 3. Launching the Full-Stack Application
```powershell
# In the backend directory:
node src/server.js
```

Once launched, open your web browser to:
- **Storefront**: [http://localhost:5000](http://localhost:5000)
- **Shop Catalog**: [http://localhost:5000/shop.html](http://localhost:5000/shop.html)
- **Shopping Bag**: [http://localhost:5000/cart.html](http://localhost:5000/cart.html)
- **Admin Login**: [http://localhost:5000/admin/login.html](http://localhost:5000/admin/login.html)
- **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

**Default Admin Credentials:**
- Email: `admin@stylehub.store`
- Password: `admin123`

---

## 🗄️ MySQL Database Setup

1. Open your MySQL client (MySQL Workbench, phpMyAdmin via XAMPP, or command line).
2. Execute the schema script:
   ```sql
   source backend/database/schema.sql;
   ```
3. Populate with starter clothing products & admin user:
   ```sql
   source backend/database/seed.sql;
   ```
4. Verify your database credentials in `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=stylehub_db
   DB_PORT=3306
   ```

---

## 📡 REST API Documentation

### Products Endpoints
- `GET /api/products` — Retrieve all clothing products (supports `?gender=men`, `?category=shirts`, `?search=cotton`)
- `GET /api/products/:id` — Retrieve a single product by numeric ID
- `POST /api/products` — Create a new garment (*Admin only, Bearer token required*)
- `PUT /api/products/:id` — Update existing garment details (*Admin only*)
- `DELETE /api/products/:id` — Delete a garment (*Admin only*)

### Authentication Endpoints
- `POST /api/auth/login` — Authenticate admin, returns JWT token
- `GET /api/auth/me` — Retrieve logged-in administrator information (*Admin only*)
- `POST /api/auth/logout` — Logout user session

### Contact Endpoint
- `POST /api/contact` — Validate and store customer support message

### Health Check
- `GET /api/health` — Verify server status, uptime, and database connectivity

---

## 🧪 Running Automated Tests
```powershell
cd "c:\Users\Public\hrutika_first project\backend"
node tests/api.test.js
```
Runs comprehensive integration tests verifying all 14 API endpoints, validation logic, token checks, and CRUD transactions.

---

## 🌿 Git & GitHub Guide

### 1. Initialize Local Git Repository
```bash
git init
git status
git add .
git commit -m "feat: complete StyleHub full-stack fashion e-commerce website"
```

### 2. Push to GitHub
1. Create a new empty repository on [GitHub](https://github.com/new) named `stylehub-store`.
2. Connect and push your code:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stylehub-store.git
git push -u origin main
```

### 3. Everyday Git Workflow
```bash
# Check status
git status

# Stage changes
git add .

# Commit with a clear message
git commit -m "feat: add customer review rating component"

# Push to GitHub
git push
```
