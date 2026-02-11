document.addEventListener('DOMContentLoaded', () => {
  if (!campgroundsGeoJSON || !campgroundsGeoJSON.features.length) return;

  const map = L.map('clusterMap').setView([39.8283, -98.5795], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  const markers = L.markerClusterGroup();

  campgroundsGeoJSON.features.forEach(feature => {
    const [lng, lat] = feature.geometry.coordinates;

    const marker = L.marker([lat, lng]).bindPopup(`
      <strong>${feature.properties.title}</strong><br>
      ${feature.properties.location}<br>
      $${feature.properties.price}/night
    `);

    markers.addLayer(marker);
  });

  map.addLayer(markers);
  map.fitBounds(markers.getBounds());
});
