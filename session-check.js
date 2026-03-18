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


/* CHECK MAINTENANCE */

async function checkMaintenance(){

const {data:settings}=await supabaseClient
.from("system_settings")
.select("*")
.eq("id",1)
.single()

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

await checkMaintenance()

}

runChecks()
