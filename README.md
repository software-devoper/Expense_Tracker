# AI-Powered Expense Tracker

A professional, production-ready AI application that automates receipt scanning and expense management using Google Gemini and Brevo.

## 🚀 Features

- **AI Receipt Scanner:** Powered by **Google Gemini 2.5 Flash** for instant data extraction (Vendor, Amount, Date, Category) from images and PDFs.
- **Enterprise Email Engine:** Transactional emails via **Brevo API** for account verification and unpaid bill reminders.
- **Dynamic Analytics:** Real-time spending charts and trend analysis using **Recharts**.
- **Production Scaling:** MongoDB Atlas cloud database and client-side **Excel/CSV exports** for high-volume performance.
- **Premium UI:** Fully responsive design with **Framer Motion** animations, Glassmorphism, and Dark Mode support.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Framer Motion, Recharts, Lucide Icons, xlsx.
- **Backend:** Node.js, Express, MongoDB Atlas, Mongoose, Multer.
- **AI/LLM:** Google Generative AI (Gemini).
- **Communication:** Brevo API (Transactional SMTP).

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Gemini API Key
- Brevo API Key

### Backend Setup
1. Navigate to `backend/`
2. Run `npm install`
3. Create a `.env` file based on the provided template and add your keys.
4. Run `npm run dev`

### Frontend Setup
1. Navigate to `frontend/`
2. Run `npm install`
3. Run `npm run dev`

## 📄 License
MIT
