const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

async function checkRBAC(){

try{

/* 🔥 BLOCK PAGE IMMEDIATELY */
document.body.style.visibility = "hidden"

/* CURRENT PAGE */
let currentPage = window.location.pathname.split("/").pop().trim()

/* ✅ SKIP LOGIN PAGE */
if(currentPage === "login.html" || currentPage === ""){
document.body.style.visibility = "visible"
return
}

/* WAIT FOR SESSION */
let session = null

for(let i=0;i<6;i++){
const {data} = await supabaseClient.auth.getSession()
if(data.session){
session = data.session
break
}
await new Promise(r=>setTimeout(r,200))
}

if(!session){
window.location.href = "login.html"
return
}

const authId = session.user.id

/* GET USER */
const {data:user} = await supabaseClient
.from("users")
.select("id")
.eq("auth_id",authId)
.single()

if(!user){
window.location.href = "login.html"
return
}

/* GET ROLES */
const {data:userRoles} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)

if(!userRoles || userRoles.length===0){
window.location.href = "login.html"
return
}

let roleIds = userRoles.map(r=>r.role_id)

/* CHECK PERMISSION */
const {data:permissions} = await supabaseClient
.from("role_permissions")
.select("page_name")
.in("role_id",roleIds)
.eq("page_name",currentPage)
.eq("can_access",true)

/* ❌ BLOCK ACCESS */
if(!permissions || permissions.length===0){

alert("Access Denied")

window.location.href = "dashboard.html"
return
}

/* ✅ ALLOW PAGE */
document.body.style.visibility = "visible"

}catch(err){

console.error("RBAC ERROR:", err)

/* FAIL SAFE */
window.location.href = "login.html"

}

}

/* 🔥 RUN IMMEDIATELY */
checkRBAC()
