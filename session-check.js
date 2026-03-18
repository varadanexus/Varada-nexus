const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

/* CHECK LOGIN */

async function checkLogin(){

const page = window.location.pathname.split("/").pop()

if(page === "login.html") return

const {data} = await supabaseClient.auth.getSession()

if(!data.session){
window.location.href="login.html"
return
}

return data.session

}


/* SINGLE SESSION PROTECTION */

async function checkSingleSession(){

const page = window.location.pathname.split("/").pop()

if(page === "login.html") return

const {data} = await supabaseClient.auth.getSession()

if(!data.session) return

const authId = data.session.user.id

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

window.location.href="login.html"

}

}


/* CHECK MAINTENANCE */

async function checkMaintenance(){

const page = window.location.pathname.split("/").pop()

if(page === "login.html") return

const {data:settings}=await supabaseClient
.from("system_settings")
.select("*")
.eq("id",1)
.single()

/* VERSION CHECK */

const systemVersion = settings.maintenance_version

const localVersion = localStorage.getItem("erp_system_version")

if(!localVersion){

localStorage.setItem("erp_system_version", systemVersion)

}else if(Number(localVersion) !== Number(systemVersion)){

await supabaseClient.auth.signOut()

localStorage.setItem("erp_system_version", systemVersion)

window.location.href="login.html"

return

}

if(!settings?.maintenance_mode) return

/* GET CURRENT USER */

const {data:session}=await supabaseClient.auth.getSession()

if(!session?.session) return

const authId=session.session.user.id

/* FIND USER */

const {data:user}=await supabaseClient
.from("users")
.select("is_admin")
.eq("auth_id",authId)
.single()

/* ADMIN BYPASS */

if(user?.is_admin) return

/* BLOCK NON ADMINS */

document.body.innerHTML=`

<div style="
display:flex;
justify-content:center;
align-items:center;
height:100vh;
font-family:Arial;
background:#f4f6f9;
">

<div style="
background:white;
padding:40px;
border-radius:8px;
box-shadow:0 5px 15px rgba(0,0,0,0.1);
text-align:center;
max-width:500px;
">

<h2 style="color:#1f3c88">System Maintenance</h2>
<p>${settings.message}</p>

</div>

</div>

`

throw new Error("Maintenance active")

}


/* RUN */

async function runChecks(){

await checkLogin()

await checkSingleSession()

await checkMaintenance()

}

runChecks()



/* BROWSER BACK BUTTON PROTECTION */

window.addEventListener("pageshow", function (event) {

if (event.persisted) {

window.location.reload();

}

});


/* DISABLE CACHE */

window.history.pushState(null, null, window.location.href);

window.onpopstate = function () {

window.history.go(1);

};


/* ACTIVITY TIMEOUT (15 MINUTES) */

let inactivityTimer;

async function autoLogout(){

await supabaseClient.auth.signOut();

alert("Session expired due to inactivity.");

window.location.href = "login.html";

}

function resetInactivityTimer(){

clearTimeout(inactivityTimer);

inactivityTimer = setTimeout(autoLogout, 15 * 60 * 1000);

}

window.onload = resetInactivityTimer;

document.onmousemove = resetInactivityTimer;

document.onkeypress = resetInactivityTimer;

document.onclick = resetInactivityTimer;

document.onscroll = resetInactivityTimer;
