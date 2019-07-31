const path = require('path')
const AWS = require('aws-sdk')
const fs = require('fs')

AWS.config.update({ region: 'ap-northeast-2' });

const s3 = new AWS.S3();

async function uploadFile(OriginalName, fileName, filePath) {
  var fileStream = fs.createReadStream(filePath);
  fileStream.on('error', function (err) {
    console.log('File Error', err);
  });
  
  uploadParams = {
    Bucket: 'free-board-image',
    Body: fileStream,
    Key: fileName + path.extname(OriginalName)
  }
  
  const data = await s3.upload(uploadParams).promise()  
}

module.exports = uploadFile