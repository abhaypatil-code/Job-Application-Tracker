import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { initDatabase, closeDatabase } from './database/database';
import { registerIpcHandlers } from './ipcHandlers';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        fullscreen: true, // Launch in fullscreen mode
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
        titleBarStyle: 'default',
        backgroundColor: '#0a0a0a',
        show: false,
        autoHideMenuBar: true, // Hide the menu bar
    });

    // Remove the menu bar completely
    mainWindow.setMenu(null);

    // Show window when ready to prevent white flash
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    // Handle load errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
    });

    // Load the app
    // When not packaged (development), try Vite dev server first
    // When packaged, load from built files
    if (!app.isPackaged) {
        // Development mode - try Vite dev server
        console.log('Development mode - loading from Vite dev server...');
        mainWindow.loadURL('http://localhost:5173').catch((err) => {
            // If Vite server isn't running, fall back to built files
            console.log('Vite server not available, loading from built files...');
            const indexPath = path.join(__dirname, '../dist/index.html');
            mainWindow!.loadFile(indexPath);
        });
    } else {
        // Production mode - load built files
        const indexPath = path.join(__dirname, '../dist/index.html');
        console.log('Production mode - loading from:', indexPath);
        mainWindow.loadFile(indexPath);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Initialize app
app.whenReady().then(() => {
    // Initialize database first
    initDatabase();

    // Register IPC handlers
    registerIpcHandlers();

    // Create the main window
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Cleanup on quit
app.on('before-quit', () => {
    closeDatabase();
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
