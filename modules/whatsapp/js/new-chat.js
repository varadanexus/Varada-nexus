window.openNewChatModal = function(){

  document
  .getElementById("newChatModal")
  .classList
  .remove("hidden")

}

window.closeNewChatModal = function(){

  document
  .getElementById("newChatModal")
  .classList
  .add("hidden")

}

window.createNewChat = async function(){

  try{

    const name =
    document
    .getElementById("newChatName")
    .value
    .trim()

    let phone =
    document
    .getElementById("newChatPhone")
    .value
    .trim()

    if(!phone){
      alert("Phone required")
      return
    }

    // ✅ NORMALIZE
    phone = phone.replace(/\D/g,'')

    if(!phone.startsWith("91")){
      phone = "91" + phone
    }

    // ✅ CHECK EXISTING
    const { data: existing } =
    await window.supabase
    .from("whatsapp_chats")
    .select("*")
    .eq("phone", phone)
    .single()

    // ✅ OPEN EXISTING
    if(existing){

      closeNewChatModal()

      openChat(existing.id)

      return
    }

    // ✅ CREATE CHAT
    const {
      data:newChat,
      error
    } =
    await window.supabase
    .from("whatsapp_chats")
    .insert({

      phone,

      name:
        name || phone,

      last_message: "",

      unread_count: 0

    })
    .select()
    .single()

    if(error){
      throw error
    }

    closeNewChatModal()

    loadChats()

    openChat(newChat.id)

  }catch(err){

    console.error(err)

    alert(err.message)

  }

}
