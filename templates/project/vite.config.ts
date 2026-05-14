import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function edgeChatDevPlugin(mode: string) {
  const env = loadEnv(mode, '.', '');
  const kv = new Map<string, string>();
  const storage = {
    get: async (key: string) => kv.get(key) ?? null,
    put: async (key: string, value: string) => {
      kv.set(key, String(value));
    }
  };

  const toHeaders = (rawHeaders: Record<string, string | string[] | undefined>) => ({
    get: (name: string) => {
      const value = rawHeaders[name.toLowerCase()];
      if (Array.isArray(value)) return value[0] ?? null;
      return value ?? null;
    }
  });

  return {
    name: 'edge-chat-dev-plugin',
    apply: 'serve' as const,
    configureServer(server: any) {
      server.middlewares.use('/api/chat', (req: any, res: any, next: any) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        let raw = '';
        if (typeof req.setEncoding === 'function') {
          req.setEncoding('utf8');
        }

        req.on('data', (chunk: string) => {
          raw += chunk;
        });

        req.on('error', () => {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'Failed to read request body.' }));
        });

        req.on('end', async () => {
          let body: unknown = null;
          try {
            body = raw ? JSON.parse(raw) : null;
          } catch {
            body = null;
          }

          try {
            // @ts-expect-error Edge function is plain JS in this project.
            const { onRequestPost } = await import('./edge-functions/api/chat.js');
            const response = await onRequestPost({
              request: {
                json: async () => body,
                headers: toHeaders(req.headers),
                url: '/api/chat'
              },
              env: {
                AI_API_KEY: env.AI_API_KEY,
                AI_MODEL: env.AI_MODEL,
                AI_API_URL: env.AI_API_URL,
                inkling_kv: storage
              }
            });

            res.statusCode = response.status ?? 200;
            if (response.headers && typeof response.headers.forEach === 'function') {
              response.headers.forEach((value: string, key: string) => res.setHeader(key, value));
            }

            const text = typeof response.text === 'function' ? await response.text() : '{}';
            res.end(text);
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                ok: false,
                error: `Local edge chat execution failed: ${e instanceof Error ? e.message : String(e)}`
              })
            );
          }
        });
      });

      server.middlewares.use('/api/auth', (req: any, res: any, next: any) => {
        const method = String(req.method || 'GET').toUpperCase();
        const origin = `http://${req.headers?.host || 'localhost'}`;
        const rawPath = String(req.url || '/').split('?')[0];
        const path = `/api/auth${rawPath === '/' ? '' : rawPath}`;

        const isLogin = path === '/api/auth/login' && method === 'POST';
        const isRegister = path === '/api/auth/register' && method === 'POST';
        const isMe = path === '/api/auth/me' && method === 'GET';
        if (!isLogin && !isRegister && !isMe) {
          next();
          return;
        }

        let raw = '';
        if (typeof req.setEncoding === 'function') {
          req.setEncoding('utf8');
        }

        req.on('data', (chunk: string) => {
          raw += chunk;
        });

        req.on('error', () => {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'Failed to read request body.' }));
        });

        req.on('end', async () => {
          let body: unknown = null;
          try {
            body = raw ? JSON.parse(raw) : null;
          } catch {
            body = null;
          }

          try {
            let handler: (context: any) => Promise<any>;
            if (isLogin) {
              // @ts-expect-error Edge function is plain JS in this project.
              ({ onRequestPost: handler } = await import('./edge-functions/api/auth/login.js'));
            } else if (isRegister) {
              // @ts-expect-error Edge function is plain JS in this project.
              ({ onRequestPost: handler } = await import('./edge-functions/api/auth/register.js'));
            } else {
              // @ts-expect-error Edge function is plain JS in this project.
              ({ onRequestGet: handler } = await import('./edge-functions/api/auth/me.js'));
            }

            const response = await handler({
              request: {
                json: async () => body,
                headers: toHeaders(req.headers),
                url: `${origin}${path}`
              },
              env: {
                inkling_kv: storage
              }
            });

            res.statusCode = response.status ?? 200;
            if (response.headers && typeof response.headers.forEach === 'function') {
              response.headers.forEach((value: string, key: string) => res.setHeader(key, value));
            }
            const text = typeof response.text === 'function' ? await response.text() : '{}';
            res.end(text);
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                ok: false,
                error: `Local edge auth execution failed: ${e instanceof Error ? e.message : String(e)}`
              })
            );
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), edgeChatDevPlugin(mode)],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts'
  }
}));
