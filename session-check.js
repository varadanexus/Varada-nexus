/* SESSION CHECK BEFORE PAGE LOAD */

(async function(){

const supabase = window.supabase

const supabaseClient = supabase.createClient(
"https://ticsgbtxfhhihamejiss.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
)

const { data:{session} } = await supabaseClient.auth.getSession()

if(!session){

window.location.replace("login.html")

}

})();
