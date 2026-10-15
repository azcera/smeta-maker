import serverless from 'serverless-http'
import app from './app'

const PORT = Number(process.env.PORT || 3000)

const serverlessHandler = serverless(app, {
	binary: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
})

export const handler = (event: any, context: any) => {
	const realPath = (event.url || event.path || '/').replace(/\?.*/, '')

	const patchedEvent = {
		...event,
		path: realPath,
		requestContext: {
			...event.requestContext,
			path: realPath
		}
	}

	return serverlessHandler(patchedEvent, context)
}

if (process.env.NODE_ENV !== 'production') {
	app.listen(PORT, '0.0.0.0', () => {
		console.log(`[Local] Сервер запущен на http://localhost:${PORT}`)
	})
}
