document.addEventListener("DOMContentLoaded", function () {
  var currentPath = window.location.pathname;

  var tabs = document.querySelectorAll(".profile-header-tab .nav-link_");
  tabs.forEach(function (tab) {
    tab.classList.remove("active", "show");
  });
  var activeTab = document.querySelector(
    `.profile-header-tab a[href="${currentPath}"]`
  );
  if (activeTab) {
    activeTab.classList.add("active", "show");
  }
});
