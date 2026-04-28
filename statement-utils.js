export async function generateTransporterPDFBlob(invoiceId){

const supabaseClient = window.supabaseClient
  
  const { jsPDF } = window.jspdf

  const { data: inv } = await supabaseClient
  .from("transporter_invoices")
  .select("*")
  .eq("id", invoiceId)
  .single()

  if(!inv){
    throw new Error("Invoice not found")
  }

  const {data:transporter} = await supabaseClient
  .from("transporters")
  .select("transporter_name,gst_number,phone,address")
  .eq("id", inv.transporter_id)
  .single()

  let tripIds = inv.trip_ids.split(",")

  const {data:tripData}=await supabaseClient
  .from("trips")
  .select(`
    trip_no, route, truck, trip_date, weight_kg,
    transporter_rate,
    expenses ( amount )
  `)
  .in("id",tripIds)

  const {data:adjustmentsData} = await supabaseClient
.from("transporter_adjustments")
.select("amount,type,reason,trip_id")
.eq("invoice_id", invoiceId)

/* 🔥 CALCULATIONS (MISSING FIX) */

let totalWeight = 0
let tableRows = []
let totalExpensesAll = 0

let adjustmentRows = []
let totalAdjustment = 0

adjustmentsData?.forEach(a=>{

  if(a.type === "Penalty"){
    totalAdjustment -= Number(a.amount || 0)
  }else{
    totalAdjustment += Number(a.amount || 0)
  }

  adjustmentRows.push([
    a.type,
    (a.type === "Penalty" ? "- Rs. " : "+ Rs. ") + Number(a.amount || 0).toLocaleString("en-IN"),
    a.reason || "-"
  ])
})

tripData?.forEach(t=>{

  let mt = (t.weight_kg || 0) / 1000
  let gross = mt * (t.transporter_rate || 0)

  let exp = (t.expenses || []).reduce(
    (s,e)=>s+(e.amount||0),
    0
  )

  let net = gross - exp

  totalWeight += mt
  totalExpensesAll += exp

  tableRows.push([
    t.trip_no,
    t.route || "-",
    t.truck || "-",
    t.trip_date || "-",
    mt.toFixed(2),
    gross.toLocaleString("en-IN"),
    exp.toLocaleString("en-IN"),
    net.toLocaleString("en-IN")
  ])


/* PDF START */
let doc=new jsPDF()

// 🔷 WATERMARK LOGO
// 🔷 WATERMARK LOGO
if(doc.setGState){
doc.setGState(new doc.GState({opacity: 0.05}))
}
doc.addImage("images/logo.png","PNG",40,80,120,120)

// ✅ RESET IMMEDIATELY AFTER
if(doc.setGState){
doc.setGState(new doc.GState({opacity: 1}))
}

/* 🔥 LOGO (PUT logo.png in same folder) */
doc.addImage("images/logo.png","PNG",15,10,20,20)

/* HEADER */
doc.setFont("helvetica","bold")
doc.setFontSize(14)
doc.text("VARADA NEXUS PRIVATE LIMITED",40,18)

doc.setFont("helvetica","normal")
doc.setFontSize(10)
doc.text("Transporter Payment Statement",40,25)

doc.setFontSize(9)
doc.text("CIN: U43121AP2025PTC117741",40,31)
doc.text("GST: 37AAKCV7495B1ZV",40,36)

// 🔷 VERIFIED BADGE
doc.setTextColor(0,120,0)
doc.setFontSize(10)
doc.text("✔ Digitally Verified", 150, 18)
doc.setTextColor(0,0,0)

/* INVOICE INFO */
/* 🔷 RIGHT SIDE (Invoice Info) */
doc.setFont("helvetica","bold")
doc.text("Invoice No:",140,40)
doc.setFont("helvetica","normal")
doc.text(inv.invoice_no,170,40)

doc.setFont("helvetica","bold")
doc.text("Status:",140,47)
doc.setFont("helvetica","normal")
doc.text(inv.status,170,47)
doc.setFont("helvetica","bold")
doc.text("Date:",140,54)

doc.setFont("helvetica","normal")
doc.text(new Date().toLocaleDateString("en-IN"),170,54)



/* 🔷 LEFT SIDE (Transporter Block) */
let startX = 15
let startY = 55

doc.setFontSize(10)
doc.setFont("helvetica","bold")
doc.text("Transporter Details", startX, startY)

doc.setFont("helvetica","normal")
startY += 8

doc.text("Name:", startX, startY)
doc.text(transporter?.transporter_name || "-", startX + 30, startY)

startY += 6
doc.text("GST:", startX, startY)
doc.text(transporter?.gst_number || "-", startX + 30, startY)

startY += 6
doc.text("Phone:", startX, startY)
doc.text(transporter?.phone || "-", startX + 30, startY)

startY += 6
doc.text("Address:", startX, startY)

startY += 5

let address = transporter?.address || "-"

// 🔥 split into proper lines
let addressLines = doc.splitTextToSize(address, 70)

// 🔥 print clean aligned block
doc.text(addressLines, startX + 30, startY)

// 🔥 move Y properly after full block
startY += addressLines.length * 5

doc.setDrawColor(200)
doc.line(15, startY + 15, 195, startY + 15)
  
/* TABLE HEADER */
startY = startY + 12

doc.autoTable({
startY: startY,
head: [["Trip","Route","Truck","Date","Weight (MT)","Gross","Expenses","Net"]],
body: tableRows,
theme: "grid",

headStyles: {
fillColor: [22, 160, 133],   // teal green
textColor: 255,
fontStyle: "bold"
},

styles: {
fontSize: 8,
cellPadding: 2
},

alternateRowStyles: {
fillColor: [245, 245, 245]
}
})

/* 🔥 ADJUSTMENTS TABLE */
if(adjustmentRows.length){

doc.autoTable({
startY: doc.lastAutoTable.finalY + 3,
head: [["Type","Amount","Reason"]],
body: adjustmentRows,
theme: "grid",

headStyles: {
fillColor: [200, 50, 50],
textColor: 255,
fontStyle: "bold"
},

styles: {
fontSize: 8
}
})

}
    
/* TOTALS */
let summaryY = doc.lastAutoTable.finalY + 6
let summaryEndY = doc.lastAutoTable.finalY 

let tableStartX = 15
let tableEndX = 195
let centerX = (tableStartX + tableEndX) / 2
let stampY = doc.lastAutoTable.finalY - 35
  


doc.autoTable({
startY: summaryY,
margin: { left: 110 },
tableWidth: 85,

head: [["Summary", ""]],
body: [
["Total Weight", totalWeight.toFixed(2) + " MT"],
["Trip Amount", "Rs. " + Number(inv.total_amount - totalAdjustment).toLocaleString("en-IN")],
["Adjustments", "Rs. " + Number(totalAdjustment).toLocaleString("en-IN")],
["Final Amount", "Rs. " + Number(inv.total_amount).toLocaleString("en-IN")],
["Expenses", "Rs. " + Number(totalExpensesAll).toLocaleString("en-IN")],
["Paid", "Rs. " + Number(inv.paid_amount || 0).toLocaleString("en-IN")],
["Balance", "Rs. " + Number(inv.balance_amount).toLocaleString("en-IN")]
],

theme: "grid",

headStyles: {
fillColor: [0, 102, 204],
textColor: 255,
fontStyle: "bold"
},

styles: {
fontSize: 9,
cellPadding: 3
},

columnStyles: {
0: { fontStyle: "bold" },
1: { halign: "right" }
}
})


/* STAMP */
  
if((inv.paid_amount || 0) >= inv.total_amount){

let rectX = 20
let rectW = 90
let rectH = 35

// 🔥 PERFECT GAP CONTROL
let gapBelowBank = 8
let rectY = summaryY + 20

// 🔥 SAFETY: don’t touch footer
let maxY = 270 - rectH - 5   // above signature/footer

if(rectY > maxY){
  rectY = maxY
}

let centerX = rectX + rectW / 2
let centerY = rectY + rectH / 2

doc.setDrawColor(0,150,0)
doc.setTextColor(0,150,0)

doc.setGState(new doc.GState({opacity: 0.25}))

// box
// 🔥 FIXED CENTER ROTATION
doc.setFontSize(28)
doc.setFont("helvetica","bold")

let text = "PAID"

// measure width
let textWidth = doc.getTextWidth(text)

// 🔥 adjust BEFORE rotation
let adjustedX = centerX - (textWidth / 2)
let adjustedY = centerY + 6   // tweak if needed (5–8 range)

// draw rotated text
doc.text(text, adjustedX, adjustedY, {
  angle: 20
})

// reset
doc.setGState(new doc.GState({opacity: 1}))
doc.setTextColor(0,0,0)
}

  
/* FOOTER */
doc.setFont("helvetica","normal")
doc.setFontSize(10)
doc.setFontSize(9)
doc.text("This is a system generated document. No signature required.",15,285)


  return doc.output("blob")
}
