const express = require('express')
const cors = require('cors')
require('dotenv').config()

const apiRoutes = require('./routes')
const { notFound, errorHandler } = require('./middleware')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true, service: 'pac-api' }))
app.use('/api', apiRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`PAC API running on http://localhost:${PORT}`)
})
