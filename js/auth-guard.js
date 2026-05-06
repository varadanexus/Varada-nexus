/* GLOBAL AUTH GUARD — VARADA NEXUS ERP */

const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);


/* ===============================
SESSION CHECK
================================ */

async function checkSession(){

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session){

window.location.replace("login.html")

}

}

checkSession()



/* ===============================
REALTIME LOGOUT (ALL TABS)
================================ */

supabaseClient.auth.onAuthStateChange((event)=>{

if(event==="SIGNED_OUT"){

window.location.replace("login.html")

}

})



/* ===============================
INACTIVITY AUTO LOGOUT (15 MIN)
================================ */

let inactivityTimer

function resetTimer(){

clearTimeout(inactivityTimer)

inactivityTimer=setTimeout(async ()=>{

await supabaseClient.auth.signOut()

window.location.replace("login.html")

},900000) // 15 minutes

}

document.onload=resetTimer
document.onmousemove=resetTimer
document.onkeypress=resetTimer
document.onclick=resetTimer
document.onscroll=resetTimer
document.ontouchstart=resetTimer



/* ===============================
PREVENT BACK BUTTON AFTER LOGOUT
================================ */

window.history.pushState(null, null, window.location.href)

window.onpopstate=function(){

window.history.go(1)

}



/* ===============================
BROWSER CACHE PROTECTION
================================ */

window.addEventListener("pageshow",function(event){

if(event.persisted){

window.location.reload()

}

})



/* ===============================
SESSION AUTO REFRESH CHECK
================================ */

setInterval(async ()=>{

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session){

window.location.replace("login.html")

}

},60000) // every 1 minute



/* ===============================
CLEAR LOCAL STORAGE ON LOGOUT
================================ */

supabaseClient.auth.onAuthStateChange((event)=>{

if(event==="SIGNED_OUT"){

localStorage.clear()
sessionStorage.clear()

}

})
