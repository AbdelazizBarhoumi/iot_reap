/// <reference types="vitest" />
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./resources/js/test/setup.ts'],
        include: ['resources/js/**/*.{test,spec}.{ts,tsx}'],
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
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
    server: {
        // Listen on all network interfaces in development
        host: '0.0.0.0',
        port: 5173,
        // Allow external access when running on different IPs
        middlewareMode: false,
        // Configure HMR to use localhost for browser connections
        // This prevents CSP violations when server listens on 0.0.0.0
        hmr: {
            host: 'localhost',
            port: 5173,
            protocol: 'http',
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks - split large dependencies
                    'vendor-react': ['react', 'react-dom', 'react-dom/client'],
                    'vendor-inertia': ['@inertiajs/react'],
                    'vendor-ui': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-popover',
                        '@radix-ui/react-select',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-tooltip',
                    ],
                    'vendor-motion': ['framer-motion'],
                    'vendor-charts': ['recharts'],
                    'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
                },
            },
        },
        // Increase chunk warning limit (optional, for cleaner output)
        chunkSizeWarningLimit: 600,
    },
});
