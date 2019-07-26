var xhttp = new XMLHttpRequest()

$('#like').click(function () {
  if ($('#like').data('vote')) return alert("이미 '추천 또는 반대' 하셨읍니다.")
  likePost()
})

$('#disLike').click(function () {
  if ($('#disLike').data('vote')) return alert("이미 '추천 또는 반대' 하셨읍니다.")
  likePost(true)
})

function likePost(disLike = false) {
  console.log('call likePost()')
  let ID
  if (disLike) ID = '#disLike'
  else ID = '#like'

  if ($(ID).data('user') === undefined) {
    window.location.href = '/login'
    return
  }

  const URL = '/likePost?postNumber=' + $(ID).data('postnumber') + '&disLike=' + disLike
  xhttp.open('GET', URL, true)
  xhttp.send()

  $('#disLike').prop('disabled', true)
  $('#like').prop('disabled', true)
}