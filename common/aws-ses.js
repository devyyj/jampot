// Load the AWS SDK for Node.js
var AWS = require('aws-sdk')
// Set the region
AWS.config.update({ region: 'us-west-2' })

// Create sendEmail params
var params = {
  Destination: { /* required */
    // CcAddresses: [
    //   'EMAIL_ADDRESS',
    //   /* more items */
    // ],
    ToAddresses: [
      'devyyj@gmail.com',
      /* more items */
    ]
  },
  Message: { /* required */
    Body: { /* required */
      // Html: {
      //   Charset: 'UTF-8',
      //   Data: 'HTML_FORMAT_BODY'
      // },
      Text: {
        Charset: 'UTF-8',
        Data: 'Test email body'
      }
    },
    Subject: {
      Charset: 'UTF-8',
      Data: 'Test email'
    }
  },
  Source: 'jampot@jampot.kr', /* required */
  // ReplyToAddresses: [
  //   'EMAIL_ADDRESS',
  //   /* more items */
  // ],
}

// Create the promise and SES service object
var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise()

// Handle promise's fulfilled/rejected states
// sendPromise.then(
//   function (data) {
//     console.log(data.MessageId)
//   }).catch(function (err) {
//     console.error(err, err.stack)
//   })

module.exports = sendPromise
