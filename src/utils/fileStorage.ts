// File storage utilities for handling attachments
// Works with Electron IPC when available, falls back to IndexedDB otherwise

export interface StoredFile {
  id: string;
  data: Blob;
  type: string;
  name: string;
  createdAt: string;
}

// Check if we're in Electron environment
const isElectron = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// ==================== Electron Implementation ====================

export const saveFileElectron = async (
  jobId: string,
  file: File
): Promise<{ id: string; storageId: string }> => {
  if (!isElectron()) {
    throw new Error('Electron API not available');
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.electronAPI.attachments.save(
    jobId,
    arrayBuffer,
    file.name,
    file.type
  );

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to save file');
  }

  return {
    id: result.data.id,
    storageId: result.data.storageId,
  };
};

export const getFileElectron = async (
  storageId: string
): Promise<{ blob: Blob; name: string; type: string } | null> => {
  if (!isElectron()) {
    throw new Error('Electron API not available');
  }

  const result = await window.electronAPI.attachments.get(storageId);

  if (!result.success || !result.data) {
    return null;
  }

  const blob = new Blob([result.data.data], {
    type: result.data.metadata.mimeType,
  });

  return {
    blob,
    name: result.data.metadata.originalName,
    type: result.data.metadata.mimeType,
  };
};

export const deleteFileElectron = async (attachmentId: string): Promise<void> => {
  if (!isElectron()) {
    throw new Error('Electron API not available');
  }

  const result = await window.electronAPI.attachments.delete(attachmentId);

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete file');
  }
};

// ==================== IndexedDB Fallback Implementation ====================

const DB_NAME = 'JobTrackerStorage';
const STORE_NAME = 'attachments';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const initDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });

  return dbPromise!;
};

export const saveFile = async (file: File): Promise<string> => {
  // Use Electron if available (this is called from older code paths)
  // New code should use saveFileElectron directly

  const db = await initDB();
  const id = crypto.randomUUID();
  const storedFile: StoredFile = {
    id,
    data: file,
    type: file.type,
    name: file.name,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(storedFile);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject('Error saving file');
  });
};

export const getFile = async (id: string): Promise<StoredFile | undefined> => {
  // Try Electron first if available
  if (isElectron()) {
    const result = await getFileElectron(id);
    if (result) {
      return {
        id,
        data: result.blob,
        type: result.type,
        name: result.name,
        createdAt: new Date().toISOString(),
      };
    }
  }

  // Fallback to IndexedDB
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error retrieving file');
  });
};

export const deleteFile = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error deleting file');
  });
};

// ==================== Legacy Data Migration ====================

export const getAllFilesFromIndexedDB = async (): Promise<StoredFile[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject('Error getting all files');
  });
};
