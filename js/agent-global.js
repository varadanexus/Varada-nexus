/* 🔥 AGENT GLOBAL FILE */
async function getAgentId(){

  const {data:{session}} = await supabaseClient.auth.getSession()

  if(!session){
    window.location = "/website/login.html"
    return null
  }

  const {data,error} = await supabaseClient
  .from("commission_agents")
  .select("id,name")
  .eq("auth_id", session.user.id)
  .single()

  if(error || !data){
    alert("Agent not found")
    return null
  }

  return data
}
/* ENSURE GLOBAL */
window.logout = async function(){

try{

if(!window.supabaseClient){
alert("System not ready ❌")
return
}

/* ✅ SIGN OUT */
await supabaseClient.auth.signOut()

/* ✅ CLEAR LOCAL STORAGE */
localStorage.clear()
sessionStorage.clear()

/* ✅ REMOVE SUPABASE TOKENS */
Object.keys(localStorage).forEach(key=>{
if(key.includes("supabase")){
localStorage.removeItem(key)
}
})

/* ✅ FORCE REDIRECT */
window.location.replace("/website/login.html")

}catch(err){

console.error("Logout error:", err)
alert("Logout failed ❌")

}

}
