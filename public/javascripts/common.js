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
}
