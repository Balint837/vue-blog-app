import jsonServer from 'json-server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const server = jsonServer.create()
const router = jsonServer.router(join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

const SECRET_KEY = crypto.randomBytes(32)
const TOKEN_EXPIRATION = '1h'

server.use(middlewares)
server.use(jsonServer.bodyParser)

const createToken = (payload) => jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION })
const verifyToken = (token) => jwt.verify(token, SECRET_KEY)

const findUserByEmail = (email) => router.db.get('users').find({ email }).value()
const findUserById = (id) =>
  router.db
    .get('users')
    .find({ id: parseInt(id) })
    .value()
const findPostById = (id) =>
  router.db
    .get('posts')
    .find({ id: parseInt(id) })
    .value()

server.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Hiányzó token' })
  }

  try {
    const decoded = verifyToken(token) // Verify token
    const user = findUserByEmail(decoded.email) // Get the user based on email
    if (!user) return res.status(404).json({ message: 'Felhasználó nem található' })

    res.status(200).json({ user })
  } catch (err) {
    res.status(401).json({ message: 'Érvénytelen vagy lejárt token' })
  }
})

server.post('/register', (req, res) => {
  const { name, email, password } = req.body
  if (findUserByEmail(email)) return res.status(400).json({ message: 'Email már használatban van' })

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: bcrypt.hashSync(password, 8),
  }
  router.db.get('users').push(newUser).write()

  const accessToken = createToken({ email, name })
  res.status(200).json({ token: accessToken, user: { id: newUser.id, name, email } })
})

server.post('/login', (req, res) => {
  const { email, password } = req.body
  const user = findUserByEmail(email)

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Hibás email vagy jelszó' })
  }

  const accessToken = createToken({ email, name: user.name })
  res.status(200).json({ token: accessToken, user: { id: user.id, name: user.name, email } })
})

server.put('/profile/update', (req, res) => {
  const { id, name, email } = req.body

  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Hiányzó token' })
  }

  let user = null
  try {
    const decoded = verifyToken(token)
    user = findUserByEmail(decoded.email)
    if (!user) return res.status(404).json({ message: 'Felhasználó nem található' })
  } catch (err) {
    res.status(401).json({ message: 'Érvénytelen vagy lejárt token' })
  }

  if (email !== user.email && findUserByEmail(email)) {
    return res.status(400).json({ message: 'Ez az email cím már használatban van' })
  }

  router.db
    .get('users')
    .find({ id: parseInt(id) })
    .assign({ name, email })
    .write()
  res.status(200).json({ message: 'Profil sikeresen frissítve', user: { id, name, email } })
})

server.put('/profile/change-password', (req, res) => {
  const { id, currentPassword, newPassword } = req.body
  const user = findUserById(id)
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ message: 'Hibás jelenlegi jelszó' })
  }

  router.db
    .get('users')
    .find({ id: parseInt(id) })
    .assign({ password: bcrypt.hashSync(newPassword, 8) })
    .write()
  res.status(200).json({ message: 'Jelszó sikeresen megváltoztatva' })
})

server.get('/posts', (req, res) => {
  res.status(200).json(router.db.get('posts').value())
})
server.get('/posts/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Hiányzó token' })
  }

  let user = null
  try {
    const decoded = verifyToken(token)
    user = findUserByEmail(decoded.email)
    if (!user) return res.status(404).json({ message: 'Felhasználó nem található' })
  } catch (err) {
    res.status(401).json({ message: 'Érvénytelen vagy lejárt token' })
  }

  res.status(200).json(
    router.db
      .get('posts')
      .value()
      .filter((post) => post.authorId === user.id)
  )
})

server.get('/posts/:id', (req, res) => {
  const post = findPostById(req.params.id)
  if (!post) return res.status(404).json({ error: 'Poszt nem található' })
  res.status(200).json(post)
})

server.post('/posts', (req, res) => {
  const { title, subtitle, content, shortText, image, category } = req.body
  if (!title || !subtitle || !content || !shortText || !image || !category) {
    return res.status(400).json({ error: 'Minden mezőt ki kell tölteni' })
  }

  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Hiányzó token' })
  }

  let authorId = null
  try {
    const decoded = verifyToken(token)
    const user = findUserByEmail(decoded.email)
    if (!user) return res.status(404).json({ message: 'Felhasználó nem található' })

    authorId = user.id
  } catch (err) {
    return res.status(401).json({ message: 'Érvénytelen vagy lejárt token' })
  }

  const newPost = { id: Date.now(), title, subtitle, content, shortText, image, category, authorId }
  router.db.get('posts').push(newPost).write()
  res.status(201).json({ message: 'Poszt sikeresen létrehozva', post: newPost })
})

server.put('/posts/:id', (req, res) => {
  const { id } = req.params
  const updatedData = req.body
  const post = findPostById(id)
  if (!post) return res.status(404).json({ error: 'Poszt nem található' })

  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Hiányzó token' })
  }

  let user = null
  try {
    const decoded = verifyToken(token)
    user = findUserByEmail(decoded.email)
    if (!user) return res.status(404).json({ message: 'Felhasználó nem található' })
  } catch (err) {
    return res.status(401).json({ message: 'Érvénytelen vagy lejárt token' })
  }
  if (user.id != post.authorId) {
    return res.status(403).json({ message: 'Nincs jogosultság a művelethez' })
  }

  router.db
    .get('posts')
    .find({ id: parseInt(id) })
    .assign(updatedData)
    .write()
  res.status(200).json({ message: 'Post updated successfully', post: { id, ...updatedData } })
})

server.delete('/posts/:id', (req, res) => {
  const post = findPostById(req.params.id)
  if (!post) return res.status(404).json({ error: 'Poszt nem található' })

  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Hiányzó token' })
  }

  let user = null
  try {
    const decoded = verifyToken(token)
    user = findUserByEmail(decoded.email)
    if (!user) return res.status(404).json({ message: 'Felhasználó nem található' })
  } catch (err) {
    return res.status(401).json({ message: 'Érvénytelen vagy lejárt token' })
  }
  if (user.id != post.authorId) {
    return res.status(403).json({ message: 'Nincs jogosultság a művelethez' })
  }

  router.db
    .get('posts')
    .remove({ id: parseInt(req.params.id) })
    .write()
  res.status(200).json({ message: 'Poszt sikeresen törölve' })
})

server.use(/^(?!\/auth).*$/, (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Hiányzó token' })

  try {
    verifyToken(token)
    next()
  } catch (err) {
    res.status(401).json({ message: 'Érvénytelen vagy lejárt token' })
  }
})

server.use(router)
server.listen(3000, () => console.log('JSON Server is running on port 3000'))
