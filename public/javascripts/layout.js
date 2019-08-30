/**
 * layout.pug에서 사용하는 js
 * 모든 페이지에서 로드 된다.
 * 각 페이지마다 제이쿼리 스크립트를 load하지 않고
 * layout.pug에서 로드하기 때문에
 * 제이쿼리를 사용하는 함수는 해당 파일에 작성한다.
 */

/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-vars */

window.addEventListener('load', function () {
  highlightUser()
})

// 마스터 아이디 강조
function highlightUser () {
  const object = document.getElementsByClassName('user')
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const element = object[key]
      if (element.innerHTML === '운영자') {
        element.classList.add('badge', 'badge-primary')
        element.setAttribute('style', 'font-size: 12px')
      }
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
    const baseURL = el.getAttribute('data-baseURL')
    const URL = baseURL + '/likePost?postNumber=' + el.value + '&disLike=' + disLike
    xhttp.open('GET', URL, true)
    xhttp.send()
  }
}
