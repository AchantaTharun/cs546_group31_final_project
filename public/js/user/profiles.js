document.addEventListener("DOMContentLoaded", function () {
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach(function (content) {
    if (!content.classList.contains("active")) {
      content.style.display = "none";
    }
  });

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.getAttribute("href").substring(1);

      tabContents.forEach(function (content) {
        content.style.display = "none";
      });

      document.getElementById(target).style.display = "block";

      navLinks.forEach(function (nav) {
        nav.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
});
