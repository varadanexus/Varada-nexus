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

    // ✅ OPEN LEDGER PAGE
    const ledgerUrl =

    `/client-ledger.html?phone=${window.currentChatPhone}`

    // ✅ OPEN IN NEW TAB
    window.open(
      ledgerUrl,
      "_blank"
    )

  }catch(err){

    console.error(err)

    alert(err.message)

  }

}
