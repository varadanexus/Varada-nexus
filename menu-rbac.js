const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
)

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

if(!allowedPages.includes(page)){
link.style.display="none"
}

})

}
