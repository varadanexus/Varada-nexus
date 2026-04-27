

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
const { jsPDF } = window.jspdf
let doc = new jsPDF()


/* 🔥 GET CREDIT NOTES */
const { data:creditNotes } = await supabaseClient
.from("gst_credit_notes")
.select("*")
.eq("invoice_id", invoiceId)

let totalCredit = 0
creditNotes?.forEach(c=>{
    totalCredit += Number(c.amount || 0)
})


/* 3️⃣ BUILD TABLE */
let rows = []

bd.forEach(t=>{
rows.push([
t.trip_no,
t.truck_no || "-",   // ✅ NEW COLUMN
Number(t.contract_value || 0).toFixed(2),
Number(t.freight_cost || 0).toFixed(2),
Number(t.margin || 0).toFixed(2),
Number(t.gst || 0).toFixed(2)
])
})


/* 🔷 WATERMARK */
doc.setGState(new doc.GState({opacity:0.05}))
try{
doc.addImage("images/logo.png","PNG",40,80,120,120)
}catch(e){}
doc.setGState(new doc.GState({opacity:1}))

/* 🔷 LOGO */
try{
doc.addImage("images/logo.png","PNG",15,14,25,18)
}catch(e){}

/* 🔷 HEADER */
doc.setFont("helvetica","bold")
doc.setFontSize(14)
doc.text("VARADA NEXUS PRIVATE LIMITED",45,18)
  
doc.setFont("helvetica","normal")
doc.setFontSize(8)
doc.text("GST: 37AAKCV7495B1ZV",45,22)
doc.text("Address: 80-17-28, K B Nagar, A V A Road,",45,25)
doc.text("Rajahmundry, Andhra Pradesh - 533101",45,28)
doc.text("CIN: U43121AP2025PTC117741",45,31)

/* 🔷 VERIFIED TAG */
doc.setTextColor(0,120,0)
doc.text("✔ Digitally Verified",150,18)
doc.setTextColor(0,0,0)

/* 🔥 BIG GST INVOICE TITLE (RIGHT SIDE) */
doc.setFont("helvetica","bold")
doc.setFontSize(16)
doc.text("GST INVOICE",180,30,{ align: "right" })

/* 🔷 INVOICE INFO */
doc.setFontSize(10)
doc.text("Invoice No: " + inv.invoice_no,140,40)
doc.text("Date: " + new Date(inv.created_at).toLocaleDateString("en-IN"),140,47)


/* 🔷 CLIENT BLOCK */
doc.setFont("helvetica","bold")
doc.text("Client Details",15,55)

doc.setFont("helvetica","normal")
/* GET CLIENT DETAILS */
const { data:client } = await supabaseClient
.from("clients")
.select("*")
.eq("company", inv.client_name)
.single()

let invoiceType = client?.gst_no ? "B2B" : "B2C"

doc.text("Name: " + inv.client_name,15,63)

let address = "Address: " + (client?.address || "N/A")

let splitAddress = doc.splitTextToSize(address, 110)  // 👈 controls width

doc.text(splitAddress, 15, 70)

let addressHeight = splitAddress.length * 5

/* 🔥 GST EXACT POSITION */
let gstY = 70 + addressHeight + 3
doc.text("GSTIN: " + (inv.gst_no || "N/A"), 15, gstY)

/* 🔥 LINE JUST BELOW GST */
let lineY = gstY + 6
doc.line(15, lineY, 195, lineY)

doc.text("Place of Supply: Andhra Pradesh",140,55)
doc.text("State Code: 37",140,62)
doc.text("Invoice Type: " + invoiceType,140,69)
  
/* 🔷 TABLE */
doc.autoTable({
startY:95,
head:[["Trip","Truck","Contract","Freight","Service Charges","GST"]],
body:rows,
theme:"grid",
headStyles:{ fillColor:[0,102,204], textColor:255 },
styles:{ fontSize:9 }
})

/* 🔷 SUMMARY BOX */
let cgst = inv.gst_total / 2
let sgst = inv.gst_total / 2

let serviceCharges = Number(inv.total_margin || 0)

let subtotalTaxable = serviceCharges + cgst + sgst

let freightCharges = Number(inv.total_freight || 0)   // pure agent

let grossInvoiceValue = subtotalTaxable + freightCharges

let totalInvoiceValue = grossInvoiceValue - totalCredit

let summaryStartY = doc.lastAutoTable.finalY + 10

doc.autoTable({
startY: summaryStartY,
margin:{left:110},
tableWidth:85,
head:[["Tax Summary",""]],
body:[

["Logistics Coordination Charges", serviceCharges.toFixed(2)],
["CGST (" + (inv.gst_percent/2).toFixed(1) + "%)", cgst.toFixed(2)],
["SGST (" + (inv.gst_percent/2).toFixed(1) + "%)", sgst.toFixed(2)],
["Subtotal (Taxable)", subtotalTaxable.toFixed(2)],
["Freight Charges (No GST - Pure Agent)", freightCharges.toFixed(2)],

[{content:"Total Invoice Value", styles:{fontStyle:'bold'}},
 {content: grossInvoiceValue.toFixed(2), styles:{fontStyle:'bold'}}],

...(totalCredit > 0 ? [
["(-) Credit Notes", totalCredit.toFixed(2)],
[{content:"Net Payable", styles:{fontStyle:'bold'}},
 {content: totalInvoiceValue.toFixed(2), styles:{fontStyle:'bold'}}]
] : [])

],
theme:"grid",
headStyles:{ fillColor:[0,102,204], textColor:255 }
})

/* ✅ STORE THIS */
let taxSummaryEndY = doc.lastAutoTable.finalY

/* 🔥 CREDIT NOTE DETAILS TABLE */
/* 🔥 CREDIT NOTE DETAILS TABLE */
let creditEndY = 0   // ✅ ADD HERE (BEFORE IF)

if(creditNotes && creditNotes.length > 0){

doc.autoTable({
    startY: taxSummaryEndY + 5,
    margin:{left:110},
    tableWidth:85,
    head:[["Credit Notes",""]],
    body: creditNotes.map(c => [
        `${c.credit_note_no} (${c.reason || "Adjustment"})`,
        Number(c.amount).toFixed(2)
    ]),
    theme:"grid",
    styles:{ fontSize:8 },
    headStyles:{ fillColor:[200,0,0], textColor:255 }
})

creditEndY = doc.lastAutoTable.finalY   // ✅ MOVE INSIDE IF
}


  
/* 🔷 BANK BOX */
doc.autoTable({
    startY: summaryStartY,   // ✅ same top alignment
    margin: { left: 15 },
    tableWidth: 90,
    head: [["Bank Details",""]],
    body: [
        ["Bank", "Axis Bank"],
        ["A/C No", "924020062188598"],
        ["IFSC", "UTIB0000107"],
        ["Branch", "Rajahmundry, AP"]
    ],
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0,102,204], textColor: 255 }
})

/* OPTIONAL if bank is taller */
let bankEndY = doc.lastAutoTable.finalY

/* 🔷 LEGAL DECLARATION (EXACT TEXT) */
let legalY = Math.max(taxSummaryEndY, bankEndY) + 8

doc.setFont("helvetica","bold")
doc.setFontSize(9)
doc.setTextColor(0,0,0)
doc.text("Legal Declaration:", 15, legalY)

doc.setFont("helvetica","normal")
doc.setFontSize(7)
doc.setTextColor(120,120,120)   // 🔥 grey fine print

let legalText = `Varada Nexus Private Limited is engaged solely in providing logistics execution and coordination services on a sub-contract basis. The company does not act as a Goods Transport Agency (GTA) and does not issue consignment notes.

Freight charges are incurred by us as a Pure Agent of the client under Rule 33 of CGST Rules, 2017. These are recovered at actuals without any markup and are excluded from the value of supply for GST purposes.

Accordingly, only the net consideration retained as service charges constitutes the value of taxable supply under GST.

All supporting documents for such expenses are available and can be provided upon request.

This is a system generated GST invoice.

Thank you for doing business with Varada Nexus.`

let splitLegal = doc.splitTextToSize(legalText, 90)

doc.text(splitLegal, 15, legalY + 5, {
    lineHeightFactor: 1.3
})

/* 🔷 SIGNATURE */
let signY = Math.max(
    creditEndY || 0,
    taxSummaryEndY || 0,
    bankEndY || 0
) + 35

/* 🔷 SIGNATURE IMAGE */
try{
doc.addImage("images/signature.png","PNG",136,signY-13,40,15)
}catch(e){}

/* 🔷 STAMP IMAGE (OVERLAP EFFECT) */
try{
doc.addImage("images/stamp.png","PNG",165,signY-20,30,30)
}catch(e){}

/* 🔷 LINE */
doc.line(130, signY, 195, signY)

/* 🔷 TEXT */
doc.setFontSize(9)
doc.text("Authorized Signatory", 162, signY + 5, { align: "center" })


/* 🔥 RETURN BLOB */
return doc.output("bloburl")

    
}


/* DOWNLOAD FUNCTION */
async function generatePDF(invoiceId){

const blobUrl = await generateInvoiceBlob(invoiceId)

let a = document.createElement("a")
a.href = blobUrl
a.download = "Invoice.pdf"
a.click()

}
