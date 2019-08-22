/* eslint-disable no-unused-vars */
// 연속적인 클릭 방지
// getElementById와 getElementsByClassName인 경우를 구분함
function preventSuccessiveClick (formID, submitID, className = false) {
  if (className) {
    const form = document.getElementsByClassName(formID)
    Array.from(form).forEach(element => {
      element.addEventListener('submit', function (event) {
        const el = document.getElementsByClassName(submitID)
        Array.from(el).forEach(element => {
          const spanEl = document.createElement('span')
          spanEl.classList.add('spinner-border', 'spinner-border-sm')
          spanEl.setAttribute('role', 'status')
          spanEl.setAttribute('aria-hidden', 'true')
          element.setAttribute('disabled', true)
          element.innerHTML = ''
          element.appendChild(spanEl)
        })
      })
    })
  } else {
    document.getElementById(formID).addEventListener('submit', function (event) {
      const el = document.getElementById(submitID)
      const spanEl = document.createElement('span')
      spanEl.classList.add('spinner-border', 'spinner-border-sm')
      spanEl.setAttribute('role', 'status')
      spanEl.setAttribute('aria-hidden', 'true')
      el.setAttribute('disabled', true)
      el.innerHTML = ''
      el.appendChild(spanEl)
    })
  }
}
