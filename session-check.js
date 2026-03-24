const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

/* SYSTEM STATUS BADGE */

function showSystemBadge(mode){

const existing=document.getElementById("systemStatusBadge")
if(existing) existing.remove()

const badge=document.createElement("div")

badge.id="systemStatusBadge"

badge.style.position="fixed"
badge.style.top="10px"
badge.style.right="20px"
badge.style.padding="6px 12px"
badge.style.borderRadius="6px"
badge.style.fontSize="13px"
badge.style.fontWeight="bold"
badge.style.fontFamily="Arial"
badge.style.zIndex="2000"
badge.style.boxShadow="0 2px 6px rgba(0,0,0,0.2)"

if(mode){
badge.style.background="#d9534f"
badge.style.color="white"
badge.innerText="🔴 MAINTENANCE MODE"
}else{
badge.style.background="#28a745"
badge.style.color="white"
badge.innerText="🟢 SYSTEM ONLINE"
}

document.body.appendChild(badge)
}


/* CHECK LOGIN */
async function checkLogin(){

const page = window.location.pathname.split("/").pop()

if(page === "login.html") return null

const { data } = await supabaseClient.auth.getSession()

if(!data.session){
window.location.replace("login.html")
return null
}

const session = data.session

/* 🔥 ADD THIS BLOCK HERE */
const { data: agent } = await supabaseClient
  .from("agents")
  .select("is_active")
  .eq("auth_id", session.user.id)
  .single()

if(agent && agent.is_active === false){
  await supabaseClient.auth.signOut()
  alert("Account disabled 🚫")
  window.location.replace("login.html")
  return null
}
/* 🔥 END BLOCK */

return session
}

/* SINGLE SESSION */

async function checkSingleSession(session){

if(!session) return

const authId = session.user.id

const {data:user}=await supabaseClient
.from("users")
.select("session_token")
.eq("auth_id",authId)
.single()

if(!user) return

const browserToken = localStorage.getItem("erp_session_token")

if(browserToken && user.session_token !== browserToken){

alert("Your account was logged in from another device.")

await supabaseClient.auth.signOut()

window.location.replace("login.html")
}
}


/* MAINTENANCE */

async function checkMaintenance(session){

const page = window.location.pathname.split("/").pop()

if(page === "login.html") return

const {data:settings}=await supabaseClient
.from("system_settings")
.select("*")
.eq("id",1)
.single()

if(!settings) return

/* VERSION CHECK */

const systemVersion = settings.maintenance_version || 1
const localVersion = localStorage.getItem("erp_system_version")

if(!localVersion){
localStorage.setItem("erp_system_version", systemVersion)
}
else if(Number(localVersion) !== Number(systemVersion)){

await supabaseClient.auth.signOut()

localStorage.setItem("erp_system_version", systemVersion)

window.location.replace("login.html")
return
}

if(!session) return

const authId=session.user.id

const {data:user}=await supabaseClient
.from("users")
.select("is_admin")
.eq("auth_id",authId)
.single()

/* ADMIN BADGE */

if(user?.is_admin){
showSystemBadge(settings.maintenance_mode)
}

/* BLOCK NON ADMIN */

if(settings.maintenance_mode && !user?.is_admin){

document.body.innerHTML=`
<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#f4f6f9;">
<div style="background:white;padding:40px;border-radius:8px;box-shadow:0 5px 15px rgba(0,0,0,0.1);text-align:center;max-width:500px;">
<h2 style="color:#1f3c88">System Maintenance</h2>
<p>${settings.message}</p>
</div>
</div>
`

throw new Error("Maintenance active")
}
}


/* RUN */

async function runChecks(){

const session = await checkLogin()

await checkMaintenance(session)

await checkSingleSession(session)

}

runChecks()


/* BACK BUTTON FIX */

window.addEventListener("pageshow", function (event) {

const nav = performance.getEntriesByType("navigation")[0]

if (event.persisted || nav?.type === "back_forward") {
window.location.reload()
}

})


/* CACHE BLOCK */

window.history.pushState(null, null, window.location.href)

window.onpopstate = function () {
window.history.go(1)
}


/* ACTIVITY TIMEOUT */

let inactivityTimer

async function autoLogout(){

await supabaseClient.auth.signOut()

alert("Session expired due to inactivity.")

window.location.replace("login.html")
}

function resetInactivityTimer(){

clearTimeout(inactivityTimer)

inactivityTimer = setTimeout(autoLogout, 15 * 60 * 1000)
}

["mousemove","keypress","click","scroll"].forEach(event=>{
document.addEventListener(event, resetInactivityTimer)
})

resetInactivityTimer()
