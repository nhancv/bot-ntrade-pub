const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
const app = express()
const log = console.log
var port = process.env.PORT || 4000

// Body parser: https://github.com/expressjs/body-parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// CORS on ExpressJS: https://github.com/expressjs/cors
app.use(cors())
// Cookie parser: https://github.com/expressjs/cookie-parser
app.use(cookieParser())

// For fontend route
var frontendDir = path.join(path.dirname(path.dirname(__dirname)), 'frontend')
app.use('/home', express.static(path.join(frontendDir, 'build')))
app.get('/home', function(req, res) {
  res.sendFile(path.join(frontendDir, 'build', 'index.html'))
})
app.get('/', function(req, res) {
  res.redirect('/home')
})

app.listen(port, function() {
  log('Server listening at port %d', port)
})
