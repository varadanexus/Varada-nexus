/* 🔥 AGENT GLOBAL FILE */
async function getAgentId(){

  const {data:{session}} = await supabaseClient.auth.getSession()

  if(!session){
    window.location = "login.html"
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

await supabaseClient.auth.signOut()

window.location.href = "login.html"

}catch(err){
console.error("Logout error:", err)
alert("Logout failed ❌")
}

}
