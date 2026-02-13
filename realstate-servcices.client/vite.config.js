import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

// ========================
// DEVELOPMENT CONFIGURATION
// ========================
const developmentConfig = () => {
    const baseFolder =
        env.APPDATA !== undefined && env.APPDATA !== ''
            ? `${env.APPDATA}/ASP.NET/https`
            : `${env.HOME}/.aspnet/https`;

    const certificateName = "realstate-servcices.client";
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    // Ensure certificate folder exists
    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder, { recursive: true });
    }

    // Generate dev certs if missing
    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
        if (
            0 !==
            child_process.spawnSync(
                'dotnet',
                [
                    'dev-certs',
                    'https',
                    '--export-path',
                    certFilePath,
                    '--format',
                    'Pem',
                    '--no-password',
                ],
                { stdio: 'inherit' }
            ).status
        ) {
            throw new Error("Could not create or export ASP.NET dev certificate.");
        }
    }

    // ----------------------------
    // Return HTTPS Vite server config
    // ----------------------------
    return {
        server: {
            https: {
                key: fs.readFileSync(keyFilePath),
                cert: fs.readFileSync(certFilePath),
            },
            proxy: {
                '/api': {
                    target: 'https://localhost:7080',
                    secure: false,
                    changeOrigin: true,
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, _res) => {
                            console.log('Proxy error:', err);
                        });
                        proxy.on('proxyReq', (proxyReq, req, _res) => {
                            console.log('Proxying request:', req.method, req.url);
                        });
                        proxy.on('proxyRes', (proxyRes, req, _res) => {
                            console.log('Proxy response:', proxyRes.statusCode, req.url);
                        });
                    },
                },
            },
            port: 64324,
            strictPort: false,
            hmr: {
                protocol: 'wss',
                host: 'localhost',
            },
        },
    };
};

// ========================
// MAIN CONFIG EXPORT
// ========================
export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: isProduction ? false : true,
            emptyOutDir: true,
            minify: isProduction ? 'esbuild' : false,
            chunkSizeWarningLimit: 1600,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom'],
                        'ui-vendor': ['antd', '@ant-design/icons'],
                        'map-vendor': ['leaflet', 'react-leaflet'],
                        'utils-vendor': ['axios', 'dayjs', 'moment'],
                    },
                },
            },
        },
        base: isProduction ? '/' : '/',

        define: {
            'process.env.VITE_APP_NAME': JSON.stringify('Betheland Real Estate'),
            'process.env.VITE_API_BASE_URL': JSON.stringify(
                isProduction ? 'https://betheland.runasp.net' : '/api' 
            ),
        },

        ...(isProduction ? {} : developmentConfig()),
    };
});