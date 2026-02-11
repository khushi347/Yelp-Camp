// Mobile menu
document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
  const nav = document.getElementById('navLinks');
  const icon = document.querySelector('#mobileMenuBtn i');
  nav.classList.toggle('active');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-times');
});

// Map
const lat = window.CAMPGROUND_LAT;
const lng = window.CAMPGROUND_LNG;
const zoom = window.CAMPGROUND_ZOOM;

const map = L.map('map').setView([lat, lng], zoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

const icon = L.divIcon({
  html: `<div style="background:#2d8c3c;width:32px;height:32px;border-radius:50%;border:3px solid white;"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

let marker = null;
const latInput = document.getElementById('latitude');
const lngInput = document.getElementById('longitude');

function updateCoords(lat, lng) {
  latInput.value = lat.toFixed(6);
  lngInput.value = lng.toFixed(6);
}

function placeMarker(lat, lng) {
  if (!marker) {
    marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      updateCoords(pos.lat, pos.lng);
    });
  } else {
    marker.setLatLng([lat, lng]);
  }
  updateCoords(lat, lng);
}

if (window.HAS_GEOMETRY) {
  placeMarker(lat, lng);
}

map.on('click', e => placeMarker(e.latlng.lat, e.latlng.lng));
