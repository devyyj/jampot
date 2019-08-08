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
