# 🏠 NestFinder — Student Housing Platform

> Find verified PGs, hostels, and flats near your college. No brokerage. No hassle.

!\[NestFinder Banner](https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200\&q=80)

\---

## 📌 About the Project

**NestFinder** is a full-stack student accommodation platform that helps students find verified rooms, PGs, hostels, and flats near their colleges across India. Built with a modern tech stack, it features real-time property listings, smart filters, secure authentication, and image uploads.

\---

## ✨ Features

* 🔍 **Smart Search \& Filters** — Filter by city, budget, room type, and sort by price or rating
* 🏠 **Property Listings** — Browse verified student accommodations across India
* 📋 **Property Details** — View full details, amenities, owner contact
* ➕ **Add Property** — List your property with image upload
* ❤️ **Saved Properties** — Save and manage your favourite listings
* 🔐 **Authentication** — Secure Sign In / Sign Up with JWT tokens
* 📧 **Forgot Password** — Real email reset link with 15-minute expiry
* 📱 **Responsive Design** — Works on mobile, tablet, and desktop

\---

## 🛠️ Tech Stack

### Frontend

|Technology|Usage|
|-|-|
|HTML5|Structure|
|CSS3|Styling \& Animations|
|JavaScript (ES6+)|Logic \& API calls|

### Backend

|Technology|Usage|
|-|-|
|Node.js|Runtime environment|
|Express.js|Web framework|
|MongoDB|Database|
|Mongoose|ODM for MongoDB|
|JWT|Authentication|
|Bcryptjs|Password hashing|
|Nodemailer|Email service|

\---

## 📁 Project Structure

```
nestfinder/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   ├── Property.js      # Property schema
│   │   └── User.js          # User schema
│   ├── routes/
│   │   ├── authRoutes.js    # Auth routes (register, signin, reset)
│   │   └── propertyRoutes.js # Property CRUD routes
│   └── server.js            # Express server entry point
│
├── index.html               # Home page
├── listings.html            # All properties page
├── property-details.html    # Single property page
├── add-property.html        # Add new property page
├── search-results.html      # Search results page
├── saved.html               # Saved properties page
├── reset-password.html      # Password reset page
├── app.js                   # Frontend JavaScript
├── styles.css               # Global styles
├── package.json
├── .env.example
└── .gitignore
```

\---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (local or Atlas)
* [Git](https://git-scm.com/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR\_USERNAME/nestfinder.git
cd nestfinder
```

**2. Install dependencies**

```bash
npm install
```

**3. Create `.env` file** in the root folder:

```env
MONGO\_URI=mongodb://localhost:27017/studentRentalDB
PORT=5000
JWT\_SECRET=your\_jwt\_secret\_key
EMAIL\_USER=your\_gmail@gmail.com
EMAIL\_PASS=your\_gmail\_app\_password
APP\_URL=http://localhost:5000
```

**4. Start MongoDB** (if running locally)

```bash
mongod
```

**5. Start the server**

```bash
npm start
```

**6. Open in browser**

```
http://localhost:5000
```

\---

## 🌱 Seed Sample Data

To add sample properties to your database:

```bash
node seed.js
```

This will add 8 sample properties across Delhi, Mumbai, Bangalore, Pune, Hyderabad, Kolkata, and Chennai.

\---

## 📸 Screenshots

### Home Page

> Featured properties with city-based quick search

### Listings Page

> All properties with filters for city, budget, and room type

### Property Details

> Full property info with amenities and owner contact

### Add Property

> Form to list a new property with image upload

\---

## 🔐 Environment Variables

|Variable|Description|
|-|-|
|`MONGO\_URI`|MongoDB connection string|
|`PORT`|Server port (default: 5000)|
|`JWT\_SECRET`|Secret key for JWT tokens|
|`EMAIL\_USER`|Gmail address for sending emails|
|`EMAIL\_PASS`|Gmail app password|
|`APP\_URL`|Base URL of your app|

\---

## 📡 API Endpoints

### Auth Routes

|Method|Endpoint|Description|
|-|-|-|
|POST|`/api/auth/register`|Register new user|
|POST|`/api/auth/signin`|Sign in user|
|POST|`/api/auth/forgot-password`|Send reset email|
|POST|`/api/auth/reset-password`|Reset password|

### Property Routes

|Method|Endpoint|Description|
|-|-|-|
|GET|`/api/properties`|Get all properties|
|GET|`/api/properties/:id`|Get single property|
|POST|`/api/properties`|Add new property (Auth required)|

\---

## 👨‍💻 Author

**Chaithan Gowda S**

* GitHub: chaithan5-glitch
* Email: chaithanshivakumar5@gmail.com

\---

## 📄 License

This project is licensed under the **ISC License**.

\---

## 🙏 Acknowledgements

* [Unsplash](https://unsplash.com/) — Property images
* [MongoDB Atlas](https://www.mongodb.com/atlas) — Cloud database
* [Render](https://render.com/) — Deployment platform

\---

<div align="center">
  Made with ❤️ for students across India 🇮🇳
</div>

