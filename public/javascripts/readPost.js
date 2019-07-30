var xhttp = new XMLHttpRequest()

// eslint-disable-next-line no-unused-vars
function likePost(disLike = false) {
  console.log('call likePost()')
  let ID
  if (disLike) ID = 'disLike'
  else ID = 'like'
  const el = document.getElementById(ID)
  if (el.getAttribute('data-user') === null) {
    $('#askLogin').modal('show')
  } else {
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        alert(this.response)
      }
    }
    const URL = '/likePost?postNumber=' + el.value + '&disLike=' + disLike
    xhttp.open('GET', URL, true)
    xhttp.send()
  }
}
