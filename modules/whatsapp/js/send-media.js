window.sendMedia = async function(){

  if(!window.currentChatId) return

  const fileInput =
  document.getElementById("fileInput")

  const file =
  fileInput.files[0]

  if(!file) return

  alert(
    "Media sending setup next step."
  )

}
