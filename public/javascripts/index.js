// eslint-disable-next-line no-unused-vars
function createPost () {
  // value와 getAttribute는 값이 없을 때가 서로 다른것 같다.
  // value는 빈문자열, getAttribute는 null
  if (document.getElementById('createPost').value === '') $('#askLogin').modal('show')
  else window.location.href = '/createPost'
}

// eslint-disable-next-line no-unused-vars
function tableRow (postNumber) {
  window.location.href = '/readPost?postNumber=' + postNumber
}
