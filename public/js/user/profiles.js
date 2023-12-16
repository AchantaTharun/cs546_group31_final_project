document.addEventListener("DOMContentLoaded", function () {
  // Hide all tab content except the default active one
  var tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach(function (content) {
    if (!content.classList.contains("active")) {
      content.style.display = "none";
    }
  });

  // Handle tab click event
  var navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var target = this.getAttribute("href").substring(1); // Get the target without '#'

      // Hide all tab content
      tabContents.forEach(function (content) {
        content.style.display = "none";
      });

      // Show the corresponding tab content
      document.getElementById(target).style.display = "block";

      // Remove and add 'active' class to the clicked tab
      navLinks.forEach(function (nav) {
        nav.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
});
