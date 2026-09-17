# 🔐 Next.js Secure Auth Architecture

A robust, production-ready authentication and user management system built with the Next.js App Router. This project was developed to implement a highly secure, dual-token authentication pattern and demonstrates modern Next.js server-side caching and data mutation strategies.

## ✨ Core Features

- **Dual-Token JWT Strategy:**
  - Long-lived Refresh Tokens securely stored in `HttpOnly` edge-readable cookies.
  - Short-lived Access Tokens held purely in React Context (memory) via Axios interceptors.
- **Role-Based Access Control (RBAC):**
  - Network-level route protection using Next.js Edge Proxy/Middleware.
  - Distinct, role-aware dashboard shells for `admin` and `user` access levels.
- **Modern Next.js Architecture:**
  - Utilizes Next.js Server Actions for seamless database mutations.
  - Implements advanced caching directives (`"use cache"`, `cacheTag`, `revalidateTag`) for optimized database read performance.
- **Interactive Admin Dashboard:**
  - **Pending Queue:** Optimistic UI updates for rapidly approving or rejecting new registrations.
  - **User Directory:** Server-side paginated data table.
  - **Smart Search:** Debounced email search and multi-parameter filtering (Role, Status).
  - **Management Modal:** Clickable table rows that launch a unified modal for modifying user roles and access statuses.

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** MongoDB & Mongoose (Optimized with `.lean()`)
- **Styling:** Tailwind CSS
- **Network & State:** Axios, React Context API, Custom Hooks (`useDebounce`)

### Environment Variables Setup

Create a `.env.local` file in the root directory of the project. You can use the following template to configure your local environment:

```env
# -----------------------------------------------------------------------------
# DATABASE CONFIGURATION
# -----------------------------------------------------------------------------
# Your MongoDB Atlas connection string (ensure your IP is whitelisted)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/myDatabase?retryWrites=true&w=majority

# -----------------------------------------------------------------------------
# AUTHENTICATION SECRETS
# -----------------------------------------------------------------------------
# Generate secure random strings for these (e.g., using `openssl rand -base64 32`)
JWT_ACCESS_SECRET=your_super_secret_access_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# -----------------------------------------------------------------------------
# APPLICATION SETTINGS (Optional)
# -----------------------------------------------------------------------------
# The base URL of your application (useful for Axios configurations)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Token Expiration times (matching your backend logic)
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```
