
document.getElementById('customFile').addEventListener('change', function (event) {
  const fileName = this.value.split('\\').pop()
  const el = document.getElementById('customFileLabel')
  if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(fileName) === false) {
    el.innerHTML = '사진만 가능합니다.'
    el.classList.add('text-danger')
    this.value = ''
  } else if (this.files[0].size > 10485760) {
    el.innerHTML = '10MB 이하 사진만 가능합니다.'
    el.classList.add('text-danger')
    this.value = ''
  } else {
    el.classList.remove('text-danger')
    el.classList.add('selected')
    el.innerHTML = fileName
  }
})
