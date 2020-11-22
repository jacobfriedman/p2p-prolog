const WS_PROTO = "ws://"
const WS_ROUTE = "/echo"


function log(topic, message) {
  console.log('[' + topic + '] ' + message)
}

function wsMessageHandler(event) {
  const payload = JSON.parse(event.data)
  log("WS Response", "Received message: '" + event.data + "'")

  const messages = document.getElementById("messages") 
  const message = document.createElement("div")
  message.className = 'message'

  const contentElement = document.createElement("div")
  contentElement.className = 'content'
  contentElement.appendChild(document.createTextNode(payload.message))
  const timestampElement = document.createElement("div")
  timestampElement.className = 'timestamp'
  timestampElement.appendChild(document.createTextNode(new Date(payload.time*1000)))
  message.appendChild(timestampElement)
  message.appendChild(contentElement)
  let child = messages.appendChild(message)

  child.scrollIntoView()
}

function sendMessage(connection, message) {
  log("Client", "sending message \"" + message + "\"")
  connection.send(message)
}

function openWebSocket() {
  connection = new WebSocket(WS_PROTO + window.location.host + WS_ROUTE)
  connection.onerror = (error) => {
    log("WS", error)
  }
  connection.onmessage = wsMessageHandler
  return connection
}

document.addEventListener('DOMContentLoaded', (e) => {
  const input_box = document.getElementById("input-message")
  const input_button = document.getElementById("message-submit")
  const connection = openWebSocket()
  input_button.addEventListener("click", (event) => {
    const payload = {
      message: input_box.value
    }
    sendMessage(connection, JSON.stringify(payload))
  })
  log("OnLoad", "Add event listeners")
})
