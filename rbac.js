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

/* ONLY allow transporter pages */
const allowedTransporterPages = [
"transporter-dashboard.html"
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
