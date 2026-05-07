window.typingTimeout = null

window.handleTyping = function(){

  // ✅ START TYPING
  setTyping(true)

  // ✅ CLEAR OLD TIMER
  clearTimeout(
    window.typingTimeout
  )

  // ✅ AUTO STOP
  window.typingTimeout =
  setTimeout(() => {

    setTyping(false)

  }, 1500)

}
