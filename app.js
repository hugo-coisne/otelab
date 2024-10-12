const PORT = 8080
const express = require('express')
const app = express()

app.listen(parseInt(PORT, 10), () => {
  console.log(`listening on http://localhost:${PORT}`)
})

app.get('/', (req, res) => {
  res.send('Hello World');
})