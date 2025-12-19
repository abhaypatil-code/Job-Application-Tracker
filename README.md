# <div align="center">

![JobSuite Banner](public/readme-banner.png)

# JobSuite


[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-39-47848F?logo=electron)](https://www.electronjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://www.sqlite.org/)

A modern, feature-rich job application tracker built as an **Electron desktop app** with React, TypeScript, and SQLite. Keep track of your job applications, interview stages, and learnings—all in one place with a beautiful dark-themed UI and reliable local database storage.

---

## ✨ Features

- **📊 Dashboard** — Overview of your application progress with visual statistics
- **📋 Kanban Board** — Drag-and-drop interface to manage application statuses
- **🎯 Interview Tracking** — Track interview rounds with stage progress indicators
- **📚 Learnings Tab** — Document key learnings from each application
- **🌙 Modern Dark UI** — Sleek glassmorphism design with smooth animations
- **💾 SQLite Storage** — Reliable, persistent local database storage
- **📎 File Attachments** — Attach resumes, cover letters, and notes to applications

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Desktop** | Electron 39 |
| **Database** | SQLite (better-sqlite3) |
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS, Framer Motion |
| **State** | React Context + Hooks |
| **Drag & Drop** | @dnd-kit |
| **Icons** | Lucide React |
| **Routing** | React Router DOM |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Quick Start (Recommended)

We provide automated scripts to install dependencies and launch the app in one go.

- **Windows**: Double-click `run_app.bat`
- **macOS/Linux**: Run `./setup_and_run.sh` in your terminal

### Manual Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/job-application-tracker.git
   cd job-application-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run electron:dev
   ```

4. **Build for production**
   ```bash
   npm run electron:build
   ```

---

## ⚙️ Configuration

This application is designed to be **mostly zero-config**.

- **Environment Variables**: No `.env` file is required for basic operation.
- **Database**: The SQLite database is automatically created in your OS-specific application data folder (see "Data Storage" below).
- **Customization**: You can customize various settings (like theme attachment limits) directly in the application code if needed, but no external configuration is strictly necessary.

---

## ❓ Troubleshooting

**1. Application shows a white screen on startup**
- Ensure extensions like React DevTools aren't blocking the window.
- Press `Ctrl + Shift + I` (or `Cmd + Option + I` on macOS) to open the DevTools console and check for errors.

**2. "Native module error" or "Module not found"**
- This often happens if dependencies aren't compiled for the correct Electron version.
- Run the following command to fix it:
  ```bash
  npm run postinstall
  ```

**3. Database Locked or Permission Denied**
- Ensure you have read/write permissions for the data directory listed in the "Data Storage" section.
- If the app crashed, a lingering process might be holding the lock. Check your task manager and kill any "Electron" or "job-application-tracker" processes.

---

## 📁 Project Structure

```
├── electron/               # Electron main process
│   ├── main.ts             # Entry point
│   ├── preload.ts          # IPC bridge
│   ├── ipcHandlers.ts      # Database API handlers
│   └── database/           # SQLite layer
│       ├── database.ts     # DB initialization
│       ├── schema.sql      # Schema definition
│       └── repositories/   # DAO pattern
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── context/            # React Context (uses IPC)
│   ├── pages/              # Application pages
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utilities & migration
```

---

## 💾 Data Storage

Your data is stored locally in a SQLite database:

| OS | Database Location |
|----|-------------------|
| **Windows** | `%APPDATA%/job-application-tracker/job-tracker.db` |
| **macOS** | `~/Library/Application Support/job-application-tracker/job-tracker.db` |
| **Linux** | `~/.config/job-application-tracker/job-tracker.db` |

Attachments are stored in an `attachments/` folder in the same directory.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run electron:dev` | Start Electron with hot reload |
| `npm run electron:build` | Build distributable packages |
| `npm run electron:start` | Run compiled Electron app |
| `npm run dev` | Start Vite dev server only |
| `npm run build` | Build frontend only |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) for cross-platform desktop support
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for fast SQLite access
- [React](https://react.dev/) for the UI framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [dnd-kit](https://dndkit.com/) for drag-and-drop functionality
- [Lucide](https://lucide.dev/) for beautiful icons

