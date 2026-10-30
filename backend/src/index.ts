import cors from 'cors'
import dotenv from 'dotenv'
import express, { NextFunction, Request, Response } from 'express'
import path from 'path'
import serverless from 'serverless-http'
import { listsRouter } from './routes/listsRoutes'
import { smetaRouter } from './routes/smetaRoutes'
if (process.env.NODE_ENV !== 'production') {
	dotenv.config({
		path: path.resolve(__dirname, '../../.env')
	})
} else {
	dotenv.config()
}

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// логирование запросов
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
	console.log(`${req.method} ${req.path}`)
	next()
})

app.use('/api', listsRouter)
app.use('/api', smetaRouter)

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

export default app
