const io = require('socket.io-client')

socket = io(`ws://localhost:8080`)
//todo register robot

const templateInject = {
  presentationId: "",
  userId: "robot",
  event:"container.createSerialized",
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
  "id":""
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

module.exports = {
    makeCathegory: sendCategory,
    sendArticle: sendArticle 
}