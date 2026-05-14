window.loadChats = async function(){

  const { data, error } =
  await window.supabase
  .from("whatsapp_chats")
  .select("*")
  .order("last_message_at", {
    ascending:false
  })

  console.log("CHATS:", data)

  if(error){
    console.error(error)
    return
  }

  // ✅ STORE GLOBALLY
  window.allChats = data || []

  // ✅ RENDER
  renderChats(window.allChats)

}
