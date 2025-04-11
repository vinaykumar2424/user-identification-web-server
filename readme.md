# Bitespeed Identity Reconciliation Service

A robust backend service for identifying and linking customer contacts across multiple orders using email and phone number information, following Bitespeed's requirements for identity reconciliation.

## Features

- 🎯 Identity reconciliation across multiple contact points
- 🔗 Primary/Secondary contact linking system
- 📦 Consolidated contact response formatting
- 🗃️ MySQL database integration with Sequelize ORM
- 🚀 REST API endpoint for contact identification
- 📈 Database migration system with Umzug
- 🩺 Health check endpoint
- 🔒 Transaction-safe database operations

## Tech Stack

**Backend:**

- Node.js
- TypeScript
- Express.js
- Sequelize ORM
- MySQL

**Tools:**

- Umzug (Migrations)
- Postman (API Testing)
- ts-node (TypeScript execution)

## Prerequisites

- Node.js v20.18.2+
- MySQL 8.0+
- npm 9.0+

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/bitespeed-backend-task.git
cd bitespeed-backend-task
npm install


2. **Set up environment variables**
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bitespeed
DB_USER=root
DB_PASSWORD=
PORT=3000


npm run migrate:up
```
