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

let allowedPages = permissions.map(p=>p.page_name.trim())

let links = document.querySelectorAll("a[data-page]")

links.forEach(link=>{

let page = link.getAttribute("data-page")?.trim()

if(page === "logout") return

if(!allowedPages.includes(page)){
link.style.display="none"
}

})

}catch(err){
console.log("MENU RBAC ERROR",err)
}

}
