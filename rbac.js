const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

async function checkRBAC(){

try{

const {data:{session}} = await supabaseClient.auth.getSession()

if(!session){
window.location="login.html"
return
}

const authId = session.user.id

const {data:user}=await supabaseClient
.from("users")
.select("id")
.eq("auth_id",authId)
.single()

if(!user){
window.location="login.html"
return
}

const {data:userRoles}=await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)

if(!userRoles || userRoles.length===0){
window.location="login.html"
return
}

let roleIds = userRoles.map(r=>r.role_id)

let currentPage = window.location.pathname.split("/").pop()

const {data:permissions}=await supabaseClient
.from("role_permissions")
.select("id")
.in("role_id",roleIds)
.eq("page_name",currentPage)
.eq("can_access",true)

if(!permissions || permissions.length===0){

alert("Access Denied")

window.location="dashboard.html"

}

}catch(err){
console.error("RBAC Error:",err)
}

}

/* RUN IMMEDIATELY */
checkRBAC()
