import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

// Development-specific configuration
const developmentConfig = () => {
    const baseFolder =
        env.APPDATA !== undefined && env.APPDATA !== ''
            ? `${env.APPDATA}/ASP.NET/https`
            : `${env.HOME}/.aspnet/https`;

    const certificateName = "realstate-servcices.client";
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder, { recursive: true });
    }

    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
        if (0 !== child_process.spawnSync('dotnet', [
            'dev-certs',
            'https',
            '--export-path',
            certFilePath,
            '--format',
            'Pem',
            '--no-password',
        ], { stdio: 'inherit' }).status) {
            throw new Error("Could not create certificate.");
        }
    }

    const target = env.ASPNETCORE_HTTPS_PORT
        ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
        : env.ASPNETCORE_URLS
            ? env.ASPNETCORE_URLS.split(';')[0]
            : 'https://localhost:7075';

    return {
        server: {
            proxy: {
                '^/api': {
                    target,
                    secure: false,
                    changeOrigin: true
                },
            },
            port: 64324, // Preferred port
            https: {
                key: fs.readFileSync(keyFilePath),
                cert: fs.readFileSync(certFilePath),
            },
            strictPort: false, // Allow fallback to next available port
            hmr: {
                protocol: 'wss',
                host: 'localhost',
                // Port will automatically match the server port
            }
        }
    };
};

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';


    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
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
                        'utils-vendor': ['axios', 'dayjs', 'moment']
                    }
                }
            }
        },
        base: isProduction ? '/' : '/',

        define: {
            'process.env.VITE_APP_NAME': JSON.stringify('Betheland Real Estate'),
            'process.env.VITE_API_BASE_URL': JSON.stringify(
                isProduction ? 'https://betheland.com' : 'https://localhost:7075'
            )
        },

        ...(isProduction ? {} : developmentConfig())
    };
});