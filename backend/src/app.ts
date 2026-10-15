import path from 'path'
import dotenv from 'dotenv'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'

if (process.env.NODE_ENV !== 'production') {
	dotenv.config({
		path: path.resolve(__dirname, '../../.env')
	})
} else {
	dotenv.config()
}

import listRouter from './routes/list'
import generateSmetaRouter from './routes/generateSmeta'
import uploadSmetaRouter from './routes/uploadSmeta'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', (req: Request, res: Response, next: NextFunction) => {
	console.log(`${req.method} ${req.path}`)
	next()
})

app.use('/api/list', listRouter)
app.use('/api/generate-smeta', generateSmetaRouter)
app.use('/api/upload-smeta', uploadSmetaRouter)

export default app
