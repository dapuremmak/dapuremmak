(function(){
  "use strict";
  var btn = document.getElementById("menuToggle");
  var nav = document.querySelector(".header-nav");
  if (!btn || !nav) return;

  btn.addEventListener("click", function(){
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){ nav.classList.remove("open"); });
  });
})();
