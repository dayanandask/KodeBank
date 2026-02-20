# 🦅 KODBANK ELITE | Secure Financial Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![Stack: MERN](https://img.shields.io/badge/Stack-MERN-black.svg)](https://www.mongodb.com/mern-stack)
[![Style: Obsidian-Gold](https://img.shields.io/badge/Design-Obsidian%20%26%20Gold-orange.svg)]()

> "Unlock Your Financial Freedom. Join the Elite Circle."

Kodbank is a premium, high-security banking simulation platform designed with a high-end "Obsidian & Gold" aesthetic. It integrates production-grade database security via Aiven MySQL with an "Elite Circle" user experience.

---

## 🧭 Navigation

*   [🚀 Quick Start](#-quick-start)
*   [💎 Key Features](#-key-features)
*   [🛡️ Security Architecture](#️-security-architecture)
*   [🛠️ Technical Stack](#️-technical-stack)
*   [📁 Project Structure](#-project-structure)
*   [⚙️ Configuration](#️-configuration)
*   [🧱 Database Schema](#-database-schema)
*   [📜 License](#-license)

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Aiven MySQL Instance
- Git

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/dayanandask/KodeBank.git
cd KodeBank

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 3. Database Initialization
1.  Configure your credentials in `server/.env` (see [Configuration](#️-configuration)).
2.  Run the automated setup script:
    ```bash
    cd server
    npm run setup
    ```

### 4. Running the Application
**Terminal 1 (Backend):**
```bash
cd server
npm start
```
**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

---

## 💎 Key Features

- **Estate Agent Identity**: Custom branding featuring the "Estate Shield" logo integration.
- **Obsidian Luxe UI**: A glassmorphic design system using deep blacks and liquid gold gradients.
- **The Vault**: Instant verification of balances with high-performance background animations.
- **Social Gateway**: Simulated OAuth 2.0 flows for Google, Apple, and Microsoft.
- **Confetti celebration**: Dynamic visual feedback upon successful financial verification.

---

## 🛡️ Security Architecture

Kodbank implements industry-standard security protocols:

- **SSL/TLS Shield**: Mandatory cryptographically secure connection to Aiven MySQL using custom CA certificates.
- **JWT Authentication**: Stateless session management via JSON Web Tokens stored in `httpOnly` secure cookies.
- **Automatic Audit Logging**: Real-time tracking of security events (Login successes, password failures, registrations).
- **Environment Isolation**: Sensitive credentials managed via strictly ignored `.env` patterns.

---

## 🛠️ Technical Stack

- **Frontend**: React 18, Vite, Framer Motion, Lucide Icons, Tailwind CSS.
- **Backend**: Node.js, Express.
- **Database**: Aiven MySQL (Production Tier).
- **Security**: Bcrypt.js, JSONWebToken, SSL/TLS.

---

## 📁 Project Structure

```text
KodeBank/
├── client/                # React Frontend (Vite)
│   ├── public/           # Static assets (Custom Favicon)
│   ├── src/
│   │   ├── pages/        # Dashboard, Login, Register
│   │   └── components/   # UI building blocks
│   └── index.html        # Entry point with SEO meta
├── server/                # Node.js Backend
│   ├── src/
│   │   └── config/       # DB Pool & SSL Configuration
│   ├── index.js          # Express API & Security Middleware
│   ├── init-db.js        # Automated DB Setup Script
│   └── ca.pem            # Aiven SSL Certificate
└── database/              # SQL Schemas & Documentation
```

---

## ⚙️ Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000
DB_HOST=your-aiven-host
DB_USER=avnadmin
DB_PASSWORD=your-secure-password
DB_NAME=defaultdb
DB_PORT=12913
JWT_SECRET=your-highly-secret-key
```

---

## 🧱 Database Schema

The system automatically initializes two primary tables:

1.  **KodUser**: Stores profile data, hashed credentials, and vault balance.
2.  **UserToken**: Manages active sessions and expiries for secure access.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Created with ❤️ for the elite financial circle.*
