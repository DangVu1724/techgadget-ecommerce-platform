async function loadSidebar(){

  const res = await fetch("../shared/sidebar.html");
  const data = await res.text();

  document.getElementById("sidebar-container").innerHTML = data;

  const logoutBtn = document.getElementById("logoutBtn");

  if(logoutBtn){
    logoutBtn.addEventListener("click", logout);
  }

}

function logout(){
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "../login/login.html";
}

loadSidebar();