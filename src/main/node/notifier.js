const process = require('process')
const io = require('socket.io-client')
const https = require('https')

const NODE_SHOW_HOST = process.env.NODE_SHOW_HOST || "localhost"
const NODE_SHOW_PORT = process.env.NODE_SHOW_PORT || 8080

socket = io(`https://${NODE_SHOW_HOST}:${NODE_SHOW_PORT}`, 
{ //INSECURE
  rejectUnauthorized: false,
  requestCert: true,  
  agent: false
});

socket.on("connect_error", (err) => {  console.log(`connect_error due to ${err.message}`);});
socket.on('error', function(err) {
  console.log("Error while Socket.IO emit")
  console.log(err)
});

//todo register robot

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

  const data = JSON.stringify(unserdata)
  socket.emit('update', data)
}

function sendCategory (pid, name) {
  let cat = clone(category)
  cat.id = name
  cat.innerHTML = `<h1>${name}</h1>`

  sendInject(pid, "news-viewport", cat)
}

//todo embed title and source somehow
function sendArticle (pid, category, title, id, source, data) {
  let crd = clone(card)
  crd.id = id
  crd.innerHTML = data

  sendInject(pid, category, crd)
}

function makePresentation(callback) {
  const options = {
    hostname: NODE_SHOW_HOST,
    port: NODE_SHOW_PORT,
    path: '/new',
    method: 'GET',
    //INSECURE::
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
  }
  
  const req = https.request(options, res => {
    let body = ''
    res.on('data', d => {
      body += d
    })
  
    res.on('end', function() {
      console.log(`News presentation: ${body}`)
      callback(body)
    })
  })
  
  req.on('error', error => {
    console.error(error)
    callback(null)
  })
  
  req.end()
}

module.exports = {
    makePresentation: makePresentation,
    makeCathegory: sendCategory,
    sendArticle: sendArticle 
}