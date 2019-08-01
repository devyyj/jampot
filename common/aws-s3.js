/* eslint-disable space-before-function-paren */
const path = require('path')
const AWS = require('aws-sdk')
const fs = require('fs')
const proxy = require('proxy-agent')

AWS.config.update({
  sslEnabled: false,
  region: 'ap-northeast-2'
  // , httpOptions: { agent: proxy('http://210.112.194.110:3128') }
})

const s3 = new AWS.S3()

async function uploadFile(OriginalName, fileName, filePath) {
  try {
    var fileStream = fs.createReadStream(filePath)
    fileStream.on('error', function (err) {
      console.log('File Error', err)
    })
    const uploadParams = {
      Bucket: 'free-board-image',
      Body: fileStream,
      Key: fileName + path.extname(OriginalName)
    }
    const result = await s3.upload(uploadParams).promise()
    fs.unlinkSync(filePath)
    return result.Location
  } catch (error) {
    console.log(error)
  }
}

module.exports = uploadFile
