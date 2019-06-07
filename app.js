const express = require('express')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const request = require('request')

const app = express()

// TODO move this part into module
const API_BASE = 'https://reqres.in/api/users'

app.get('/api/user/:userId', (req, res) => {
  const userId = req.params.userId
  if (!userId) {
    return res.sendStatus(400).json({message: 'Not valid request!'})
  }

  axios.get(`${API_BASE}/${userId}`)
    .then(resp => {
      res.json(resp.data)
    })
    .catch(err => {
      console.log(err)
    })

})

app.get('/api/user/:userId/avatar', (req, res) => {
  const userId = req.params.userId
  if (!userId) {
    return res.sendStatus(400).json({message: 'Not valid request!'})
  }

  const avatarPath = `${userId}_avatar.jpg`

  const sendBase64Avatar = () => {
    const filePath = path.join(__dirname, avatarPath)
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return res.sendStatus(400).json('File not saved correctly!')
      }
      res.json({avatar: Buffer.from(data).toString('base64')})
    })
  }

  if (!fs.existsSync(avatarPath)) {
    axios.get(`${API_BASE}/${userId}`)
      .then(resp => {
        const writeStream = fs.createWriteStream(avatarPath)
        request(resp.data.data.avatar).pipe(writeStream)

        writeStream.on('finish', () => {
          sendBase64Avatar()
        })

        writeStream.on('error', err => console.log(err))
      })
      .catch(err => {
        console.log(err)
      })
  } else {
    sendBase64Avatar()
  }
})

app.delete('/api/user/:userId/avatar', (req, res) => {
  const userId = req.params.userId
  if (!userId) {
    return res.sendStatus(400).json({message: 'Not valid request!'})
  }

  const avatarPath = `${userId}_avatar.jpg`
  if (fs.existsSync(avatarPath)) {
    fs.unlink(avatarPath, err => {
      if (err) {
        return res.sendStatus(400).json({message: 'Something wrong happend!'})
      }
      res.json({message: `User ${userId} avatar is deleted`})
    })

  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => { console.log(`Application is ready on port ${PORT}`) })