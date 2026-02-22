import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

import { readdirSync } from 'fs';
import path from 'path';

/**
 * Recursively collect all `.tsx` page components so we can
 * register them as explicit input entries for Vite.  The
 * blade layout still passes the current component to `@vite`
 * (see `app.blade.php`), so the manifest must contain a key
 * for each one.  Without this we saw "Unable to locate file
 * in Vite manifest" at runtime when visiting a new page.
 */
function collectPageFiles(dir: string): string[] {
    const entries: string[] = [];
    for (const item of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
            entries.push(...collectPageFiles(full));
        } else if (item.isFile() && full.endsWith('.tsx')) {
            // convert Windows backslashes to forward slashes for Vite
            entries.push(full.replace(/\\/g, '/'));
        }
    }
    return entries;
}

const pageInputs = collectPageFiles('resources/js/pages');

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx', ...pageInputs],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
