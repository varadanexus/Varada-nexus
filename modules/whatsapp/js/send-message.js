window.sendMessage = async function(){

  if(!window.currentChatId) return

  const input =
  document.getElementById("messageInput")

  const message =
  input.value.trim()

  if(!message) return

  // GET CHAT
  const { data: chat } = await window.supabase
  .from("whatsapp_chats")
  .select("*")
  .eq("id", window.currentChatId)
  .single()

  if(!chat) return

  // ✅ SEND TO TWILIO
  const waRes = await fetch(
    "https://ticsgbtxfhhihamejiss.supabase.co/functions/v1/send-custom-whatsapp",
    {
      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        phone: chat.phone,
        message
      })
    }
  )

  const waData = await waRes.json()

  console.log("WA SEND:", waData)

  if(!waRes.ok){

    alert("WhatsApp send failed")

    return

  }

  // ✅ UPDATE CHAT ONLY
  await window.supabase
  .from("whatsapp_chats")
  .update({
    last_message: message,
    last_message_at: new Date()
  })
  .eq("id", chat.id)

  // ✅ CLEAR INPUT
  input.value = ""

  // ✅ STOP TYPING
  setTyping(false)

}