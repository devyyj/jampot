/* eslint-disable no-unused-vars */
function createPost () {
  // value와 getAttribute는 값이 없을 때가 서로 다른것 같다.
  // value는 빈문자열, getAttribute는 null
  const el = document.getElementById('createPost')
  if (el.value === '') $('#askLogin').modal('show')
  else {
    const baseURL = el.getAttribute('data-baseURL')
    window.location.href = baseURL + '/createPost'
  }
}

function tableRow (postNumber, baseURL) {
  window.location.href = baseURL + '/readPost?postNumber=' + postNumber
}

// 페이지 바로 이동
function goPage (max) {
  const page = document.getElementById('page').value
  if (isNaN(Number(page)) === true || page < 1 || page > max) return alert('올바른 값이 아니에욧!')
  const el = document.getElementById('goPage')
  const baseURL = el.getAttribute('data-baseURL')
  window.location.href = baseURL + '/?page=' + page
}
