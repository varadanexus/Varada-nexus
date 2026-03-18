const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

/* RBAC CHECK */

async function checkRBAC(){

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session){
window.location.href="/login.html"
return
}

let authId = session.user.id

/* GET ERP USER */

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

/* GET USER ROLE */

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

let roleId=userRole.role_id

/* CURRENT PAGE */

let page = window.location.pathname.split("/").pop()

/* CHECK PAGE ACCESS */

const {data:perm}=await supabaseClient
.from("role_permissions")
.select("*")
.eq("role_id",roleId)
.eq("page_name",page)
.eq("can_access",true)
.single()

if(!perm){

alert("You do not have permission to access this page")

window.location.href="/dashboard.html"

return

}

/* HIDE SIDEBAR MENUS BASED ON PERMISSION */

const {data:allowedPages}=await supabaseClient
.from("role_permissions")
.select("page_name")
.eq("role_id",roleId)
.eq("can_access",true)

if(!allowedPages) return

let allowedList = allowedPages.map(p=>p.page_name)

/* WAIT UNTIL SIDEBAR LOADS */

setTimeout(()=>{

document.querySelectorAll(".sidebar a[data-page]").forEach(link=>{

let pageName = link.getAttribute("data-page")

if(!allowedList.includes(pageName)){
link.style.display="none"
}

})

},300)

}

/* RUN RBAC */

checkRBAC()
