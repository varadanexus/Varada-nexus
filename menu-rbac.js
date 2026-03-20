const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

async function applyMenuRBAC(){

try{

const { data:{session} } = await supabaseClient.auth.getSession()
if(!session) return

const authId = session.user.id

const {data:user} = await supabaseClient
.from("users")
.select("id")
.eq("auth_id",authId)
.single()

if(!user) return

const {data:userRoles} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)

if(!userRoles || userRoles.length===0) return

let roleIds = userRoles.map(r=>r.role_id)

const {data:permissions} = await supabaseClient
.from("role_permissions")
.select("page_name")
.in("role_id",roleIds)
.eq("can_access",true)

if(!permissions) return

let allowedPages = permissions.map(p=>p.page_name)

/* APPLY MENU FILTER */

let links = document.querySelectorAll("a[data-page]")

links.forEach(link=>{

let page = link.getAttribute("data-page")

if(!page) return

if(!allowedPages.includes(page)){
link.style.display="none"
}

})

}catch(err){
console.error("RBAC Menu Error:",err)
}

}

/* RUN AFTER LOAD */

window.addEventListener("load", ()=>{
setTimeout(applyMenuRBAC,500)
})

/* LOGOUT */

window.logout = async function(){
await supabaseClient.auth.signOut()
localStorage.clear()
window.location="login.html"
}
