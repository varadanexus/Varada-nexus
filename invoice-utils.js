const { jsPDF } = window.jspdf

async function generateInvoiceBlob(invoiceId){

/* 🔥 FETCH DATA */
const { data:inv } = await supabaseClient
.from("client_invoices_gst")
.select("*")
.eq("id", invoiceId)
.single()

const { data:bd } = await supabaseClient
.from("invoice_trip_breakdown_gst")
.select("*")
.eq("invoice_id", invoiceId)

if(!inv){
    alert("Invoice not found")
    return null
}

/* 🔥 CREATE PDF */
let doc = new jsPDF()

/* 🔴 IMPORTANT:
COPY YOUR FULL generatePDF DESIGN CODE HERE
BUT REMOVE doc.save()
*/

/* TEMP TEST VERSION (so it works immediately) */
doc.text("Invoice: " + inv.invoice_no, 20, 20)
doc.text("Client: " + inv.client_name, 20, 30)
doc.text("Amount: ₹" + inv.invoice_amount, 20, 40)

/* 🔥 RETURN BLOB */
let blob = doc.output("blob")
return URL.createObjectURL(blob)
}


/* DOWNLOAD FUNCTION */
async function generatePDF(invoiceId){

const blobUrl = await generateInvoiceBlob(invoiceId)

let a = document.createElement("a")
a.href = blobUrl
a.download = "Invoice.pdf"
a.click()

}
