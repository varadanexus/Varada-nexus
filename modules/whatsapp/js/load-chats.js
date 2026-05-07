window.loadChats = async function(){

  const { data, error } = await window.supabase
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

  const chatList =
  document.getElementById("chatList")

  chatList.innerHTML = ""

  data.forEach(chat => {

    chatList.innerHTML += `

      <div
        onclick="openChat('${chat.id}')"
        class="p-4 border-b cursor-pointer hover:bg-gray-100"
      >

        <div class="font-semibold">
          ${chat.name || "Unknown"}
        </div>

        <div class="text-sm text-gray-500">
          ${chat.last_message || ""}
        </div>

      </div>

    `

  })

}
