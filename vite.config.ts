import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
  const geminiModel = 'gemini-3.1-flash-lite';

  return {  
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'truthlens-gemini-proxy',
        configureServer(server) {
          server.middlewares.use('/api/gemini', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({error: 'Method not allowed'}));
              return;
            }

            if (!geminiApiKey) {
              res.statusCode = 500;
              res.end(JSON.stringify({error: 'Gemini API key is missing'}));
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const geminiResponse = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
                  {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body,
                  },
                );

                const text = await geminiResponse.text();
                res.statusCode = geminiResponse.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(text);
              } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: error instanceof Error ? error.message : 'Gemini proxy failed',
                  }),
                );
              }
            });
          });
        },
      },
    ],
    envPrefix: ['VITE_PUBLIC_'],
    define: {
      'import.meta.env.VITE_GEMINI_PROXY_URL': JSON.stringify(
        env.VITE_GEMINI_PROXY_URL || 'http://10.57.186.15:3000/api/gemini',
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


