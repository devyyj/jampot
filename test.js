const util = require('util')
const exec = util.promisify(require('child_process').exec)

async function test () {
  const s = Date.now()
  const { stdout, stderr } = await exec('ffmpeg -i uploads/test.gif -pix_fmt yuv420p uploads/test4.mp4')
  if (stdout) console.log('stdout : ', stdout)
  if (stderr) console.log('stderr : ', stderr)
  const e = Date.now()
  console.log((e - s) / 1000)
}

test()
