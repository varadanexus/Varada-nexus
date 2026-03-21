/* ============================= */
/* 🔐 GLOBAL RBAC SYSTEM */
/* ============================= */

async function getCurrentUser(){

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session) return null

const {data:user} = await supabaseClient
.from("users")
.select("id")
.eq("auth_id",session.user.id)
.single()

return user || null
}

/* ============================= */
/* 🔐 GET USER ROLES */
/* ============================= */

async function getUserRoles(userId){

const {data:userRoles} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",userId)

if(!userRoles) return []

return userRoles.map(r=>r.role_id)
}

/* ============================= */
/* 🔐 CHECK PERMISSION */
/* ============================= */

async function checkPermission(page, action){

try{

const user = await getCurrentUser()
if(!user) return false

const roleIds = await getUserRoles(user.id)
if(roleIds.length===0) return false

const {data:perm} = await supabaseClient
.from("role_permissions")
.select("*")
.in("role_id",roleIds)
.eq("page_name",page)
.eq("action_name",action)
.eq("can_access",true)

return perm && perm.length > 0

}catch(err){
console.log("Permission Error:",err)
return false
}

}

/* ============================= */
/* 🔐 PAGE ACCESS (VIEW CONTROL) */
/* ============================= */

async function enforceRBAC(){

try{

const page = window.location.pathname.split("/").pop()

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session){
window.location.href="login.html"
return
}

const user = await getCurrentUser()

if(!user){
window.location.href="login.html"
return
}

const roleIds = await getUserRoles(user.id)

if(roleIds.length===0){
window.location.href="dashboard.html"
return
}

/* 🔥 GET ROLE NAMES */
const {data:rolesData} = await supabaseClient
.from("roles")
.select("role_name")
.in("id", roleIds)

let roleNames = (rolesData || []).map(r=>r.role_name.toLowerCase())

const isTransporter = roleNames.some(r =>
r.includes("customer") || r.includes("transporter")
)

/* ============================= */
/* 🚀 TRANSPORTER PORTAL LOGIC */
/* ============================= */

if(isTransporter){

/* ✅ ONLY transporter allowed pages */
const allowedTransporterPages = [
"transporter-dashboard.html",
"transporter-trips.html",
"transporter-ledger.html",
"transporter-profit.html"
]
if(!allowedTransporterPages.includes(page)){
window.location.href = "transporter-dashboard.html"
}

return
}

/* ============================= */
/* 🔐 STAFF RBAC (UNCHANGED) */
/* ============================= */

const canView = await checkPermission(page,"view")

if(!canView){
alert("Access Denied")
window.location.href="dashboard.html"
return
}

}catch(err){
console.log("RBAC ERROR:",err)
window.location.href="dashboard.html"
}

}

/* ============================= */
/* 🚀 AUTO RUN */
/* ============================= */

window.addEventListener("DOMContentLoaded", enforceRBAC)
