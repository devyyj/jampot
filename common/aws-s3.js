/* eslint-disable space-before-function-paren */
const path = require('path')
const AWS = require('aws-sdk')
const fs = require('fs')
const proxy = require('proxy-agent')
const jimp = require('jimp')

AWS.config.update({
  region: 'ap-northeast-2'
  , httpOptions: { agent: proxy('http://210.112.194.110:3128') }
})

const s3 = new AWS.S3()

async function uploadFile (OriginalName, fileName, filePath) {
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
    // 업로드
    const result = await s3.upload(uploadParams).promise()

    // 리사이징 이미지 업로드
    const image = await jimp.read(filePath)
    const newFilePath = 'uploads/' + fileName + '_resize' + '.jpg'
    const resize = await image.resize(400, jimp.AUTO).write(newFilePath)

    // 삭제
    fs.unlinkSync(filePath)
    return result.Location
  } catch (error) {
    console.log(error)
  }
}

module.exports = uploadFile
