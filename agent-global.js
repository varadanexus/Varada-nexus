/* 🔥 AGENT GLOBAL FILE */

/* ENSURE GLOBAL */
window.logout = async function(){

try{

if(!window.supabaseClient){
alert("System not ready ❌")
return
}

await supabaseClient.auth.signOut()

window.location.href = "login.html"

}catch(err){
console.error("Logout error:", err)
alert("Logout failed ❌")
}

}
