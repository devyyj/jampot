// Example starter JavaScript for disabling form submissions if there are invalid fields
'use strict'
window.addEventListener('load', function () {
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.getElementsByClassName('needs-validation')
  // Loop over them and prevent submission
  Array.prototype.filter.call(forms, function (form) {
    form.addEventListener('submit', function (event) {
      if (form.checkValidity() === false || isSame() === false) {
        event.preventDefault()
        event.stopPropagation()
        if (isSame() === false) document.getElementById('feedback').innerHTML = '비밀번호가 일치하지 않읍니다.'
        else document.getElementById('feedback').innerHTML = ''
      }
      form.classList.add('was-validated')
    }, false)
  })
}, false)

function isSame() {
  if (document.getElementById('pw1').value === document.getElementById('pw2').value) return true
  else return false
}
