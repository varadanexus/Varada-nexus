const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

async function applyMenuRBAC(){

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session) return

const authId = session.user.id


/* find ERP user */

const {data:user,error:userError} = await supabaseClient
.from("users")
.select("id")
.eq("auth_id",authId)
.single()

if(userError || !user) return


/* get role */

const {data:userRole,error:roleError} = await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)
.single()

if(roleError || !userRole) return


/* get permissions */

const {data:permissions,error:permError} = await supabaseClient
.from("role_permissions")
.select("page_name")
.eq("role_id",userRole.role_id)
.eq("can_access",true)

if(permError || !permissions) return


/* clean page names */

let allowedPages = permissions.map(p => p.page_name.trim())


/* wait until sidebar loads */

let interval = setInterval(()=>{

let links = document.querySelectorAll(".sidebar a[data-page]")

if(links.length === 0) return

links.forEach(link=>{

let page = link.getAttribute("data-page").trim()

if(!allowedPages.includes(page)){
link.style.display="none"
}

})

clearInterval(interval)

},200)

}

applyMenuRBAC()
