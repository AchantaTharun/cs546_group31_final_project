mapboxgl.accessToken =
  "pk.eyJ1IjoicGRlc2FpMjIiLCJhIjoiY2xxMDc2c2RiMTZzMjJucXZmYm43cjA3OSJ9.PG-e_eXq9WGRRo_Bl4SeNQ";

const lng = JSON.parse(localStorage.getItem("lng"));
const lat = JSON.parse(localStorage.getItem("lat"));
let users;
const map = document.getElementById("map");
if (map) {
  console.log(map.getAttribute("data"));
}
window.onload = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: `/api/v1/user/fromCoord`,
      params: {
        lng,
        lat,
      },
    });

    if (res.data.status === "success") {
      const map = new mapboxgl.Map({
        container: "map", // container ID
        style: "mapbox://styles/pdesai22/clq3fcvp500f801qm7362filu", // style URL
        center: [lng, lat], // starting position [lng, lat]
        zoom: 10, // starting zoom
      });
      users = res.data.data.users;
      console.log(users);
      users.forEach((user) => {
        const popupContent = `
    <div class="popup-content ">
    <div class="user-card-mapBox">
        <div class="card-body-mapBox ">
            <div class="profile-picture-mapBox">
                <img src="/public/imgs/pp.png" alt="${user.userName}'s Profile Picture">
            </div>
            <div class="user-details m-2">
                <h5 class="card-title-mapBox m-1">${user.userName}</h5>
                <p class="card-text m-1">${user.firstName} ${user.lastName}</p>
                <p class="card-text m-1">${user.email}</p>
            </div>
            <hr>
            <div class="profile-button">
                <button class="btn btn-primary-mapBox"><a href="/user/${user.userName}" class="text-white">View Profile</a></button>
            </div>
        </div>
    </div>
</div>

`;
        const popup = new mapboxgl.Popup({
          offset: 50,
          closeButton: true,
        }).setHTML(popupContent);

        new mapboxgl.Marker({
          color: "#185ED7",
        })
          .setLngLat(user.location.coordinates)
          .setPopup(popup)
          .addTo(map);
      });
      const popupContent = `
          <div class="popup-content ">
    <div class="user-card-mapBox">
        <div class="card-body-mapBox ">
            <div class="profile-picture-mapBox">
                <img src="/public/imgs/pp.png" alt="{user.userName}'s Profile Picture">
            </div>
            <div class="user-details m-2">
                <h5 class="card-title-mapBox m-1">{user.userName}</h5>
                <p class="card-text m-1">{user.firstName} {user.lastName}</p>
                <p class="card-text m-1">{user.email}</p>
            </div>
            <hr>
            <div class="profile-button">
                <button class="btn btn-primary-mapBox"><a href="/user/profile" class="text-white">Your Profile</a></button>
            </div>
        </div>
    </div>
</div>
`;
      const popup = new mapboxgl.Popup({
        offset: 50,
        closeButton: true,
      }).setHTML(popupContent);
      new mapboxgl.Marker({
        color: "#FF0000",
      })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);
    }
  } catch (err) {
    console.log(err);
  }
};
