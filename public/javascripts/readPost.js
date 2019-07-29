var xhttp = new XMLHttpRequest()

// eslint-disable-next-line no-unused-vars
function likePost (disLike = false) {
  console.log('call likePost()')
  let ID
  if (disLike) ID = '#disLike'
  else ID = '#like'

  if ($(ID).data('user') === undefined) {
    window.location.href = '/login'
    return
  }

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      alert(this.response)
    }
  }

  const URL = '/likePost?postNumber=' + $(ID).data('postnumber') + '&disLike=' + disLike
  xhttp.open('GET', URL, true)
  xhttp.send()
}
