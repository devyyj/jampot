let countDown
// 카운트 다운 후에 글쓰기 페이지로 이동
setInterval(function () {
  const el = document.getElementById('count')
  if (countDown === undefined) countDown = Number(el.getAttribute('data'))
  if (countDown === 0) return location.reload()
  el.innerText = --countDown
}, 1000)
