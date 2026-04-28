export async function generateTransporterPDFBlob(invoiceId, supabaseClient){

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

  let doc = new jsPDF()

  // 🔥 👉 PASTE YOUR FULL PDF DESIGN CODE HERE
  // (everything from old downloadInvoice except upload/download)

  return doc.output("blob")
}
