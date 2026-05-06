function getCurrentModule(){
    const path = window.location.pathname.split("/")
    const moduleIndex = path.indexOf("modules")
    return moduleIndex !== -1 ? path[moduleIndex + 1] : "logistics"
}

window.go = function(page){
    const module = getCurrentModule()
    window.location.href = "/modules/" + module + "/" + page
}