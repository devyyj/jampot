/* eslint-disable no-unused-vars */
/* eslint-disable space-before-function-paren */

// 원본 이미지 버튼 text 설정
const showOrgEl = document.getElementById('original')
if (showOrgEl) {
  const size = (Number(showOrgEl.getAttribute('data-size')) / 1024) / 1024
  if (size) {
    const sizeMsg = ' ' + size.toFixed(1) + ' MB'
    showOrgEl.innerHTML = '원본보기' + sizeMsg
  } else showOrgEl.innerHTML = '원본보기'

  // 원본 이미지 보여주기
  showOrgEl.addEventListener('click', function (event) {
    const resizeEl = document.getElementById('resize')
    resizeEl.remove()

    const orgEl = document.createElement('img')
    orgEl.setAttribute('src', this.value)
    orgEl.setAttribute('style', 'max-width:100%;')

    const parentEl = document.getElementById('file')
    parentEl.insertBefore(orgEl, parentEl.childNodes[0])

    this.remove()
  })
}

// 댓글 삭제
const deleteComment = document.getElementsByClassName('deleteComment')
Array.from(deleteComment).forEach(function (el) {
  el.addEventListener('click', function () {
    if (confirm('리얼루다가 댓글을 삭제하시겠읍니까?')) {
      const postNumber = this.getAttribute('data-postNumber')
      const commentID = this.getAttribute('data-commentID')
      const xhttp = new XMLHttpRequest()
      xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          console.log(this.response)
          if (this.response.writeErrors) alert('댓글 삭제에 실패했습니다.')
          else el.parentElement.parentElement.parentElement.remove()
        }
      }
      const url = '/deleteComment?postNumber=' + postNumber + '&commentID=' + commentID
      xhttp.open('DELETE', url, true)
      xhttp.send()
    }
  })
})

// 댓글 수정
const updateComment = document.getElementsByClassName('updateComment')
Array.from(updateComment).forEach(function (el) {
  el.addEventListener('click', function () {
    // 댓글 입력창 보이기
    const reply = el.parentElement.parentElement.parentElement.getElementsByTagName('form')
    reply[0].classList.remove('d-none')
  })
})

// 댓댓글
