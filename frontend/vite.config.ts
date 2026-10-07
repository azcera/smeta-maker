import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: [
				'favicon.svg',
				'favicon.ico',
				'favicon-96x96.png',
				'apple-touch-icon.png',
				'web-app-manifest-192x192.png',
				'web-app-manifest-512x512.png'
			],
			manifest: {
				name: 'Создатель смет',
				short_name: 'Сметовик',
				theme_color: '#0a0a0a',
				background_color: '#0a0a0a',
				display: 'standalone',
				orientation: 'portrait-primary',
				start_url: '/',
				scope: '/',
				lang: 'ru',
				icons: [
					{
						src: 'web-app-manifest-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'web-app-manifest-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'web-app-manifest-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				// кэш статики приложения
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				// API: сначала сеть, при офлайне — кэш (подстрой под свой бэкенд)
				runtimeCaching: [
					{
						urlPattern: ({ url }) => url.pathname.startsWith('/api'),
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 // 1 день
							},
							networkTimeoutSeconds: 5
						}
					}
				]
			},
			// чтобы SW работал и в dev (удобно отлаживать)
			devOptions: {
				enabled: true
			}
		})
	],
	envDir: path.resolve(import.meta.dirname, '../'),
	server: {
		host: true,
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false
			}
		}
	}
})
