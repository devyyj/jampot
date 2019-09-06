/**
 * layout.pug에서 사용하는 js
 * 모든 페이지에서 로드 된다.
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
