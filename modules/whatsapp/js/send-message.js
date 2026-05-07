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

// SEND TO TWILIO
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

const messageSid = waData.sid
  
console.log("WA SEND:", waData)

if(!waRes.ok){
  alert("WhatsApp send failed")
  return
}
  
  // SAVE MESSAGE LOCALLY
await window.supabase
.from("whatsapp_messages")
.insert({
  chat_id: chat.id,
  phone: chat.phone,
  direction: "outbound",
  message,
  message_sid: messageSid,
  status: "sent"
})

  // UPDATE CHAT
  await window.supabase
  .from("whatsapp_chats")
  .update({
    last_message: message,
    last_message_at: new Date()
  })
  .eq("id", chat.id)

  // CLEAR INPUT
  input.value = ""

  // RELOAD CHAT
  openChat(chat.id)

}
