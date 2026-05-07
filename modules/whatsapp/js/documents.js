window.openDocumentModal = function(){

  document
  .getElementById("documentModal")
  .classList
  .remove("hidden")

}

window.closeDocumentModal = function(){

  document
  .getElementById("documentModal")
  .classList
  .add("hidden")

}

// ✅ CLIENT INVOICES
window.loadClientDocuments =
async function(){

  // ✅ NON GST
  const {
    data:nonGst
  } =
  await window.supabase

  .from("client_invoices")

  .select("*")

  // ✅ GST
  const {
    data:gst
  } =
  await window.supabase

  .from("client_invoices_gst")

  .select("*")

  // ✅ ADD TYPE
  const nonGstDocs =
  (nonGst || []).map(doc => ({
    ...doc,
    invoice_type:"NON_GST"
  }))

  const gstDocs =
  (gst || []).map(doc => ({
    ...doc,
    invoice_type:"GST"
  }))

  // ✅ MERGE
  const allDocs = [

    ...gstDocs,
    ...nonGstDocs

  ]

  // ✅ SORT LATEST FIRST
  allDocs.sort((a,b)=>{

    return new Date(
      b.created_at
    ) - new Date(
      a.created_at
    )

  })

  const list =
  document.getElementById(
    "documentList"
  )

  list.innerHTML = ""

  allDocs.forEach(doc => {

    list.innerHTML += `

      <div class="
        border
        rounded-xl
        p-4
        flex
        justify-between
        items-center
      ">

        <div>

          <div class="
            font-semibold
            flex
            items-center
            gap-2
          ">

            ${doc.invoice_no}

            <span class="
              text-xs
              px-2
              py-1
              rounded-full
              ${
                doc.invoice_type === "GST"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
              }
            ">

              ${
                doc.invoice_type === "GST"
                ? "GST"
                : "NON GST"
              }

            </span>

          </div>

          <div class="
            text-sm
            text-gray-500
          ">
            ${doc.client_name || ""}
          </div>

        </div>

        <button
          onclick="
            sendClientInvoice(
              '${doc.id}',
              '${doc.invoice_type}'
            )
          "

          class="
            bg-green-600
            text-white
            px-4
            py-2
            rounded-lg
          "
        >
          Send
        </button>

      </div>

    `

  })

}

// ✅ CONTRACTOR STATEMENTS
window.loadContractorDocuments =
async function(){

  const {
    data,
    error
  } =
  await window.supabase

  .from("transporter_invoices")

  .select("*")

  .order("created_at", {
    ascending:false
  })

  const list =
  document.getElementById(
    "documentList"
  )

  list.innerHTML = ""

  data.forEach(doc => {

    list.innerHTML += `

      <div class="
        border
        rounded-xl
        p-4
        flex
        justify-between
        items-center
      ">

        <div>

          <div class="font-semibold">
            ${doc.invoice_no}
          </div>

          <div class="
            text-sm
            text-gray-500
          ">
            ${doc.transporter_name || ""}
          </div>

        </div>

        <button
          onclick="
            sendTransporterStatement(
              '${doc.id}'
            )
          "

          class="
            bg-green-600
            text-white
            px-4
            py-2
            rounded-lg
          "
        >
          Send
        </button>

      </div>

    `

  })

}


// ✅ SEND CLIENT INVOICE
window.sendClientInvoice =
async function(
  invoiceId,
  invoiceType
){

  try{

    let tableName = ""

    // ✅ GST
    if(invoiceType === "GST"){

      tableName =
      "client_invoices_gst"

    }

    // ✅ NON GST
    else{

      tableName =
      "client_invoices"

    }

    // ✅ FETCH DOCUMENT
    const {
      data:doc,
      error
    } =
    await window.supabase

    .from(tableName)

    .select("*")

    .eq("id", invoiceId)

    .single()

    if(error){
      throw error
    }

    if(!doc?.drive_link){

      alert(
        "Drive link missing"
      )

      return

    }

    // ✅ SEND WHATSAPP
    const waRes =
    await fetch(

      "https://ticsgbtxfhhihamejiss.supabase.co/functions/v1/send-custom-whatsapp",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body: JSON.stringify({

          phone:
            window.currentChatPhone,

          message:
            doc.invoice_no ||

            "Invoice",

          mediaUrl:
            doc.drive_link

        })

      }

    )

    const waData =
    await waRes.json()

    console.log(
      "WA:",
      waData
    )

    if(!waRes.ok){

      throw new Error(
        waData.error ||
        "WhatsApp failed"
      )

    }

    alert(
      "Invoice sent successfully"
    )

    closeDocumentModal()

  }catch(err){

    console.error(err)

    alert(err.message)

  }

}

// ✅ SEND TRANSPORTER STATEMENT
window.sendTransporterStatement =
async function(invoiceId){

  try{

    // ✅ FETCH STATEMENT
    const {
      data:doc,
      error
    } =
    await window.supabase

    .from("transporter_invoices")

    .select("*")

    .eq("id", invoiceId)

    .single()

    if(error){
      throw error
    }

    if(!doc?.drive_link){

      alert(
        "Drive link missing"
      )

      return

    }

    // ✅ SEND WA
    const waRes =
    await fetch(

      "https://ticsgbtxfhhihamejiss.supabase.co/functions/v1/send-custom-whatsapp",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body: JSON.stringify({

          phone:
            window.currentChatPhone,

          message:
            doc.invoice_no ||

            "Statement",

          mediaUrl:
            doc.drive_link

        })

      }

    )

    const waData =
    await waRes.json()

    console.log(
      "WA:",
      waData
    )

    if(!waRes.ok){

      throw new Error(
        waData.error ||
        "WhatsApp failed"
      )

    }

    alert(
      "Statement sent successfully"
    )

    closeDocumentModal()

  }catch(err){

    console.error(err)

    alert(err.message)

  }

}
