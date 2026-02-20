---
description: How to deploy Kodbank to Render and Vercel
---

# 🚀 Deployment Guide for Kodbank Elite

This guide explains how to deploy the Kodbank application to production using **Render** (for the backend) and **Vercel** (for the frontend).

## 1. 🏗️ Database Setup (Aiven MySQL)
Your database is already live on Aiven. Ensure you have the following credentials from your `.env`:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`

## 2. 🛡️ Backend Deployment (Render)
1. Log in to [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository: `https://github.com/dayanandask/KodeBank`.
4. Configure the service:
   - **Name**: `kodbank-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** and add **Environment Variables**:
   - `DB_HOST`: (your Aiven host)
   - `DB_USER`: `avnadmin`
   - `DB_PASSWORD`: (your Aiven password)
   - `DB_NAME`: `defaultdb`
   - `DB_PORT`: `12913`
   - `JWT_SECRET`: (a strong random string)
   - `CLIENT_URL`: `https://your-frontend-name.vercel.app` (Add this later once you have the Vercel URL)
6. Click **Create Web Service**.

## 3. 🌐 Frontend Deployment (Vercel)
1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository: `https://github.com/dayanandask/KodeBank`.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
5. Add **Environment Variables**:
   - `VITE_API_URL`: `https://kodbank-backend.onrender.com` (Use your actual Render URL)
6. Click **Deploy**.

## 4. 🔄 Final Synchronization
Once Vercel gives you a frontend URL (e.g., `https://kodbank-react.vercel.app`):
1. Go back to your **Render Dashboard**.
2. Go to **Settings** -> **Environment Variables**.
3. Update `CLIENT_URL` with your Vercel URL.
4. Render will automatically re-deploy.

**Your Elite Banking Vault is now live for the world!** 🦅🛡️💰
