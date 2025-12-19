// Script to rename .js files to .cjs for CommonJS compatibility
// Run after TypeScript compilation for Electron

import { readdirSync, renameSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '..', 'dist-electron');

function renameJsToCjs(dir) {
    if (!existsSync(dir)) {
        console.log(`Directory does not exist: ${dir}`);
        return;
    }

    const entries = readdirSync(dir);

    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            renameJsToCjs(fullPath);
        } else if (extname(entry) === '.js') {
            const newName = basename(entry, '.js') + '.cjs';
            const newPath = join(dir, newName);
            renameSync(fullPath, newPath);
            console.log(`Renamed: ${entry} -> ${newName}`);
        }
    }
}

try {
    renameJsToCjs(distDir);
    console.log('Successfully renamed all .js files to .cjs');
} catch (error) {
    console.error('Error renaming files:', error);
    process.exit(1);
}
