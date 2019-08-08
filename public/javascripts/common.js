/* eslint-disable no-unused-vars */
window.onload = function () {
  // 마스터 아이디 강조
  const object = document.getElementsByClassName('user')
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const element = object[key]
      if (element.innerHTML === '운영자') {
        element.classList.add('badge', 'badge-info')
        element.setAttribute('style', 'font-size: 12px;')
      }
    }
  }

  // 좋아요 기능
  function likePost (disLike = false) {
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
}
