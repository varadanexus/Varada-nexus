window.openChat = async function(chatId){

  window.currentChatId = chatId

hideSidebar()
  
  const { data: chat } = await window.supabase
  .from("whatsapp_chats")
  .select("*")
  .eq("id", chatId)
  .single()

  if(!chat) return
  window.currentChatPhone =
chat.phone
  subscribePresence(chat.phone)
  
  // HEADER
  document.getElementById("chatHeader")
  .innerHTML = `
    <div>
      <div class="font-semibold">
        ${chat.name || "Unknown"}
      </div>

<div
  id="chatPresence"
  class="text-sm text-gray-500"
>
  ${chat.phone}
</div>

    </div>
  `

  // LOAD MESSAGES
  const { data: messages } = await window.supabase
  .from("whatsapp_messages")
  .select("*")
  .eq("chat_id", chatId)
  .order("created_at", {
    ascending:true
  })

  const messagesDiv =
  document.getElementById("messages")

  messagesDiv.innerHTML = ""

  messages.forEach(msg => {

    const isOutbound =
    msg.direction === "outbound"

    messagesDiv.innerHTML += `

      <div class="flex ${
        isOutbound
        ? "justify-end"
        : "justify-start"
      }">

        <div class="
          max-w-[70%]
          px-4
          py-2
          rounded-xl
          ${
            isOutbound
            ? "bg-green-500 text-white"
            : "bg-white"
          }
        ">

${
  msg.media_url

  ? msg.message.toLowerCase().endsWith(".pdf")

    // PDF CARD
    ? `

<div
  onclick="
    openPdfModal(
      '${msg.media_url}'
    )
  "

  class="
    flex
    items-center
    gap-3
    bg-white/20
    p-3
    rounded-lg
    cursor-pointer
    hover:bg-white/30
    transition
  "
>

  <div class="text-3xl">
    📄
  </div>

  <div>

    <div class="font-semibold">
      PDF Document
    </div>

    <div class="text-xs opacity-70">
      Click to preview
    </div>

  </div>

</div>

    `

// IMAGE
: `

${
  msg.direction === "inbound"

  ? `

<div
  onclick="
    window.open(
      '${msg.media_url}',
      '_blank'
    )
  "

  class="
    bg-gray-200
    text-black
    px-4
    py-3
    rounded-lg
    cursor-pointer
    hover:bg-gray-300
    transition
  "
>

  📎 Incoming Image

</div>

  `

  : `

<img
  src="${msg.media_url}"

  onclick="
    openImageModal(
      '${msg.media_url}'
    )
  "

  class="
    rounded-lg
    max-w-[250px]
    cursor-pointer
    hover:opacity-90
    transition
  "
>

  `
}
`

  // NORMAL TEXT
  : `

    <div class="text-sm">

      ${msg.message}

    </div>

  `
}

<div class="
  text-[11px]
  mt-1
  opacity-70
  text-right
">

  ${
    msg.status === "read"
    ? "Read"

    : msg.status === "delivered"
    ? "✓✓ Delivered"

    : msg.status === "sent"
    ? "✓ Sent"

    : msg.status === "queued"
    ? "Sending"

    : msg.status === "failed"
    ? "❌ Failed"

    : ""
  }

</div>

        </div>

      </div>

    `

  })

  // SCROLL BOTTOM
  messagesDiv.scrollTop =
  messagesDiv.scrollHeight

}
