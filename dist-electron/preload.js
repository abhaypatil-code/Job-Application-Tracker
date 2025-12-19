"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose the API to the renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    jobs: {
        getAll: () => electron_1.ipcRenderer.invoke('jobs:getAll'),
        getById: (id) => electron_1.ipcRenderer.invoke('jobs:getById', id),
        create: (job) => electron_1.ipcRenderer.invoke('jobs:create', job),
        update: (id, updates) => electron_1.ipcRenderer.invoke('jobs:update', id, updates),
        delete: (id) => electron_1.ipcRenderer.invoke('jobs:delete', id),
    },
    rounds: {
        add: (jobId, round) => electron_1.ipcRenderer.invoke('rounds:add', jobId, round),
        update: (roundId, updates) => electron_1.ipcRenderer.invoke('rounds:update', roundId, updates),
        delete: (roundId) => electron_1.ipcRenderer.invoke('rounds:delete', roundId),
    },
    attachments: {
        save: (jobId, fileData, fileName, mimeType) => electron_1.ipcRenderer.invoke('attachments:save', jobId, fileData, fileName, mimeType),
        get: (storageId) => electron_1.ipcRenderer.invoke('attachments:get', storageId),
        delete: (attachmentId) => electron_1.ipcRenderer.invoke('attachments:delete', attachmentId),
    },
    migration: {
        importLegacyData: (jobs) => electron_1.ipcRenderer.invoke('migration:importLegacyData', jobs),
        checkExistingData: () => electron_1.ipcRenderer.invoke('migration:checkExistingData'),
    },
});
//# sourceMappingURL=preload.js.map