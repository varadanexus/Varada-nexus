/* ===========================
   HARD PAGE RBAC (FINAL FIX)
=========================== */

async function enforcePageAccess(){

const page = window.location.pathname.split("/").pop()

try{

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session){
window.location.replace("login.html")
return false
}

const authId = session.user.id

const {data:user} = await supabaseClient
.from("users")
.select("id")
.eq("auth_id",authId)
.single()

if(!user){
window.location.replace("login.html")
return false
}

const {data:userRoles} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)

if(!userRoles || userRoles.length===0){
window.location.replace("dashboard.html")
return false
}

let roleIds = userRoles.map(r=>r.role_id)

const {data:permissions} = await supabaseClient
.from("role_permissions")
.select("page_name")
.in("role_id",roleIds)
.eq("can_access",true)

let allowedPages = (permissions || []).map(p=>p.page_name.trim())

console.log("PAGE:",page)
console.log("ALLOWED:",allowedPages)

/* 🚨 FINAL BLOCK */
if(!allowedPages.includes(page)){
window.location.replace("dashboard.html")
return false
}

return true

}catch(err){

console.log("RBAC ERROR:",err)
window.location.replace("dashboard.html")
return false

}

}
