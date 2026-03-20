const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24i"
)

/* ============================= */
/* MENU RBAC */
/* ============================= */

async function applyMenuRBAC(){

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session) return

const authId = session.user.id

/* find ERP user */

const {data:user} = await supabaseClient
.from("users")
.select("id")
.eq("auth_id",authId)
.single()

if(!user) return

/* get role */

const {data:userRoles} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)

if(!userRoles || userRoles.length === 0) return

let roleIds = userRoles.map(r=>r.role_id)

/* get permissions */

const {data:permissions} = await supabaseClient
.from("role_permissions")
.select("page_name")
.in("role_id", roleIds)
.eq("can_access",true)

if(!permissions) return

let allowedPages = permissions.map(p => p.page_name)

/* wait until sidebar loads */

setTimeout(()=>{

let links = document.querySelectorAll(".sidebar a[data-page]")

links.forEach(link=>{

let page = link.getAttribute("data-page")?.trim()

/* allow logout always */

if(page === "logout") return

if(!allowedPages.includes(page)){
link.style.display="none"
}

})

},300)

}


/* ============================= */
/* GLOBAL LOGOUT */
/* ============================= */

window.logout = async function(){

await supabaseClient.auth.signOut()

localStorage.clear()

window.location.replace("login.html")

}


/* ============================= */
/* RUN RBAC */
/* ============================= */

setTimeout(applyMenuRBAC, 300)
