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
const bucketName = 'free-board-image'

async function uploadS3 (fileName, filePath) {
  try {
    var fileStream = fs.createReadStream(filePath)
    fileStream.on('error', function (err) {
      console.log('File Error', err)
    })
    const uploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: fileName
    }
    // s3 업로드
    const result = await s3.upload(uploadParams).promise()
    return result.Location
  } catch (error) {
    console.log(error)
  }
}

async function uploadFile (OriginalName, fileName, filePath) {
  try {
    const prePath = 'uploads/'
    const extname = path.extname(OriginalName)
    const result = {}
    let resizeFileName
    let resizeFilePath
    let video = false
    // gif to mp4
    if (extname === '.gif') {
      resizeFileName = fileName + '.mp4'
      resizeFilePath = prePath + resizeFileName
      await exec(`ffmpeg -i ${filePath} -pix_fmt yuv420p -c:v libx264 -movflags +faststart -filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2' ${resizeFilePath}`)
      video = true
      // image resize
    } else {
      resizeFileName = fileName + '_resize' + extname
      resizeFilePath = prePath + resizeFileName
      const image = await jimp.read(filePath)
      if (image.bitmap.width <= 400) await exec(`ffmpeg -i ${filePath} -vf scale=${image.bitmap.width}:-1 ${resizeFilePath}`)
      else await await exec(`ffmpeg -i ${filePath} -vf scale=400:-1 ${resizeFilePath}`)
    }
    // 이미지 업로드
    result.originalFileURL = await uploadS3(fileName + extname, filePath)
    result.resizeFileURL = await uploadS3(resizeFileName, resizeFilePath)
    result.video = video
    // 삭제
    fs.unlinkSync(filePath)
    fs.unlinkSync(resizeFilePath)

    return result
  } catch (error) {
    console.log(error)
  }
}

async function deleteFile (fileName) {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName
    }
    await s3.deleteObject(params).promise()
  } catch (error) {
    console.log(error)
  }
}

module.exports = { uploadFile, deleteFile }
