const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

async function checkRBAC(){

const {data:{session}} = await supabaseClient.auth.getSession()

if(!session){
window.location.href="login.html"
return
}

const authId = session.user.id

/* FIND ERP USER */

const {data:user}=await supabaseClient
.from("users")
.select("id")
.eq("auth_id",authId)
.single()

if(!user){
window.location.href="login.html"
return
}

/* GET ROLE */

const {data:userRole}=await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)
.single()

if(!userRole){
window.location.href="login.html"
return
}

let roleId=userRole.role_id

let currentPage = window.location.pathname.split("/").pop()

/* CHECK PERMISSION */

const {data:permission}=await supabaseClient
.from("role_permissions")
.select("*")
.eq("role_id",roleId)
.eq("page_name",currentPage)
.eq("can_access",true)
.single()

if(!permission){

alert("You do not have permission to access this page")

window.location.href="dashboard.html"

}

}

checkRBAC()
