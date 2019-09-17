// Load the AWS SDK for Node.js
var AWS = require('aws-sdk')
const proxy = require('proxy-agent')

// Set the region
AWS.config.update({
  region: 'us-west-2'
  // , httpOptions: { agent: proxy('http://210.112.194.110:3128') }
})

const ses = new AWS.SES({ apiVersion: '2010-12-01' })

async function sendMail (to, subject, body) {
  try {
    var params = {
      Destination: { ToAddresses: [to] },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: body
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      },
      Source: 'jampot@jampot.kr'
    }
    await ses.sendEmail(params).promise()
  } catch (error) {
    console.error(error, error.stack)
  }
}

module.exports = sendMail
