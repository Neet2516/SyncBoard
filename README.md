# 🎨 SyncBoard

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**SyncBoard** is a high-performance, real-time collaborative workspace that bridges the gap between spatial diagramming and deep rich-text editing. Whether you're brainstorming architecture, mapping out user journeys, or taking structured notes, SyncBoard keeps your entire team in perfect sync.
**Live URL** -https://sync-board-client-lake.vercel.app/
---

## 🌟 Why SyncBoard?

Traditional note-taking apps are too linear. Traditional diagramming tools are too static. **SyncBoard** gives you an infinite canvas where every node is a powerful editor. 
- **No Save Buttons**: Everything is saved and synced as you type.
- **No Conflicts**: Built on CRDT technology (Yjs), so multiple users can edit the same character at the same time without issues.
- **Total Freedom**: Drag, drop, link, and format.

---

## ✨ Feature Deep-Dive

### 🤝 Real-Time Collaboration
- **Zero-Latency Sync**: Powered by [Yjs](https://yjs.dev/), updates are propagated in milliseconds.
- **Collaborative Awareness**: See exactly where your teammates are with live multi-colored cursors and name tags.
- **Room Persistence**: Boards are persisted via LevelDB on the server, so your work is waiting for you when you return.

### 🎨 The Infinite Canvas
- **React Flow (XYFlow)**: A buttery-smooth canvas engine supporting zooming, panning, and complex node relationships.
- **Smart Formatting**: Each node is a full [Quill](https://quilljs.com/) editor instance. Support for bold, italics, code blocks, lists, and more.
- **Theme-able Nodes**: Color-code your ideas for better organization.

### 🛡️ Enterprise-Ready Backend
- **Secure Auth**: JWT-based authentication delivered via `HttpOnly` cookies to prevent XSS attacks.
- **Robust Rate Limiting**: Protection against brute-force and DDoS attempts at the API level.
- **Scalable Infrastructure**: Ready for Redis caching and Cloudinary image hosting.

---

## 🚀 Tech Stack

| Frontend | Backend | DevOps/DB |
| :--- | :--- | :--- |
| React 18 & TypeScript | Node.js & Express | Docker & Docker Compose |
| Tailwind CSS | WebSockets (ws) | MongoDB (Mongoose) |
| XYFlow (React Flow) | Yjs & y-websocket | LevelDB (y-leveldb) |
| Quill Editor | Zod Validation | Redis (ioredis) |
| Framer Motion | Cloudinary SDK | Nginx (Reverse Proxy) |

---

## 🛠️ Installation & Setup

### Local Development

1. **Clone & Install**
   ```bash
   git clone https://github.com/your-username/SyncBoard.git
   cd SyncBoard
   npm install
   ```

2. **Environment Configuration**
   - **Server (`server/.env`)**:
     ```env
     PORT=4000
     MONGO_URI=mongodb://localhost:27017/syncboard
     REDIS_URL=redis://localhost:6379
     ALLOWED_ORIGINS=http://localhost:5173
     CLOUDINARY_CLOUD_NAME=...
     ```
   - **Client (`client/.env`)**:
     ```env
     VITE_API_URL=http://localhost:4000
     VITE_WS_URL=ws://localhost:4000
     ```

3. **Launch**
   ```bash
   npm run dev --workspaces
   ```

---

## 🐳 Dockerization (Recommended)

SyncBoard is fully containerized for a one-command setup. This handles the Frontend, Backend, Database, and Cache automatically.

### Commands
- **Start everything**: `docker compose up -d`
- **Stop everything**: `docker compose down`
- **View logs**: `docker compose logs -f`
- **Hard Reset**: `docker compose down -v` (removes all database data)

### ⚠️ Common Docker Troubleshooting
If you see: `failed to connect to the docker API... daemon is not running`:
1. **Windows/Mac**: Ensure **Docker Desktop** is open and the "whale" icon in the tray is steady (not animating).
2. **Linux**: Ensure the docker service is running (`sudo systemctl start docker`).
3. **Permissions**: You may need to run commands with `sudo` if your user isn't in the `docker` group.

---

## 📂 Detailed Project Structure

```text
SyncBoard/
├── client/                     # 🌐 Frontend React Application
│   ├── public/                 # Static assets (Favicons, manifest)
│   ├── src/
│   │   ├── assets/             # Global styles, fonts, and images
│   │   ├── components/         # Atomic UI Components
│   │   │   ├── AuthGuard.tsx   # Higher-order component for route security
│   │   │   ├── BoardCanvas.tsx # Core React Flow canvas logic
│   │   │   ├── NoteNode.tsx    # The "Magic" node containing the Quill editor
│   │   │   └── ...             # Toolbar, Toast, Loader, Cursors
│   │   ├── context/            # Global State Management (Auth, Canvas, UI)
│   │   ├── hooks/              # Custom React Hooks (useYjsDoc, useYjsQuill)
│   │   ├── pages/              # Full-page View Components
│   │   ├── services/           # API communication layer (Fetch/Axios)
│   │   ├── types/              # TS Definitions & Yjs Shared Schemas
│   │   └── utils/              # Client-side helpers & validators
│   └── nginx.conf              # Production Nginx configuration
│
├── server/                     # ⚙️ Backend Node.js API & WS Server
│   ├── src/
│   │   ├── config/             # Env vars, passport/auth configuration
│   │   ├── controllers/        # Request handlers (logic for /auth, /boards)
│   │   ├── middleware/         # Security, logging, and auth checks
│   │   ├── models/             # Database Schemas (User.ts, Board.ts)
│   │   ├── routes/             # REST API endpoint definitions
│   │   ├── services/           # Core Business Logic & Infrastructure
│   │   ├── tests/              # Comprehensive Vitest integration tests
│   │   ├── validations/        # Zod schemas for request body validation
│   │   ├── index.ts            # Main HTTP & Express entry point
│   │   └── yjsWebSocket.ts     # Collaborative logic & LevelDB setup
│   └── yjs-leveldb/            # (Auto-generated) Binary storage for boards
│
├── docker-compose.yml          # 🐳 Service orchestration
└── package.json                # 📦 Root workspace configuration
```

---

## 🤝 Contributing

We love contributions! Whether it's a bug fix, a new feature, or better documentation:
1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**SyncBoard** - *Built for the speed of thought.* 🚀
