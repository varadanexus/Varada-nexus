async function enforceRBAC(){

try{

const page = window.location.pathname.split("/").pop()

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session){
window.location.href="login.html"
return
}

const {data:user} = await supabaseClient
.from("users")
.select("id")
.eq("auth_id",session.user.id)
.single()

if(!user){
window.location.href="login.html"
return
}

const {data:userRoles} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)

if(!userRoles || userRoles.length===0){
window.location.href="dashboard.html"
return
}

let roleIds = userRoles.map(r=>r.role_id)

const {data:permissions} = await supabaseClient
.from("role_permissions")
.select("page_name")
.in("role_id",roleIds)
.eq("can_access",true)

let allowedPages = (permissions || []).map(p=>p.page_name.trim())

if(!allowedPages.includes(page)){
alert("Access Denied")
window.location.href="dashboard.html"
return
}

}catch(err){
console.log("RBAC ERROR:",err)
window.location.href="dashboard.html"
}

}

/* AUTO RUN */
window.addEventListener("DOMContentLoaded", enforceRBAC)
