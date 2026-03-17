const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
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
.select("*")
.eq("role_id",userRole.role_id)
.eq("can_access",true)

if(!permissions) return


/* collect allowed pages */

let allowedPages = permissions.map(p => p.page_name || p.page)


/* wait for sidebar */

let checkSidebar = setInterval(()=>{

let links = document.querySelectorAll(".sidebar a[data-page]")

if(links.length === 0) return

clearInterval(checkSidebar)


links.forEach(link=>{

let page = link.getAttribute("data-page")

if(!allowedPages.includes(page)){
link.style.display="none"
}

})

},200)

}
