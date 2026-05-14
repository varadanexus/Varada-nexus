async function logout(){

try{

const client = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg"
)

/* ✅ GLOBAL SIGN OUT */
await client.auth.signOut({ scope: "global" })

}catch(e){

console.log("Logout error:",e)

}

/* ✅ CLEAR ALL STORAGE */
sessionStorage.clear()

/* ✅ REMOVE SUPABASE CACHE */
Object.keys(localStorage).forEach(key=>{
if(key.includes("supabase")){
localStorage.removeItem(key)
}
})

localStorage.clear()

/* ✅ PREVENT BACK BUTTON CACHE */
window.location.replace("/website/login.html")

}