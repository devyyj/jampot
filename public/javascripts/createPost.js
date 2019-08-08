document.getElementById('customFile').addEventListener('change', function (event) {
  const fileName = this.value.split('\\').pop()
  const el = document.getElementById('customFileLabel')
  if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(fileName) === false) {
    el.innerHTML = '사진만 가능합니다.'
    el.classList.add('text-danger')
    this.value = ''
  } else if (this.files[0].size > 18874368) {
    el.innerHTML = '18MB 이하 사진만 가능합니다.'
    el.classList.add('text-danger')
    this.value = ''
  } else {
    el.classList.remove('text-danger')
    el.classList.add('selected')
    el.innerHTML = fileName
  }
})

document.getElementById('createPostForm').addEventListener('submit', function (event) {
  console.log('call')
  const el = document.getElementById('submit')
  const spanEl = document.createElement('span')
  spanEl.classList.add('spinner-border', 'spinner-border-sm')
  spanEl.setAttribute('role', 'status')
  spanEl.setAttribute('aria-hidden', 'true')
  el.setAttribute('disabled', true)
  el.innerHTML = ''
  el.appendChild(spanEl)
})
