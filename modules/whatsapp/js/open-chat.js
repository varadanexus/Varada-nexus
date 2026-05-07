window.openChat = async function(chatId){

  window.currentChatId = chatId

  const { data: chat } = await window.supabase
  .from("whatsapp_chats")
  .select("*")
  .eq("id", chatId)
  .single()

  if(!chat) return

  // HEADER
  document.getElementById("chatHeader")
  .innerHTML = `
    <div>
      <div class="font-semibold">
        ${chat.name || "Unknown"}
      </div>

      <div class="text-sm text-gray-500">
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

      <a
        href="${msg.media_url}"
        target="_blank"
        class="
          flex
          items-center
          gap-3
          bg-white/20
          p-3
          rounded-lg
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
            Click to open
          </div>

        </div>

      </a>

    `

    // IMAGE
    : `

      <img
        src="${msg.media_url}"
        class="
          rounded-lg
          max-w-[250px]
          cursor-pointer
        "
      >

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
