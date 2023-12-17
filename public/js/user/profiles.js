const currentPath = window.location.pathname;

const postsDiv = document.getElementById("posts");
const eventsDiv = document.getElementById("events");
const followersDiv = document.getElementById("followers");
const followingDiv = document.getElementById("following");

function showActiveDiv() {
  postsDiv.style.display = "none";
  eventsDiv.style.display = "none";
  followersDiv.style.display = "none";
  followingDiv.style.display = "none";

  if (currentPath === "/posts") {
    postsDiv.style.display = "block";
  } else if (currentPath === "/events") {
    eventsDiv.style.display = "block";
  } else if (currentPath === "/followers") {
    followersDiv.style.display = "block";
  } else if (currentPath === "/following") {
    followingDiv.style.display = "block";
  }
}

showActiveDiv();
