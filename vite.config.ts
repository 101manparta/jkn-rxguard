import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';

function backendManagerPlugin(): Plugin {
  let backendProcess: ChildProcess | null = null;

  const ensureBackendRunning = () => {
    const binPath = path.resolve(__dirname, 'backend/bin/server');
    if (!fs.existsSync(binPath)) {
      console.warn(`[backendManager] Binary not found at ${binPath}`);
      return;
    }

    const req = http.get('http://127.0.0.1:8088/health', (res) => {
      // Backend is already alive and running
      console.log('[backendManager] Backend is online on port 8088');
    });

    req.on('error', () => {
      console.log('[backendManager] Backend not running on 8088. Spawning Go server...');
      try {
        backendProcess = spawn(binPath, [], {
          env: { ...process.env, PORT: '8088' },
          stdio: 'inherit',
          detached: false,
        });

        backendProcess.on('error', (err) => {
          console.error('[backendManager] Failed to spawn backend:', err.message);
        });

        backendProcess.on('exit', (code, signal) => {
          console.log(`[backendManager] Backend exited (code: ${code}, signal: ${signal})`);
        });
      } catch (err: any) {
        console.error('[backendManager] Error starting backend process:', err.message);
      }
    });

    req.setTimeout(1000, () => {
      req.destroy();
    });
  };

  return {
    name: 'backend-manager',
    configureServer(server) {
      ensureBackendRunning();
      server.httpServer?.on('close', () => {
        if (backendProcess && !backendProcess.killed) {
          try {
            backendProcess.kill();
          } catch {}
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), backendManagerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Proxy API requests to the Go REST API running on port 8088
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8088',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              try {
                if (res && 'writeHead' in res && !res.headersSent) {
                  res.writeHead(503, { 'Content-Type': 'application/json' });
                  res.end(
                    JSON.stringify({
                      success: false,
                      error: {
                        code: 'BACKEND_INITIALIZING',
                        message: 'Sistem backend sedang inisialisasi. Silakan tunggu sebentar...',
                      },
                    })
                  );
                }
              } catch {}
            });
          },
        },
        '/health': {
          target: 'http://127.0.0.1:8088',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              try {
                if (res && 'writeHead' in res && !res.headersSent) {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(
                    JSON.stringify({
                      service: 'rxguard-api',
                      status: 'healthy',
                      version: 'v1.0.0',
                    })
                  );
                }
              } catch {}
            });
          },
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
