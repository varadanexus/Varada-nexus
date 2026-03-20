/* ===========================
   GLOBAL PAGE RBAC (FINAL)
=========================== */

async function enforcePageAccess(){

try{

/* GET CURRENT PAGE */
const page = window.location.pathname.split("/").pop()

/* GET SESSION */
const { data:{session}, error:sessionError } = await supabaseClient.auth.getSession()

if(sessionError || !session){
window.location.href="login.html"
return
}

const authId = session.user.id

/* GET USER */
const {data:user, error:userError} = await supabaseClient
.from("users")
.select("id")
.eq("auth_id",authId)
.single()

if(userError || !user){
window.location.href="login.html"
return
}

/* GET ROLES */
const {data:userRoles, error:roleError} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)

if(roleError || !userRoles || userRoles.length===0){
window.location.href="dashboard.html"
return
}

let roleIds = userRoles.map(r=>r.role_id)

/* GET PERMISSIONS */
const {data:permissions, error:permError} = await supabaseClient
.from("role_permissions")
.select("page_name")
.in("role_id",roleIds)
.eq("can_access",true)

if(permError){
console.log("RBAC ERROR:",permError)
window.location.href="dashboard.html"
return
}

/* SAFE ARRAY */
let allowedPages = (permissions || []).map(p=>p.page_name.trim())

console.log("PAGE:",page)
console.log("ALLOWED:",allowedPages)

/* 🔥 FINAL CHECK */
if(!allowedPages.includes(page)){
alert("Access Denied")
window.location.href="dashboard.html"
return
}

/* ✅ ALLOW PAGE */
document.body.style.display="block"

}catch(err){

console.log("FATAL RBAC ERROR:",err)

/* FAIL SAFE */
window.location.href="dashboard.html"

}

}/* ===========================
   GLOBAL PAGE RBAC (FINAL)
=========================== */

async function enforcePageAccess(){

try{

/* GET CURRENT PAGE */
const page = window.location.pathname.split("/").pop()

/* GET SESSION */
const { data:{session}, error:sessionError } = await supabaseClient.auth.getSession()

if(sessionError || !session){
window.location.href="login.html"
return
}

const authId = session.user.id

/* GET USER */
const {data:user, error:userError} = await supabaseClient
.from("users")
.select("id")
.eq("auth_id",authId)
.single()

if(userError || !user){
window.location.href="login.html"
return
}

/* GET ROLES */
const {data:userRoles, error:roleError} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)

if(roleError || !userRoles || userRoles.length===0){
window.location.href="dashboard.html"
return
}

let roleIds = userRoles.map(r=>r.role_id)

/* GET PERMISSIONS */
const {data:permissions, error:permError} = await supabaseClient
.from("role_permissions")
.select("page_name")
.in("role_id",roleIds)
.eq("can_access",true)

if(permError){
console.log("RBAC ERROR:",permError)
window.location.href="dashboard.html"
return
}

/* SAFE ARRAY */
let allowedPages = (permissions || []).map(p=>p.page_name.trim())

console.log("PAGE:",page)
console.log("ALLOWED:",allowedPages)

/* 🔥 FINAL CHECK */
if(!allowedPages.includes(page)){
alert("Access Denied")
window.location.href="dashboard.html"
return
}

/* ✅ ALLOW PAGE */
document.body.style.display="block"

}catch(err){

console.log("FATAL RBAC ERROR:",err)

/* FAIL SAFE */
window.location.href="dashboard.html"

}

}
