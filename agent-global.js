/* 🔥 AGENT GLOBAL FILE */

/* LOGOUT (WORKS EVERYWHERE) */
window.logout = async function(){

if(!window.supabaseClient){
console.error("Supabase not initialized")
return
}

await supabaseClient.auth.signOut()

window.location.href = "login.html"

}
