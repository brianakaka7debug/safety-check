// Big Island Safety Check Station Finder
// Refactored JavaScript that loads data from JSON file

// Geographic boundaries for Big Island of Hawaii
const BIG_ISLAND_BOUNDS = {
  north: 20.3,    // Northern tip (Upolu Point area)
  south: 18.9,    // Southern tip (South Point)
  east: -154.8,   // Eastern shore (Laupahoehoe area)
  west: -156.1    // Western shore (South Kona)
};

// Broader Hawaiian Islands bounds for more specific messaging
const HAWAIIAN_ISLANDS_BOUNDS = {
  north: 22.3,    // Kauai northern tip
  south: 18.8,    // Big Island southern tip
  east: -154.7,   // Big Island eastern shore
  west: -160.3    // Kauai western shore
};

let safetyStations = [];
let userLocation = null;
let map = null;

// DOM elements
const locateBtn = document.getElementById('locateBtn');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const stationListEl = document.getElementById('stationList');

// Load safety stations data from JSON file
async function loadStationsData() {
  try {
    const response = await fetch('hawaii_safety_stations_geocoded.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const allStations = await response.json();
    
    // Filter for Hawaii County (Big Island) only
    safetyStations = allStations.filter(station => 
      station.County === 'Hawaii' && 
      station.Latitude && 
      station.Longitude
    );
    
    console.log(`Loaded ${safetyStations.length} Big Island safety check stations`);
    
    // Enable the button once data is loaded
    locateBtn.disabled = false;
    
  } catch (error) {
    console.error('Error loading stations data:', error);
    // Fallback to a few hardcoded stations if JSON fails to load
    safetyStations = [
      { "County": "Hawaii", "Station Name": "Lex Brodie's", "Address": "1095 Kilauea Avenue., Hilo HI 96720", "Phone": "(808) 985-8473", "City": "Hilo", "Latitude": 19.7123553, "Longitude": -155.0768369 },
      { "County": "Hawaii", "Station Name": "Big Island Toyota Kona", "Address": "74-5504 Kaiwi Street., Kailua Kona HI 96740", "Phone": "(808) 329-4520", "City": "Kailua Kona", "Latitude": 19.6462868, "Longitude": -156.0011803 },
      { "County": "Hawaii", "Station Name": "Downtown Texaco", "Address": "192 Kinoole Street., Hilo HI 96720", "Phone": "(808) 935-8613", "City": "Hilo", "Latitude": 19.7235342, "Longitude": -155.0883261 },
      { "County": "Hawaii", "Station Name": "Kona Dodge", "Address": "76-6353 Kuakini Highway, Kailua Kona HI 96740", "Phone": "(808) 329-4408", "City": "Kailua Kona", "Latitude": 19.6098508, "Longitude": -155.9647437 }
    ];
    locateBtn.disabled = false;
    console.log('Using fallback station data');
  }
}

// Check if coordinates are within Big Island
function isWithinBigIsland(lat, lng) {
  return lat >= BIG_ISLAND_BOUNDS.south && 
         lat <= BIG_ISLAND_BOUNDS.north && 
         lng >= BIG_ISLAND_BOUNDS.west && 
         lng <= BIG_ISLAND_BOUNDS.east;
}

// Check if coordinates are within Hawaiian Islands
function isWithinHawaii(lat, lng) {
  return lat >= HAWAIIAN_ISLANDS_BOUNDS.south && 
         lat <= HAWAIIAN_ISLANDS_BOUNDS.north && 
         lng >= HAWAIIAN_ISLANDS_BOUNDS.west && 
         lng <= HAWAIIAN_ISLANDS_BOUNDS.east;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Find nearest stations with smart filtering
function findNearestStations(userLat, userLng) {
  const stationsWithDistance = safetyStations.map(station => ({
    name: station['Station Name'],
    address: station.Address,
    phone: station.Phone,
    city: station.City,
    lat: station.Latitude,
    lng: station.Longitude,
    distance: calculateDistance(userLat, userLng, station.Latitude, station.Longitude)
  }));

  // Sort by distance
  const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance);
  
  // Logic: Show closest 4 stations within 25 miles
  const stationsWithin25Miles = sortedStations.filter(s => s.distance <= 25);
  return stationsWithin25Miles.slice(0, 4);
}

// Initialize map
function initializeMap(userLat, userLng, nearestStations) {
  map = L.map('map', {
    attributionControl: false // Remove credits overlay
  });
  
  // Clean road map only (no satellite layer)
  const roadLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ''
  });
  
  roadLayer.addTo(map);

  // User location marker - simple red pin
  const userIcon = L.divIcon({
    html: `<div style="
      width: 24px;
      height: 24px;
      background-color: #ff4444;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: 'user-marker'
  });
  
  L.marker([userLat, userLng], { icon: userIcon })
   .addTo(map)
   .bindPopup('<strong style="color: #ff4444;">Your Location</strong>')
   .openPopup();

  // Station markers - simple green squares
  nearestStations.forEach((station) => {
    const stationIcon = L.divIcon({
      html: `<div style="
        width: 20px;
        height: 20px;
        background-color: #28a391;
        border: 2px solid white;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: 'station-marker'
    });
    
    L.marker([station.lat, station.lng], { icon: stationIcon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <strong style="color: #333; font-size: 14px;">${station.name}</strong><br>
          <span style="color: #666; font-size: 12px;">${station.address}</span><br>
          <span style="color: #28a391; font-size: 12px; font-weight: 500;">${station.phone}</span>
        </div>
      `);
  });

  // Fit map to show all displayed stations with padding
  const allPoints = [[userLat, userLng], ...nearestStations.map(s => [s.lat, s.lng])];
  const markers = [L.marker([userLat, userLng]), ...nearestStations.map(s => L.marker([s.lat, s.lng]))];
  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.15)); // Slightly more padding around the stations
}
// Display stations list
function displayStationsList(stations) {
  stationListEl.innerHTML = '';
  
  stations.forEach(station => {
    // Create Google Maps URL for address
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.address)}`;
    
    // Create phone URL
    const phoneUrl = `tel:${station.phone.replace(/[^\d]/g, '')}`;
    
    const stationCard = document.createElement('div');
    stationCard.className = 'card';
    stationCard.innerHTML = `
      <h4 style="margin-bottom:0.5rem;color:var(--font-dark);">${station.name}</h4>
      <p style="margin-bottom:0.25rem;color:#666;">
        <a href="${mapsUrl}" target="_blank" style="color:#666;text-decoration:none;">
          📍 ${station.address}
        </a>
      </p>
      <p style="margin:0;">
        <a href="${phoneUrl}" style="color:var(--brand-teal);text-decoration:none;font-weight:500;">
          📞 ${station.phone}
        </a>
      </p>
    `;
    stationListEl.appendChild(stationCard);
  });
}

// Show error message
function showError(message) {
  statusEl.innerHTML = `⚠️ ${message}`;
  statusEl.removeAttribute('hidden');
  locateBtn.disabled = false;
  locateBtn.textContent = 'Try Again';
}

// Show location-specific error messages
function showLocationError(lat, lng) {
  locateBtn.disabled = false;
  locateBtn.textContent = 'Get My Location';

  if (!isWithinHawaii(lat, lng)) {
    // Outside Hawaiian Islands entirely
    showError(`This safety check finder is designed for Hawaii's Big Island residents and visitors. 
      It appears you're currently outside of the Hawaiian Islands. When you visit the Big Island, 
      this tool will help you find the nearest safety check stations.`);
  } else if (!isWithinBigIsland(lat, lng)) {
    // Within Hawaii but not on Big Island
    let islandMessage = "another Hawaiian island";
    
    // Rough estimates for other major islands
    if (lat > 21.2 && lng > -158.3) {
      islandMessage = "Oahu";
    } else if (lat > 20.5 && lng < -156.7) {
      islandMessage = "Maui";
    } else if (lat > 21.8) {
      islandMessage = "Kauai";
    } else if (lat > 21.0 && lng < -156.8) {
      islandMessage = "Molokai or Lanai";
    }
    
    showError(`You appear to be on ${islandMessage}. This safety check finder is specifically 
      designed for Hawaii's Big Island (Island of Hawaii). When you travel to the Big Island, 
      this tool will help you find the nearest safety check stations.`);
  }
}

// Get user location and find stations
async function getUserLocationAndFindStations() {
  console.log('Button clicked');
  
  locateBtn.disabled = true;
  locateBtn.textContent = 'Getting Location...';
  statusEl.removeAttribute('hidden');
  statusEl.textContent = 'Finding nearby safety check stations…';

  // Check if we're on HTTPS or localhost
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  
  if (!isSecure) {
    showError('Location access requires HTTPS. Please use a secure hosting service.');
    return;
  }

  if (!navigator.geolocation) {
    showError('Geolocation is not supported by this browser.');
    locateBtn.disabled = false;
    locateBtn.textContent = 'Get My Location';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async function(position) {
      console.log('Location received:', position.coords.latitude, position.coords.longitude);
      
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Check if user is within Big Island bounds
      if (!isWithinBigIsland(userLocation.lat, userLocation.lng)) {
        showLocationError(userLocation.lat, userLocation.lng);
        return;
      }

      // Now ensure stations data is loaded before showing results
      if (safetyStations.length === 0) {
        statusEl.textContent = 'Loading safety station data…';
        try {
          await loadStationsData();
        } catch (error) {
          showError('Unable to load safety station data. Please try again.');
          return;
        }
      }

      // Find nearest stations
      const nearestStations = findNearestStations(userLocation.lat, userLocation.lng);
      console.log('Found nearest stations:', nearestStations.length);

      // Hide status and button
      statusEl.setAttribute('hidden', '');
      locateBtn.style.display = 'none';

      // Show results
      resultsEl.removeAttribute('hidden');
      
      // Initialize map and display results
      setTimeout(() => {
        initializeMap(userLocation.lat, userLocation.lng, nearestStations);
        displayStationsList(nearestStations);
      }, 100);
    },
    function(error) {
      console.error('Geolocation error:', error);
      let errorMessage = 'Unable to retrieve your location. ';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Please allow location access in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable. Please check your GPS/location services.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage += `An unknown error occurred (Code: ${error.code}). Make sure you're using HTTPS.`;
          break;
      }
      
      showError(errorMessage);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }
  );
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up event listeners');
  
  // Get the button element
  const btn = document.getElementById('locateBtn');
  
  if (!btn) {
    console.error('Button not found!');
    return;
  }
  
  // Add click handler
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Button clicked!');
    getUserLocationAndFindStations();
  });
  
  // Start loading station data in the background (optional preload)
  loadStationsData();
});