/* eslint-disable no-unused-vars */
/* eslint-disable space-before-function-paren */

window.addEventListener('load', function () {
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
            else window.location.reload()
          }
        }
        const url = '/deleteComment?postNumber=' + postNumber + '&commentID=' + commentID
        xhttp.open('GET', url, true)
        xhttp.send()
      }
    })
  })

  // 댓글 수정
  const updateComment = document.getElementsByClassName('updateComment')
  Array.from(updateComment).forEach(function (el) {
    el.addEventListener('click', function () {
      const reply = el.parentElement.parentElement.parentElement.parentElement.getElementsByClassName('updateCommentForm')
      // 댓글 수정창 보이기
      reply[0].classList.remove('d-none')
    })
  })

  // 댓댓글
  const replyComment = document.getElementsByClassName('replyComment')
  Array.from(replyComment).forEach(function (el) {
    el.addEventListener('click', function () {
      const reply = el.parentElement.parentElement.parentElement.parentElement.getElementsByClassName('replyCommentForm')
      // 댓댓글 입력창 보이기
      reply[0].classList.remove('d-none')
    })
  })

  // 댓댓글 삭제
  const deleteReply = document.getElementsByClassName('deleteReply')
  Array.from(deleteReply).forEach(function (el) {
    el.addEventListener('click', function () {
      if (confirm('리얼루다가 댓글을 삭제하시겠읍니까?')) {
        const postNumber = this.getAttribute('data-postNumber')
        const commentID = this.getAttribute('data-commentID')
        const replyID = this.getAttribute('data-replyID')
        const xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            console.log(this.response)
            if (this.response.writeErrors) alert('댓글 삭제에 실패했습니다.')
            else window.location.reload()
          }
        }
        const url = '/deleteReply?postNumber=' + postNumber + '&commentID=' + commentID + '&replyID=' + replyID
        xhttp.open('GET', url, true)
        xhttp.send()
      }
    })
  })

  // 댓댓글 수정
  const updateReply = document.getElementsByClassName('updateReply')
  Array.from(updateReply).forEach(function (el) {
    el.addEventListener('click', function () {
      const reply = el.parentElement.parentElement.parentElement.parentElement.nextSibling
      // 댓글 수정창 보이기
      reply.classList.remove('d-none')
    })
  })

  // 등록 버튼 여러번 눌러서 댓글 중복으로 써지는 버그 방지
  // eslint-disable-next-line no-undef
  preventSuccessiveClick('createComment', 'submitComment')
  // eslint-disable-next-line no-undef
  preventSuccessiveClick('createReply', 'submitReply', true)
})
