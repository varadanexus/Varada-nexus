window.startRealtime = function(){

  // ✅ MESSAGE REALTIME
  window.supabase
  .channel("whatsapp-messages")

  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "whatsapp_messages"
    },

    payload => {

      console.log(
        "📩 REALTIME MESSAGE:",
        payload
      )

      // RELOAD CURRENT CHAT
      if(
        window.currentChatId &&
        payload.new?.chat_id ===
        window.currentChatId
      ){
        openChat(window.currentChatId)
      }

      // RELOAD CHAT LIST
      loadChats()

    }
  )

  .subscribe()

  // ✅ CHAT REALTIME
  window.supabase
  .channel("whatsapp-chats")

  .on(
    "postgres_changes",
    {
      event:"*",
      schema:"public",
      table:"whatsapp_chats"
    },

    payload => {

      console.log(
        "💬 REALTIME CHAT:",
        payload
      )

      loadChats()

    }
  )

  .subscribe()

}
