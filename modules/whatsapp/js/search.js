window.allChats = []

window.filterChats = function(){

  const search =
  document
  .getElementById("chatSearch")
  .value
  .toLowerCase()
  .trim()

  const filtered =
  window.allChats.filter(chat => {

    return (

      (chat.name || "")
      .toLowerCase()
      .includes(search)

      ||

      (chat.phone || "")
      .toLowerCase()
      .includes(search)

      ||

      (chat.last_message || "")
      .toLowerCase()
      .includes(search)

    )

  })

  renderChats(filtered)

}

window.renderChats = function(chats){

  const chatList =
  document.getElementById("chatList")

  chatList.innerHTML = ""

  chats.forEach(chat => {

    chatList.innerHTML += `

      <div
        onclick="openChat('${chat.id}')"

        class="
          p-4
          border-b
          cursor-pointer
          hover:bg-gray-100
        "
      >

        <div class="
          flex
          items-center
          justify-between
        ">

          <div class="font-semibold">
            ${chat.name || "Unknown"}
          </div>

          ${
            chat.unread_count > 0

            ? `

              <div class="
                bg-green-600
                text-white
                text-xs
                px-2
                py-1
                rounded-full
              ">
                ${chat.unread_count}
              </div>

            `

            : ""
          }

        </div>

        <div class="
          text-sm
          text-gray-500
          truncate
        ">
          ${chat.last_message || ""}
        </div>

      </div>

    `

  })

}
