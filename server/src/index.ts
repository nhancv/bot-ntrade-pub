const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
const request = require('request')
const printLog = require('chalk-printer')
const logFile = require('nlogj')
logFile.setLogName('ntrade.log').clearLog()
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
  printLog.ok('Server listening at port %d', port)
})

let WebSocketClient = require('websocket').client
let client = new WebSocketClient()

client.on('connectFailed', function(error) {
  printLog.error('Connect Error: ' + error.toString())
})

client.on('connect', function(connection) {
  printLog.ok('WebSocket Client Connected')
  connection.on('error', function(error) {
    printLog.error('Connection Error: ' + error.toString())
  })
  connection.on('close', function() {
    printLog.warn('Connection Closed')
  })
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      // log("Received: '" + message.utf8Data + "'")
      let body = JSON.parse(message.utf8Data)
      if (body.k.x === true) {
        checking()
      }
    }
  })
})

let symbol: string = 'wanbtc'
let durTime: string = '5m'
let safeRange: number = 26 //include current

client.connect(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${durTime}`)

function fetchKLineVolume(pair: string = symbol) {
  return new Promise((resolve, reject) => {
    request(
      `https://api.binance.com/api/v1/klines?symbol=${pair.toUpperCase()}&interval=${durTime}&limit=${safeRange}`,
      (error, response, body) => {
        if (error) {
          reject(error)
        } else {
          resolve(JSON.parse(body))
        }
      }
    )
  })
}

/*************
 * Logic check unnormal signal.
 * Check 24 candle (not include current)
 * X[23..0] Current is green candle
 * If current > 7X[0] && max(X[23..1]) < 4 * avg(X[23..1])
 */
function checking() {
  printLog.trace('Checking...')
  fetchKLineVolume().then(
    value => {
      if (Array.isArray(value) && value.length) {
        let volArr = value.map(v => parseFloat(v[5])) as Array<number>
        let currentVol = volArr[volArr.length - 2]
        let currentOpen = parseFloat(value[volArr.length - 2][1])
        let currentClose = parseFloat(value[volArr.length - 2][4])
        if (currentOpen < currentClose) {
          let prevVol = volArr[volArr.length - 3]
          volArr.splice(-1, 3)
          let sum = volArr.reduce(function(a, b) {
            return a + b
          })
          let avg = sum / volArr.length
          let maxValue = Math.max(...volArr)
          if (maxValue < 4 * avg && currentVol > 7 * prevVol) {
            //trigger
            let dataLog = `MaxValue: ${maxValue} - MaxValue: ${maxValue} - MaxValue: ${maxValue}`
            logFile.log(dataLog)
            printLog.ok('OK')
          } else {
            printLog.trace('Normal')
          }
        } else {
          printLog.trace('Red candle')
        }
      } else {
        printLog.log('Data must be Array type')
      }
    },
    error => {
      printLog.error(error.message)
    }
  )
}
