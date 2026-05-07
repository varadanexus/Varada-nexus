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

    alert("Generating invoice...")

    // ✅ GENERATE PDF
    const blobResult =
    await generateInvoiceBlob(
      invoiceId
    )

    let pdfBlob = null

    if(blobResult?.blob){

      pdfBlob = blobResult.blob

    }else{

      pdfBlob = blobResult

    }

    // ✅ BASE64
    const reader =
    new FileReader()

    reader.onload =
    async function(){

      const base64 =
      reader.result.split(",")[1]

      // ✅ UPLOAD
      const uploadRes =
      await fetch(
        "https://ticsgbtxfhhihamejiss.supabase.co/functions/v1/upload-drive",
        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body: JSON.stringify({

            file_base64:
              base64,

            file_name:
              `invoice_${Date.now()}.pdf`,

            trip_no:
              "ClientInvoices"

          })

        }
      )

      const uploadData =
      await uploadRes.json()

      console.log(
        "UPLOAD:",
        uploadData
      )

      // ✅ SEND WHATSAPP
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
              "Invoice Document",

            mediaUrl:
              uploadData.fileUrl

          })

        }
      )

      alert(
        "Invoice sent successfully"
      )

      closeDocumentModal()

    }

    reader.readAsDataURL(
      pdfBlob
    )

  }catch(err){

    console.error(err)

    alert(err.message)

  }

}

// ✅ SEND TRANSPORTER STATEMENT
window.sendTransporterStatement =
async function(invoiceId){

  try{

    alert(
      "Generating statement..."
    )

    // ✅ PDF
    const pdfBlob =
    await generateTransporterPDFBlob(
      invoiceId
    )

    // ✅ BASE64
    const reader =
    new FileReader()

    reader.onload =
    async function(){

      const base64 =
      reader.result.split(",")[1]

      // ✅ UPLOAD
      const uploadRes =
      await fetch(
        "https://ticsgbtxfhhihamejiss.supabase.co/functions/v1/upload-drive",
        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body: JSON.stringify({

            file_base64:
              base64,

            file_name:
              `statement_${Date.now()}.pdf`,

            trip_no:
              "TransporterStatements"

          })

        }
      )

      const uploadData =
      await uploadRes.json()

      // ✅ SEND WA
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
              "Transporter Statement",

            mediaUrl:
              uploadData.fileUrl

          })

        }
      )

      alert(
        "Statement sent successfully"
      )

      closeDocumentModal()

    }

    reader.readAsDataURL(
      pdfBlob
    )

  }catch(err){

    console.error(err)

    alert(err.message)

  }

}
