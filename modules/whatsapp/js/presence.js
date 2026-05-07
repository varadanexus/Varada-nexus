window.startPresence = async function(){

  try{

    const channel =
    window.supabase.channel(
      "whatsapp-presence"
    )

    // ✅ TRACK CURRENT USER
    await channel.subscribe(async status => {

      if(status !== "SUBSCRIBED"){
        return
      }

      console.log(
        "🟢 Presence active"
      )

    })

  }catch(err){

    console.error(err)

  }

}

// ✅ UPDATE CHAT HEADER
window.subscribePresence = function(phone){

  // ✅ REMOVE OLD CHANNEL
  if(window.presenceChannel){

    window.supabase
    .removeChannel(
      window.presenceChannel
    )

  }

  // ✅ CREATE NEW CHANNEL
  const channel =

  window.supabase

  .channel(`presence-${phone}`)

  .on(
    "postgres_changes",
    {
      event:"*",
      schema:"public",
      table:"whatsapp_presence",
      filter:`phone=eq.${phone}`
    },

    payload => {

      const data = payload.new

      const header =
      document.getElementById(
        "chatPresence"
      )

      if(!header){
        return
      }

      if(data.is_typing){

        header.innerHTML =
        "typing..."

      }else if(data.is_online){

        header.innerHTML =
        "online"

      }else{

        header.innerHTML =
        "last seen recently"

      }

    }

  )

  // ✅ SUBSCRIBE LAST
  channel.subscribe()

  // ✅ STORE GLOBALLY
  window.presenceChannel =
  channel

}

window.setTyping = async function(isTyping){

  try{

    if(!window.currentChatPhone){
      return
    }

await window.supabase
.from("whatsapp_presence")
.upsert(

  {

    phone:
      window.currentChatPhone,

    is_typing:
      isTyping,

    updated_at:
      new Date()

  },

  {
    onConflict:"phone"
  }

)

  }catch(err){

    console.error(err)

  }

}
