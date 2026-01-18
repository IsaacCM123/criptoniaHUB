require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(cors())
app.use(express.json())
app.use(express.static(__dirname)) // servir index.html

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err))

// MODELO
const CommentSchema = new mongoose.Schema({
  user: String,
  text: String,
  likes: [String],
  dislikes: [String],
  createdAt: { type: Date, default: Date.now }
})

const Comment = mongoose.model('Comment', CommentSchema)

// RUTAS
app.get('/comments', async (req, res) => {
  const comments = await Comment.find().sort({ createdAt: -1 })
  res.json(comments)
})

app.post('/comments', async (req, res) => {
  const comment = new Comment(req.body)
  await comment.save()
  io.emit('new-comment', comment)
  res.json(comment)
})

app.post('/like/:id', async (req, res) => {
  const { user } = req.body
  const comment = await Comment.findById(req.params.id)

  if (!comment.likes.includes(user)) {
    comment.likes.push(user)
    comment.dislikes = comment.dislikes.filter(u => u !== user)
    await comment.save()
    io.emit('update-comment', comment)
  }
  res.json(comment)
})

app.post('/dislike/:id', async (req, res) => {
  const { user } = req.body
  const comment = await Comment.findById(req.params.id)

  if (!comment.dislikes.includes(user)) {
    comment.dislikes.push(user)
    comment.likes = comment.likes.filter(u => u !== user)
    await comment.save()
    io.emit('update-comment', comment)
  }
  res.json(comment)
})

// SOCKET
io.on('connection', () => {
  console.log('Usuario conectado')
})

server.listen(process.env.PORT, () =>
  console.log('Servidor en puerto', process.env.PORT)
)
