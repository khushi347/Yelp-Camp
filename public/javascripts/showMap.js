// public/javascripts/showMap.js
document.addEventListener('DOMContentLoaded', () => {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;

  const lat = parseFloat(mapDiv.dataset.lat);
  const lng = parseFloat(mapDiv.dataset.lng);
  const title = mapDiv.dataset.title;
  const location = mapDiv.dataset.location;
  const price = mapDiv.dataset.price;

  // Initialize map
  const map = L.map('map').setView([lat, lng], 13);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  // Custom campground marker
  const campgroundIcon = L.divIcon({
    html: `<div style="
      background: #2d8c3c;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    ">
      <i class="fas fa-campground"></i>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
    className: 'campground-marker'
  });

  // Add marker with popup
  const marker = L.marker([lat, lng], { 
    icon: campgroundIcon
  }).addTo(map);
  
  marker.bindPopup(`
    <div style="min-width: 220px; padding: 8px;">
      <h5 style="margin: 0 0 10px 0; color: #2d8c3c; font-weight: 700;">
        <i class="fas fa-tree" style="margin-right: 6px;"></i>${title}
      </h5>
      <p style="margin: 0 0 8px 0; color: #666;">
        <i class="fas fa-map-marker-alt" style="color: #2d8c3c; margin-right: 6px;"></i>
        ${location}
      </p>
      <p style="margin: 0 0 12px 0; color: #666;">
        <i class="fas fa-tag" style="color: #2d8c3c; margin-right: 6px;"></i>
        <strong style="color: #2d8c3c;">$${price}</strong> / night
      </p>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
         target="_blank"
         style="
           display: inline-block;
           background: #2d8c3c;
           color: white;
           padding: 8px 16px;
           border-radius: 6px;
           text-decoration: none;
           font-size: 0.9rem;
           font-weight: 600;
         ">
        <i class="fas fa-directions" style="margin-right: 6px;"></i>Get Directions
      </a>
    </div>
  `).openPopup();

  // Add radius circle
  L.circle([lat, lng], {
    color: '#2d8c3c',
    fillColor: '#2d8c3c',
    fillOpacity: 0.08,
    radius: 1500,
    weight: 2,
    opacity: 0.3
  }).addTo(map);

  // Add controls
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.control.scale({ metric: true, imperial: true, position: 'bottomleft' }).addTo(map);
});