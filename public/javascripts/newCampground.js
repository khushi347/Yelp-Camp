document.addEventListener('DOMContentLoaded', () => {
  const latInput = document.getElementById('latitude');
  const lngInput = document.getElementById('longitude');
  const imageUpload = document.getElementById('imageUpload');
  const fileCount = document.getElementById('fileCount');
  const form = document.getElementById('campgroundForm');

  /* MAP */
  const map = L.map('map').setView([20.5937, 78.9629], 5); // India center

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(map);

  let marker;

  function setMarker(lat, lng) {
    if (!marker) {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        latInput.value = pos.lat.toFixed(6);
        lngInput.value = pos.lng.toFixed(6);
      });
    } else {
      marker.setLatLng([lat, lng]);
    }
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);
    map.setView([lat, lng], 10);
  }

  map.on('click', e => {
    setMarker(e.latlng.lat, e.latlng.lng);
  });

  /* IMAGE COUNT */
  imageUpload.addEventListener('change', () => {
    const files = imageUpload.files;
    fileCount.textContent =
      files.length === 0
        ? 'No files selected'
        : `${files.length} file(s) selected`;
  });

  /* FORM VALIDATION */
  form.addEventListener('submit', e => {
    let valid = true;

    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value) {
        input.classList.add('is-invalid');
        valid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    });

    if (!valid) {
      e.preventDefault();
      alert('Please fill all required fields');
    }
  });
});
