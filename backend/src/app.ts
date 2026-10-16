import cors from 'cors'
import dotenv from 'dotenv'
import express, { NextFunction, Request, Response } from 'express'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
	dotenv.config({
		path: path.resolve(__dirname, '../../.env')
	})
} else {
	dotenv.config()
}

import generateSmetaRouter from './routes/generateSmeta'
import getUpdateTime from './routes/getUpdateTime'
import listRouter from './routes/list'
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
app.use('/api/get-update-time', getUpdateTime)

export default app
