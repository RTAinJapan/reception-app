import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * 旧 webpack 構成からの移行設定。
 *  - CopyWebpackPlugin で行っていた public 配下のコピーは Vite の publicDir が担う
 *  - WorkboxWebpackPlugin.GenerateSW は vite-plugin-pwa で置き換え
 *  - 出力先は従来通り build/
 */
export default defineConfig(({ mode }) => ({
  // 旧構成は相対パス（main.js / manifest.json / ./service-worker.js）で配信していたため踏襲する
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: mode !== 'production',
  },
  server: {
    host: 'localhost',
    port: 8080,
    open: true,
  },
  define: {
    // src/js/serviceWorker.ts が参照する webpack 由来の環境変数を Vite でも解決できるようにする
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.PUBLIC_URL': JSON.stringify(''),
  },
  plugins: [
    react(),
    VitePWA({
      // 登録は既存の src/js/serviceWorker.ts で行うため自動注入しない
      injectRegister: null,
      // 既存の public/manifest.json を使うため manifest 生成は無効化
      manifest: false,
      // 旧構成と同じファイル名で Service Worker を生成する
      filename: 'service-worker.js',
      registerType: 'prompt',
      workbox: {
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,json,woff,woff2,otf,wasm}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/imgur\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'imgur',
              expiration: { maxEntries: 5000, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /^https:\/\/files\.kirakiratter\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kirakiratter',
              expiration: { maxEntries: 5000, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
}));
