# Job Application Tracker

A modern, efficient job application tracker built with React, TypeScript, and Vite. Keep track of your job applications, interview statuses, and important dates in one place.

## Features

- **Dashboard**: Overview of your application progress.
- **Kanban Board**: Drag-and-drop interface to manage application statuses.
- **Job Details**: Detailed view for each application.
- **Modern UI**: Clean and responsive design using Tailwind CSS.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management**: React Context / Hooks
- **Drag & Drop**: @dnd-kit
- **Linting & Formatting**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd job-application-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

Build the application for production:

```bash
npm run build
```

### Linting and Formatting

Run the linter:

```bash
npm run lint
```

Format the code:

```bash
npm run format
```

## Project Structure

src/
├── components/ # Reusable UI components
├── context/ # React Context providers
├── hooks/ # Custom React hooks
├── pages/ # Application pages/routes
├── types/ # TypeScript type definitions
├── App.tsx # Main application component
└── main.tsx # Entry point

```

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License.
```
