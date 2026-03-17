const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

async function checkRBAC(){

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session){
window.location.href="/login.html"
return
}

let authId = session.user.id

/* get ERP user */

const {data:user}=await supabaseClient
.from("users")
.select("id")
.eq("auth_id",authId)
.single()

if(!user){
alert("User not registered")
window.location.href="/login.html"
return
}

/* get role */

const {data:userRole}=await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)
.single()

if(!userRole){
alert("Role not assigned")
window.location.href="/login.html"
return
}

let page = window.location.pathname.split("/").pop()

/* check permission */

const {data:perm}=await supabaseClient
.from("role_permissions")
.select("*")
.eq("role_id",userRole.role_id)
.eq("page_name",page)
.eq("can_access",true)
.single()

if(!perm){

alert("You do not have permission to access this page")

window.location.href="/dashboard.html"

}

}

/* run RBAC */

checkRBAC()
