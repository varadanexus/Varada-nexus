window.showSidebar = function(){

  document
  .getElementById("sidebar")
  .classList
  .remove("-translate-x-full")

}

window.hideSidebar = function(){

  if(window.innerWidth < 768){

    document
    .getElementById("sidebar")
    .classList
    .add("-translate-x-full")

  }

}

// ✅ INITIAL MOBILE STATE
window.addEventListener("DOMContentLoaded", () => {

  if(window.innerWidth < 768){

    document
    .getElementById("sidebar")
    .classList
    .add("-translate-x-full")

  }

})
