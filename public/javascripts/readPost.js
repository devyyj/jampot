/* eslint-disable no-unused-vars */
/* eslint-disable space-before-function-paren */
function likePost(disLike = false) {
  var xhttp = new XMLHttpRequest()
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
