window.sendMedia = async function(){

  try{

    if(!window.currentChatId){
      return
    }

    const fileInput =
    document.getElementById("fileInput")

    const file =
    fileInput.files[0]

    if(!file){
      return
    }

    // ✅ GET CHAT
    const { data: chat } =
    await window.supabase
    .from("whatsapp_chats")
    .select("*")
    .eq("id", window.currentChatId)
    .single()

    if(!chat){
      return
    }

    // ✅ READ FILE
    const reader = new FileReader()

    reader.onload = async function(){

      try{

        const base64 =
        reader.result.split(",")[1]

        // ✅ UPLOAD TO DRIVE
        const uploadRes = await fetch(
          "https://ticsgbtxfhhihamejiss.supabase.co/functions/v1/upload-drive",
          {
            method:"POST",

            headers:{
              "Content-Type":"application/json"
            },

            body:JSON.stringify({
              file_base64: base64,
              file_name: file.name,
              trip_no: "WhatsAppMedia"
            })
          }
        )

        const uploadData =
        await uploadRes.json()

        console.log(
          "UPLOAD:",
          uploadData
        )

        if(!uploadRes.ok){
          alert("Upload failed")
          return
        }

        // ✅ SEND WHATSAPP MEDIA
        const waRes = await fetch(
          "https://ticsgbtxfhhihamejiss.supabase.co/functions/v1/send-custom-whatsapp",
          {
            method:"POST",

            headers:{
              "Content-Type":"application/json"
            },

            body:JSON.stringify({
              phone: chat.phone,
              mediaUrl: uploadData.fileUrl
            })
          }
        )

        const waData =
        await waRes.json()

        console.log(
          "MEDIA WA:",
          waData
        )

        if(!waRes.ok){
          alert("WhatsApp send failed")
          return
        }

        // ✅ SAVE MESSAGE
        await window.supabase
        .from("whatsapp_messages")
        .insert({
          chat_id: chat.id,
          phone: chat.phone,
          direction: "outbound",
          message: file.name,
          media_url: uploadData.fileUrl,
          message_sid: waData.sid,
          status: "sent"
        })

        // ✅ UPDATE CHAT
        await window.supabase
        .from("whatsapp_chats")
        .update({
          last_message: `📎 ${file.name}`,
          last_message_at: new Date()
        })
        .eq("id", chat.id)

        // ✅ RESET INPUT
        fileInput.value = ""

        // ✅ RELOAD
        openChat(chat.id)

      }catch(err){

        console.error(err)

        alert(err.message)

      }

    }

    reader.readAsDataURL(file)

  }catch(err){

    console.error(err)

    alert(err.message)

  }

}
