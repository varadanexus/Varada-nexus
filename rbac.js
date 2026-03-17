const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

async function checkAccess(){

const {data:{user}} = await supabaseClient.auth.getUser()

if(!user){
window.location="login.html"
return
}

/* get user role */

const {data:userData} = await supabaseClient
.from("users")
.select("id")
.eq("auth_id",user.id)
.single()

const {data:userRole} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",userData.id)
.single()

const {data:role} = await supabaseClient
.from("roles")
.select("role_name")
.eq("id",userRole.role_id)
.single()

/* current page */

let page=window.location.pathname.split("/").pop()

/* check permission */

const {data:perm} = await supabaseClient
.from("role_permissions")
.select("*")
.eq("role_id",role.id)
.eq("page",page)
.single()

if(!perm || !perm.can_access){

alert("Access Denied")

window.location="dashboard.html"

}

}

checkAccess()
