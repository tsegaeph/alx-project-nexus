# 🚀 Nexus — E-Commerce Platform (Django + React)

Nexus is a full-stack e-commerce platform built with **Django REST Framework**, **React.js**, **JWT authentication**, and **PostgreSQL**, fully deployed on **Railway**.

It supports **role-based access** (Seller & Customer), allows product management with images, and follows industry-standard REST API practices.

📌 Table of Contents
* [Overview](#overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [System Architecture](#system-architecture)
* [Data Models](#data-models)
* [API Documentation](#api-documentation)
* [Authentication](#authentication)
* [Installation](#installation)
* [Environment Variables](#environment-variables)
* [Deployment](#deployment)
* [Best Practices Followed](#best-practices-followed)
* [Future Enhancements](#future-enhancements)
* [Author](#author)
* [Code & Commands](#code--commands)

---

## Overview
Nexus is an ALX backend engineering project demonstrating a real e-commerce backend with:

* **Secure Authentication**
* **Product CRUD** with images
* **Seller workflows**
* **RESTful API**
* **Clean architecture**
* **Cloud storage** for media
* **Full deployment** (frontend + backend + DB)

---

## Features

### ✔ Core Features
* User Registration (Seller / Customer)
* Login using **JWT**
* Category Management
* **Product CRUD** with:
    * Main image
    * Multiple gallery images
    * Weight & dimensions
    * Seller phone
    * Shipping fee, tax
* Product listing & detail view

### ✔ Bonus Features
* Role-based routing
* Validation on backend
* **DRF permissions**
* Error handling
* Full deployment
* Cloud-based media hosting

---

## Tech Stack
### Backend
* **Django**
* **Django REST Framework**
* **SimpleJWT**
* **PostgreSQL**
* **Cloudinary** / Cloud Storage
* **Railway** Deployment

### Frontend
* **React.js**
* **Axios**
* **Railway** Deployment

---

## System Architecture


`React Frontend → Django REST API → PostgreSQL (Railway)`
`                           ↓`
`                  Cloud Storage (Images)`

---

## Data Models
| Model | Description | Key Fields |
| :--- | :--- | :--- |
| **User** | Standard user model with role-based access. | username, email, password, **role**, full\_name. |
| **Category** | Used to group products. | Owned by seller, name, description. |
| **Product** | Core e-commerce item. | Belongs to a seller and category, detailed metadata (price, weight, etc.). |
| **ProductImage** | Stores additional images for a product. | Stores gallery images linked to product. |

---

## API Documentation
Base URL:
`https://alx-project-nexus-production-3d80.up.railway.app/api/`

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/register/` | `POST` | All | Handles new user registration (Seller or Customer). |
| `/token/` | `POST` | All | Authenticates user and returns JWT access and refresh tokens. |
| `/products/` | `POST` | **Seller** | Allows a seller to add a new product (requires `multipart/form-data`). |
| `/products/` | `GET` | All | Retrieves a list of all products. |
| `/products/<id>/` | `GET` | All | Retrieves the details for a specific product. |

---

## Authentication
Nexus uses **JWT Authentication**:

* **Access token**
* **Refresh token**
* Protected **seller-only endpoints**

Token sent via:
`Authorization: Bearer <token>`

---

## Installation
1.  Clone repository
2.  Create virtual environment
3.  Install dependencies
4.  Run migrations
5.  Start development server

---

## Environment Variables
You must create a **`.env`** file in the backend root directory for:

* `SECRET_KEY`
* `DATABASE_URL` (PostgreSQL)
* `CLOUDINARY_URL` (For image storage)
* `DEBUG`
* `ALLOWED_HOSTS`

---

## Deployment
### Backend: Railway
* **PostgreSQL** attached
* **ENV vars** configured
* `DEBUG=False`
* Static & media handled
* Cloud-based media storage

### Frontend: Railway
* **React build** deployed
* **CORS** allowed
* Connected to backend API

---

## Best Practices Followed
* **RESTful API structure**
* Clean code & clear serializers
* Django ORM with indexes
* Full validation & error responses
* **Secure authentication with JWT**
* Environment-based configuration
* **Cloud storage** instead of local media
* Separation of concerns
* **Role-based access logic**

---

## Future Enhancements
* Cart & Checkout
* Order management
* Review system
* Product search filters
* Seller dashboard analytics

---

## Author
**Tsega Ephrem Tilahun**

Software Engineering Student – Addis Ababa University

Skills: **Django**, **DRF**, **React**, **PostgreSQL**, Node.js, Flutter

---

## Code & Commands

```bash
# =====================================
# Clone Backend
# =====================================
git clone <repository-link>
cd backend

# =====================================
# Create Virtual Environment
# =====================================
python -m venv env
source env/bin/activate   # Mac/Linux
env\Scripts\activate      # Windows

# =====================================
# Install Dependencies
# =====================================
pip install -r requirements.txt

# =====================================
# Apply Migrations
# =====================================
python manage.py makemigrations
python manage.py migrate

# =====================================
# Run Local Server
# =====================================
python manage.py runserver