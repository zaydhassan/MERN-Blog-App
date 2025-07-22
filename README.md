# 🌐 MERN Blog App

![Banner](./1.png)

> ✍️ A dynamic full-stack blog platform built with the MERN stack, empowering passionate readers and writers to engage, explore, and express.

---

## 🚀 Features

- 📝 Create, read, edit, and delete blogs
- 🔐 Secure authentication with RBAC (Role-Based Access Control)
- 💬 Commenting, liking, and sharing functionality
- 🧠 Category & tag-based blog filtering
- 📨 Newsletter subscription system
- 🏆 Writer levels, rewards, and leaderboard system
- 📱 Responsive design using Tailwind CSS

---

## 🛠️ Tech Stack

**Frontend:**  
![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black)
![Redux](https://img.shields.io/badge/-Redux-764ABC?logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/-TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white)

**Backend:**  
![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/-Express.js-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white)

**Other Tools:**  
![Render](https://img.shields.io/badge/-Render-46E3B7?logo=render&logoColor=black)
![Redis](https://img.shields.io/badge/-Redis-DC382D?logo=redis&logoColor=white)
![GitHub](https://img.shields.io/badge/-GitHub-181717?logo=github&logoColor=white)

---

## 📸 UI Screenshots

### 🏠 Home Page
![Home Page](./1.png)

### 📰 Blog Detail Page
![Blog Page](./2.png)

### 🧩 Featured Blogs + Tags + Trending
![Blog Cards](./3.png)

### 👤 User Dashboard (Level + Leaderboard)
![Dashboard](./4.png)

### 📝 Create Blog Editor
![Create Blog](./5.png)

---

#### 🔐 `.env` Setup (inside `/server`)

Create a `.env` file with the following keys:

#```env
DEV_MODE=development
PORT=8080
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password

###### ⚙️ Getting Started

# Clone the repository
git clone 

# Install client dependencies
cd client

npm install

# Install server dependencies
cd server

npm install

# Run the development servers
# Start backend

npm run server

# In a separate terminal
cd client

npm start
