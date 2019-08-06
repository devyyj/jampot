/* eslint-disable space-before-function-paren */
const path = require('path')
const AWS = require('aws-sdk')
const fs = require('fs')
const proxy = require('proxy-agent')
const jimp = require('jimp')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

AWS.config.update({
  region: 'ap-northeast-2'
  , httpOptions: { agent: proxy('http://210.112.194.110:3128') }
})

const s3 = new AWS.S3()

async function uploadFile (OriginalName, fileName, filePath) {
  try {
    const extname = path.extname(OriginalName)
    const newFilePath = 'uploads/' + fileName + '_resize'

    var fileStream = fs.createReadStream(filePath)
    fileStream.on('error', function (err) {
      console.log('File Error', err)
    })
    const uploadParams = {
      Bucket: 'free-board-image',
      Body: fileStream,
      Key: fileName + extname
    }
    // 업로드
    const result = await s3.upload(uploadParams).promise()

    // gif to mp4
    if (extname === '.gif') {
      const { stdout, stderr } = await exec('dir')
      console.log(stdout, stderr)
      // 리사이징
    } else {
      const image = await jimp.read(filePath)
      const resize = await image.resize(400, jimp.AUTO).write(newFilePath + extname)
    }

    // 삭제
    // fs.unlinkSync(filePath)
    return result.Location
  } catch (error) {
    console.log(error)
  }
}

module.exports = uploadFile
