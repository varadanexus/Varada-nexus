window.sendTripUpdate = async function(){

  alert(
    "Next step:\nConnect trip selection modal"
  )

}

window.sendPaymentReminder = async function(){

  alert(
    "Next step:\nConnect payment reminder flow"
  )

}

// ✅ SEND STATEMENT
window.sendStatement = async function(){

  try{

    if(!window.currentChatPhone){

      alert("Open a chat first")

      return

    }

    // ✅ LOADING
    alert(
      "Generating statement..."
    )

    // ✅ FETCH PDF FROM LEDGER
    const pdfWindow =
    window.open(

      `/client-ledger.html?phone=${window.currentChatPhone}&autoPdf=true`,

      "_blank"
    )

  }catch(err){

    console.error(err)

    alert(err.message)

  }

}
