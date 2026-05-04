

## 🛠️ Project Design Document: Sync Board
**Real-Time Collaborative Note-Board (Quill + React Flow + Yjs)**

### 1. Project Vision
Sync Board is a real-time collaborative workspace where multiple users can brainstorm, diagram, and take notes simultaneously[cite: 1]. It combines the spatial freedom of a diagramming tool with the depth of a rich-text editor, all kept in sync across clients without merge conflicts[cite: 1].

### 2. Core Tech Stack[cite: 1]
*   **Frontend:** React, TypeScript, Tailwind CSS[cite: 1].
*   **Rich Text Editor:** Quill (for the content inside notes)[cite: 1].
*   **Diagramming Engine:** React Flow (for the canvas, nodes, and edges)[cite: 1].
*   **Real-Time Sync:** Yjs (Shared data types) + `y-websocket` (Communication layer)[cite: 1].
*   **Backend:** Node.js, Express, WebSocket server[cite: 1].
*   **Database:** MongoDB or PostgreSQL (for metadata and user persistence)[cite: 1].

---

### 3. Proposed Folder Structure[cite: 1]
```text
project-root/
├── client/                # React Application
│   ├── src/
│   │   ├── components/    # NoteNode.tsx, QuillEditor.tsx, BoardCanvas.tsx
│   │   ├── hooks/         # useYjsDoc.ts, useYjsQuill.ts
│   │   ├── pages/         # BoardView.tsx, BoardList.tsx
│   │   └── utils/         # yjsProvider.ts
├── server/                # Node.js Backend
│   ├── src/
│   │   ├── models/        # User, Board schemas
│   │   ├── routes/        # Auth and Board API routes
│   │   └── yjsWebSocket.ts # y-websocket server setup
└── README.md              # This document
```

---

### 4. Implementation Roadmap[cite: 1]

#### **Phase 1: The Foundation**
1.  **Data Modeling:** Define the `Y.Doc` schema, specifically `Y.Map` for nodes/edges and `Y.XmlText` for Quill content[cite: 1].
2.  **Basic CRUD:** Set up the Express backend to handle user authentication and board metadata (names, owners)[cite: 1].

#### **Phase 2: The Real-Time Layer**
1.  **WebSocket Setup:** Deploy a `y-websocket` server instance where each board acts as a unique "room"[cite: 1].
2.  **Frontend Connection:** Implement a `WebsocketProvider` in the React frontend that connects to the `ydoc`[cite: 1].

#### **Phase 3: The Canvas & Editor**
1.  **React Flow Integration:** Bind React Flow's `onNodesChange` and `onEdgesChange` to update the Yjs shared maps[cite: 1].
2.  **Quill Integration:** Nest a Quill editor inside each React Flow node. Use `y-quill` to bind the editor to the corresponding `Y.XmlText` field[cite: 1].

#### **Phase 4: UX & Polish**
1.  **Collaborative Awareness:** Implement live cursors using Yjs awareness protocols[cite: 1].
2.  **Deployment:** Host the frontend on Vercel/Netlify and the WebSocket backend on a service like Railway[cite: 1].

---

## 🚀 How to Achieve This Goal in Antigravity

To get the most out of your Antigravity environment and me (Gemini/Claude), follow this process:

### Step 1: "Introduce" Me to the Environment
Run the following in your Antigravity terminal:
```bash
gemini
# or if using the specific tool
/ide enable
```
This allows me to see your current folder structure as we build it.

### Step 2: Architecture Initialization
Paste the **Proposed Folder Structure** above into your chat and ask:
> *"Based on this README, please generate the boilerplate for the `client/src/hooks/useYjsDoc.ts` and the main `BoardCanvas.tsx` to handle the basic React Flow + Yjs handshake."*

### Step 3: Incremental Coding
Work in the order of the **Roadmap**[cite: 1]. Start with the Yjs/WebSocket connection logic before moving to the UI. This ensures the "engine" works before you build the "dashboard."

### Step 4: Verification
After generating files, ask:
> *"Check my `NoteNode.tsx`—is the Quill editor correctly bound to the Yjs `texts` map according to the schema in the README?"*[cite: 1]

---

### Key Summary for Claude[cite: 1]
**Goal:** Build "SyncBoard," a Figma-style canvas where nodes contain Quill editors, all synced via Yjs and WebSockets.
**Requirement:** Use React Flow for the canvas and Yjs for conflict-free state management[cite: 1]. Avoid manual merge logic.
