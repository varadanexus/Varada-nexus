const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
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

const {data:userRole} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)
.single()

if(!userRole) return


/* get permissions */

const {data:permissions} = await supabaseClient
.from("role_permissions")
.select("page_name")
.eq("role_id",userRole.role_id)
.eq("can_access",true)

if(!permissions) return


let allowedPages = permissions.map(p => p.page_name)


/* hide unauthorized links */

let links = document.querySelectorAll(".sidebar a[data-page]")

links.forEach(link=>{

let page = link.getAttribute("data-page").trim()

/* always allow logout */

if(page === "logout") return

if(!allowedPages.includes(page)){
link.style.display="none"
}

})

}


/* ============================= */
/* GLOBAL LOGOUT */
/* ============================= */

window.logout = async function(){

await supabaseClient.auth.signOut()

window.location.href="login.html"

}


/* ============================= */
/* RUN RBAC */
/* ============================= */

applyMenuRBAC()
