const http = require("http")
const config = require("./utils/config")
const app = require("./app")

console.log("starting server")

const server = http.createServer(app)

const PORT = config.PORT || 3004

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
