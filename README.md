# iMessenger

A full-stack real-time messaging application built with **React**, **Express.js**, **MongoDB**, and **Socket.IO**. Supports one-on-one and group chats, real-time messaging, user presence tracking, and message read receipts.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
  - [Seeding Data](#seeding-data)
- [Architecture](#architecture)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API Reference](#api-reference)
  - [Auth](#auth-endpoints)
  - [Users](#user-endpoints)
  - [Chats](#chat-endpoints)
  - [Messages](#message-endpoints)
- [Database Models](#database-models)
- [Socket.IO Events](#socketio-events)
- [State Management](#state-management)
- [Frontend Routing](#frontend-routing)
- [Components](#components)

---

## Tech Stack

### Backend

| Technology | Version | Purpose                 |
| ---------- | ------- | ----------------------- |
| Node.js    | 20+     | Runtime                 |
| Express.js | 5.x     | HTTP framework          |
| TypeScript | 6.x     | Type safety             |
| MongoDB    | —       | Database                |
| Mongoose   | 9.x     | ODM                     |
| Socket.IO  | 4.x     | Real-time communication |
| JWT        | —       | Authentication          |
| bcryptjs   | 3.x     | Password hashing        |
| Zod        | 4.x     | Input validation        |
| Helmet     | 8.x     | Security headers        |
| Morgan     | 1.x     | HTTP request logging    |

### Frontend

| Technology       | Version | Purpose                 |
| ---------------- | ------- | ----------------------- |
| React            | 19.x    | UI framework            |
| TypeScript       | 6.x     | Type safety             |
| Vite             | 8.x     | Build tool & dev server |
| Tailwind CSS     | 4.x     | Styling                 |
| React Router     | 7.x     | Client-side routing     |
| Zustand          | 5.x     | State management        |
| Axios            | 1.x     | HTTP client             |
| Socket.IO Client | 4.x     | Real-time communication |
| Lucide React     | 1.x     | Icons                   |
| Moment.js        | 2.x     | Date/time formatting    |
| React Toastify   | 11.x    | Toast notifications     |
| clsx             | 2.x     | Conditional class names |

---

## Project Structure

```
imessenger/
├── backend/                    # Express.js backend (development)
│   ├── src/
│   │   ├── server.ts           # Entry point
│   │   ├── config/
│   │   │   ├── cors.ts         # CORS configuration
│   │   │   ├── database.ts     # MongoDB connection with retry logic
│   │   │   └── env.ts          # Environment variable validation
│   │   ├── controllers/
│   │   │   ├── auth/           # Signin, Signup
│   │   │   ├── chat/           # CRUD for chats & group management
│   │   │   ├── message/        # Create, read, mark-as-read
│   │   │   └── user/           # Get users
│   │   ├── middlewares/
│   │   │   ├── auth.ts         # JWT authentication middleware
│   │   │   └── requestLogger.ts# Morgan HTTP logger
│   │   ├── models/
│   │   │   ├── Chat.ts         # Chat schema (1-on-1 & group)
│   │   │   ├── Message.ts      # Message schema with read receipts
│   │   │   └── User.ts         # User schema with password hashing
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── scripts/
│   │   │   └── seed-users.ts   # Database seeder with Faker.js
│   │   ├── services/
│   │   │   └── socket.ts       # Socket.IO server setup
│   │   └── utils/
│   │       └── logger.ts       # Console logger utility
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React frontend (development)
│   ├── src/
│   │   ├── main.tsx            # App entry point
│   │   ├── AppRoutes.tsx       # Route definitions
│   │   ├── index.css           # Global styles & Tailwind config
│   │   ├── assets/
│   │   │   └── fonts/          # DM Sans font files
│   │   ├── components/
│   │   │   ├── ChatList.tsx    # Chat list sidebar
│   │   │   ├── ChatWindow.tsx  # Message area & input
│   │   │   ├── StartChatModal.tsx # New chat modal
│   │   │   ├── ErrorBoundary.tsx  # Error boundary page
│   │   │   └── ui/
│   │   │       └── Dialog.tsx  # Reusable modal dialog
│   │   ├── contexts/
│   │   │   └── SocketContext.tsx # Socket.IO React context
│   │   ├── layouts/
│   │   │   ├── app.tsx         # Authenticated app layout
│   │   │   └── auth.tsx        # Auth pages layout
│   │   ├── lib/
│   │   │   ├── api.ts          # Axios instance with interceptors
│   │   │   └── utlils.ts       # Error handler utility
│   │   ├── routes/
│   │   │   ├── app/
│   │   │   │   └── App.tsx     # Main chat page
│   │   │   └── auth/
│   │   │       ├── Signin.tsx
│   │   │       └── Signup.tsx
│   │   ├── services/
│   │   │   └── socket.ts      # Socket.IO client factory
│   │   ├── store/
│   │   │   ├── auth.ts        # Auth store (Zustand)
│   │   │   └── chat.ts        # Chat store (Zustand)
│   │   └── types/
│   │       ├── index.ts       # User, Chat, Message types
│   │       └── socket.ts      # Socket event type definitions
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                    # Express.js backend (production-ready)
│   └── ...                    # Same structure as backend/
│
├── web/                       # React frontend (production-ready)
│   └── ...                    # Same structure as frontend/
│
└── README.md
```

---

## Features

- **Real-time messaging** — Instant message delivery via Socket.IO
- **One-on-one chats** — Direct messaging between two users
- **Group chats** — Create groups, add/remove members, rename groups (admin only)
- **User presence** — Real-time online/offline status with "last seen" timestamps
- **Read receipts** — Track which users have read each message
- **Unread counts** — Per-chat unread message badges
- **Optimistic updates** — Messages appear instantly before server confirmation
- **Persistent sessions** — Auth state and selected chat persist across page reloads
- **JWT authentication** — Secure token-based auth for API and Socket.IO
- **User search** — Find and start conversations with any registered user
- **Error handling** — Global error boundary, toast notifications, API error interceptors
- **Responsive UI** — Tailwind CSS with custom DM Sans typography

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Environment Variables

Create a `.env` file in the `backend/` (or `server/`) directory:

```env
NODE_ENV=development
PORT=4000

MONGODB_URI=mongodb://localhost:27017/imessenger

JWT_SECRET=your-secret-key

FRONTEND_URL=http://localhost:5173

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Installation

```bash
# Clone the repository
git clone https://github.com/shubzz2110/imessenger.git
cd imessenger

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the App

```bash
# Terminal 1 — Start the backend
cd backend
npm run dev

# Terminal 2 — Start the frontend
cd frontend
npm run dev
```

- **Backend** runs on `http://localhost:4000`
- **Frontend** runs on `http://localhost:5173`

### Seeding Data

Generate sample users with Faker.js:

```bash
cd backend
npm run seed:users
```

---

## Architecture

### Backend

```
Client Request
    │
    ▼
Express Server (port 4000)
    │
    ├── Helmet (security headers)
    ├── CORS (credentials, allowed origins)
    ├── JSON/URL-encoded body parser (10MB limit)
    ├── Cookie parser
    ├── Morgan request logger
    │
    ├── /api/auth/*         → Auth controllers (public)
    ├── /api/users/*        → User controllers (protected)
    ├── /api/chats/*        → Chat controllers (protected)
    ├── /api/messages/*     → Message controllers (protected)
    │
    └── Socket.IO
        ├── JWT auth on connection
        ├── User presence management
        ├── Chat room management
        └── Real-time message broadcasting
```

**Database connection** uses retry logic: max 5 attempts with 3-second delays, 5s server selection timeout, 45s socket timeout.

**Auth middleware** extracts JWT from the `Authorization: Bearer <token>` header, verifies the signature, and attaches `userId` to the request.

### Frontend

```
React App (Vite dev server, port 5173)
    │
    ├── RouterProvider (React Router v7)
    │   ├── /auth/* → AuthLayout
    │   │   ├── /auth/signin → Signin
    │   │   └── /auth/signup → Signup
    │   └── /app/* → AppLayout (protected)
    │       └── /app/ → App (ChatList + ChatWindow)
    │
    ├── SocketContext (Socket.IO connection management)
    │
    ├── Zustand Stores (persisted to localStorage)
    │   ├── auth-storage → user, accessToken
    │   └── chat-store  → selectedChat, selectedUser
    │
    └── Axios Instance
        ├── Base URL: http://localhost:4000/api
        ├── Request interceptor: attach Bearer token
        └── Response interceptor: redirect on 401
```

---

## API Reference

### Auth Endpoints

| Method | Endpoint           | Auth | Description          |
| ------ | ------------------ | ---- | -------------------- |
| POST   | `/api/auth/signup` | No   | Register a new user  |
| POST   | `/api/auth/signin` | No   | Sign in, receive JWT |

**POST `/api/auth/signup`**

```json
// Request
{ "name": "string", "email": "string", "password": "string" }

// Response (201)
{ "success": true, "message": "User registered successfully" }
```

**POST `/api/auth/signin`**

```json
// Request
{ "email": "string", "password": "string" }

// Response (200)
{
  "success": true,
  "message": "Signin successful",
  "user": { "_id", "name", "email", "avatarUrl", "isOnline", "lastSeen", "createdAt", "updatedAt" },
  "token": "JWT (expires in 7 days)"
}
```

### User Endpoints

| Method | Endpoint     | Auth | Description                       |
| ------ | ------------ | ---- | --------------------------------- |
| GET    | `/api/users` | Yes  | Get all users except current user |

### Chat Endpoints

| Method | Endpoint                  | Auth | Description                      |
| ------ | ------------------------- | ---- | -------------------------------- |
| GET    | `/api/chats`              | Yes  | Get all chats with unread counts |
| GET    | `/api/chats/:chatId`      | Yes  | Get specific chat                |
| POST   | `/api/chats/one-on-one`   | Yes  | Create one-on-one chat           |
| POST   | `/api/chats/group`        | Yes  | Create group chat                |
| PUT    | `/api/chats/group/add`    | Yes  | Add member to group              |
| PUT    | `/api/chats/group/remove` | Yes  | Remove member from group         |
| PUT    | `/api/chats/group/rename` | Yes  | Rename group chat                |

**POST `/api/chats/one-on-one`**

```json
// Request
{ "receiver": "userId" }

// Response — returns chat with populated users and latest message
```

**POST `/api/chats/group`**

```json
// Request
{ "chatName": "string", "users": ["userId", "userId", ...] }

// Minimum 2 other users required. Creator is auto-added as admin.
```

**PUT `/api/chats/group/add`** | **`/remove`** | **`/rename`**

```json
// Add/Remove
{ "chatId": "string", "userId": "string" }

// Rename
{ "chatId": "string", "chatName": "string" }

// Only the group admin can perform these actions.
```

### Message Endpoints

| Method | Endpoint                                    | Auth | Description                       |
| ------ | ------------------------------------------- | ---- | --------------------------------- |
| POST   | `/api/messages`                             | Yes  | Send a message                    |
| GET    | `/api/messages/:chatId`                     | Yes  | Get all messages in a chat        |
| PUT    | `/api/messages/read-by/:chatId`             | Yes  | Mark all messages in chat as read |
| PUT    | `/api/messages/read-by-receiver/:messageId` | Yes  | Mark single message as read       |

**POST `/api/messages`**

```json
// Request
{ "content": "string", "chatId": "string" }

// Creates message, updates chat's latestMessage, emits socket event to chat room.
```

---

## Database Models

### User

| Field       | Type    | Details                             |
| ----------- | ------- | ----------------------------------- |
| `name`      | String  | Required                            |
| `email`     | String  | Required, unique                    |
| `password`  | String  | Required, bcrypt hashed (10 rounds) |
| `avatarUrl` | String  | Optional                            |
| `isOnline`  | Boolean | Default: `false`                    |
| `lastSeen`  | Date    | Default: `Date.now`                 |
| `createdAt` | Date    | Auto-generated                      |
| `updatedAt` | Date    | Auto-generated                      |

Instance method: `comparePassword(candidatePassword)` — compares plain text against hash.

### Chat

| Field           | Type       | Details                    |
| --------------- | ---------- | -------------------------- |
| `chatName`      | String     | Optional (used for groups) |
| `isGroupChat`   | Boolean    | Default: `false`           |
| `users`         | ObjectId[] | Ref: `User`                |
| `latestMessage` | ObjectId   | Ref: `Message`             |
| `groupAdmin`    | ObjectId   | Ref: `User`                |
| `createdAt`     | Date       | Auto-generated             |
| `updatedAt`     | Date       | Auto-generated             |

### Message

| Field       | Type       | Details                            |
| ----------- | ---------- | ---------------------------------- |
| `chat`      | ObjectId   | Ref: `Chat`, indexed               |
| `sender`    | ObjectId   | Ref: `User`                        |
| `content`   | String     | Required                           |
| `readBy`    | ObjectId[] | Ref: `User` (tracks read receipts) |
| `createdAt` | Date       | Auto-generated                     |
| `updatedAt` | Date       | Auto-generated                     |

---

## Socket.IO Events

### Connection

- Client connects with JWT token via `auth: { token }` config
- Server verifies token, extracts `userId`, joins user to their own room
- User's `isOnline` is set to `true` in the database

### Server → Client Events

| Event                   | Payload                          | Description                          |
| ----------------------- | -------------------------------- | ------------------------------------ |
| `connected`             | —                                | Connection acknowledged              |
| `chat:new`              | `Chat`                           | New chat created involving this user |
| `update_latest_message` | `Message`                        | New message sent in a chat room      |
| `user_status_change`    | `{ userId, isOnline, lastSeen }` | User went online or offline          |

### Client → Server Events

| Event        | Payload  | Description       |
| ------------ | -------- | ----------------- |
| `join_chat`  | `chatId` | Join a chat room  |
| `leave_chat` | `chatId` | Leave a chat room |

### Disconnection

- User's `isOnline` set to `false`, `lastSeen` updated to current time
- `user_status_change` broadcast to all connected clients

---

## State Management

### Auth Store (`zustand`, persisted as `auth-storage`)

| State         | Type    | Description |
| ------------- | ------- | ----------- | -------------------------- |
| `user`        | `User   | null`       | Current authenticated user |
| `accessToken` | `string | null`       | JWT token                  |

| Method                           | Description                    |
| -------------------------------- | ------------------------------ |
| `setAuth(user, token)`           | Set user and token after login |
| `isAuthenticated()`              | Check if user is logged in     |
| `updateUserStatus(id, isOnline)` | Update a user's online status  |
| `clearAuth()`                    | Clear all auth state (logout)  |

### Chat Store (`zustand`, persisted as `chat-store`)

| State          | Type  | Description |
| -------------- | ----- | ----------- | ------------------------- |
| `selectedChat` | `Chat | null`       | Currently active chat     |
| `selectedUser` | `User | null`       | Other user in 1-on-1 chat |

| Method                             | Description                          |
| ---------------------------------- | ------------------------------------ |
| `setSelectedChat(chat)`            | Set active chat                      |
| `setSelectedUser(user)`            | Set chat partner                     |
| `closeChat()`                      | Clear selected chat and user         |
| `updateChatLatestMessage(id, msg)` | Update latest message in active chat |

---

## Frontend Routing

| Path           | Layout       | Component | Auth Required | Description                 |
| -------------- | ------------ | --------- | ------------- | --------------------------- |
| `/`            | —            | Redirect  | No            | Redirects to `/auth/signin` |
| `/auth/signin` | `AuthLayout` | `Signin`  | No            | Login page                  |
| `/auth/signup` | `AuthLayout` | `Signup`  | No            | Registration page           |
| `/app`         | `AppLayout`  | `App`     | Yes           | Main chat interface         |

- `AuthLayout` — Centered card with branding. Redirects to `/app` if already authenticated.
- `AppLayout` — Full-height layout with top navbar (branding, online indicator, user name, logout). Protected route (redirects to signin if unauthenticated). Wraps children in `SocketProvider`.

---

## Components

### `ChatList`

- Displays all user chats in a sidebar
- Shows chat name, latest message preview, timestamp, unread badge
- Search input for filtering chats
- "New chat" button opens `StartChatModal`
- Manages socket room joins/leaves on chat selection

### `ChatWindow`

- Message list with auto-scroll to bottom
- Real-time incoming message handling via socket
- Message input form with send button
- Optimistic updates (temp messages → confirmed/failed)
- User status display ("Online" / "Last seen X ago")
- "New Messages" divider for unread messages
- Auto-creates one-on-one chat on first message if needed
- Read receipt tracking (marks messages as read after 5s)
- Escape key closes the chat

### `StartChatModal`

- Fetches all users from the API
- Client-side search by name
- On user select: sets chat partner, joins room, closes modal

### `ErrorBoundary`

- Catches React Router errors
- Displays error status and message
- Retry (reload) and "Go Home" buttons
- Toggle for error stack trace details (dev mode)

### `Dialog`

- Reusable modal with backdrop blur
- Title, optional description, close button
- Scrollable content area

---

## Scripts

### Backend

```bash
npm run dev          # Start dev server with nodemon + ts-node
npm run dev:alt      # Start dev server with ts-node-dev
npm run build        # Compile TypeScript to JavaScript
npm run start        # Run compiled JavaScript
npm run seed:users   # Seed database with fake users
npm run lint         # Type-check without emitting
npm run clean        # Remove dist/ directory
```

### Frontend

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + Vite production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

---

## License

This project is for personal/educational use.
