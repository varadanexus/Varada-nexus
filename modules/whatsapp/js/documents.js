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

  const {
    data,
    error
  } =
  await window.supabase

  .from("client_invoices")

  .select("*")

  .order("created_at", {
    ascending:false
  })

  console.log(data)

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
            ${doc.client_name || ""}
          </div>

        </div>

        <button
          onclick="
            sendClientInvoice(
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
