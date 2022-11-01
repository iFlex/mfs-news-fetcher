const process = require('process')
const io = require('socket.io-client')
const https = require('https')
const LogFactory = require("../logger");
const LOGGER = LogFactory.getLogger("NodeShowPusher");


const DEBUG = process.env.DEBUG || false
const NODE_SHOW_HOST = process.env.NODE_SHOW_HOST || "localhost"
const NODE_SHOW_PORT = process.env.NODE_SHOW_PORT || 8080
const NODE_SHOW_PSK = process.env.NODE_SHOW_PSK

let socketIoConfig = {
  extraHeaders: {
    Authorization: `${NODE_SHOW_PSK}`//[TODO]: use real oauth
  }
}

let httpOptions = {
  hostname: NODE_SHOW_HOST,
  port: NODE_SHOW_PORT,
  path: '/new',
  method: 'GET',
  headers: {
    Authorization: `${NODE_SHOW_PSK}`//[TODO]: use real oauth
  }
}


//[TODO]: add auth header in socketio config as well
if (DEBUG) {
  //INSECURE - for local debug only
  socketIoConfig.rejectUnauthorized = false
  socketIoConfig.requestCert = true  
  socketIoConfig.agent = false
  
  httpOptions['rejectUnauthorized'] = false;
  httpOptions['requestCert'] = true;
  httpOptions['agent'] = false;
}

let socketIoURL = `https://${NODE_SHOW_HOST}:${NODE_SHOW_PORT}`
LOGGER.info(`Connecting socket.io to ${socketIoURL}`)

socket = io(socketIoURL, socketIoConfig);
socket.on("connect_error", (err) => {  
  LOGGER.error(`connect_error due to ${err}`, err);
});
socket.on('error', function(err) {
  LOGGER.error("Error while Socket.IO emit", err)
});
socket.on('activity', (data) => {
  LOGGER.info(`feedback from server ${JSON.stringify(data)}`)
});

const templateInject = {
  presentationId: "",
  userId: "robot",
  event:"container.create",
  detail: {
    parentId: null,
    descriptor:{}
  }
}

const category = {
  "nodeName":"DIV",
  "className":"news-feed-category",
  "id":""
}

const card = {
  "nodeName":"DIV",
  "className":"news-feed-card",
  "id":"",
  "permissions":{"container.set.width":{"*":false}}
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function sendInject (pid, parentId, unserialized) {
  const unserdata = clone(templateInject)
  unserdata.presentationId = pid
  unserdata.parentId = parentId
  unserdata.detail.parentId = parentId
  unserdata.detail.descriptor = unserialized

  socket.emit('update', unserdata, (cb) => {})
}

function sendCategory (pid, name) {
  let cat = clone(category)
  cat.id = name
  cat.innerHTML = `<h1>${name}</h1>`

  //sendInject(pid, "news-viewport", cat)
  sendInject(pid, null, cat)
}

//todo embed title and source somehow
function sendArticle (pid, category, title, id, source, data) {
  let crd = clone(card)
  crd.id = id
  crd.innerHTML = data

  sendInject(pid, category, crd)
}

function joinEventStream(pid) {
  LOGGER.info(`Registering for events on ${pid}`)
  socket.emit("register", {presentationId:pid});
}

function makePresentation(prezOwner, callback) {
  let httpOps = clone(httpOptions)
  httpOps.headers.owner = prezOwner
  
  const req = https.request(httpOps, res => {
    let body = ''
    res.on('data', d => {
      body += d
    })
  
    res.on('end', function() {
      LOGGER.info(`Created new News presentation: ${body}`)
      joinEventStream(body)
      callback(body)
    })
  })
  
  req.on('error', error => {
    LOGGER.error('Failed to create News presentation', error)
    callback(null)
  })
  req.end()
}

module.exports = {
    makePresentation: makePresentation,
    makeCathegory: sendCategory,
    sendArticle: sendArticle 
}