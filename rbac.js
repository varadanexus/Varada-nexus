const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
)

async function checkRBAC(){

const {data:{session}} = await supabaseClient.auth.getSession()

if(!session){
window.location.replace("login.html")
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
window.location.replace("login.html")
return
}

/* GET ROLES (FIXED) */

const {data:userRoles}=await supabaseClient
.from("user_roles")
.select("role_id")
.eq("user_id",user.id)

if(!userRoles || userRoles.length===0){
window.location.replace("login.html")
return
}

let roleIds = userRoles.map(r=>r.role_id)

let currentPage = window.location.pathname.split("/").pop()

/* CHECK PERMISSION (FIXED) */

const {data:permissions}=await supabaseClient
.from("role_permissions")
.select("*")
.in("role_id",roleIds)
.eq("page_name",currentPage)
.eq("can_access",true)

if(!permissions || permissions.length===0){

alert("You do not have permission to access this page")

window.location.replace("dashboard.html")

}

}

checkRBAC()
