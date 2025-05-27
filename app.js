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
let currentStationCount = 4; // Track how many stations are currently shown

// DOM elements
const locateBtn = document.getElementById('locateBtn');
const searchBtn = document.getElementById('searchBtn');
const addressInput = document.getElementById('addressInput');
const changeLocationBtn = document.getElementById('changeLocationBtn');
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
function findNearestStations(userLat, userLng, limit = 4) {
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
  
  // Logic: Show closest stations within 25 miles
  const stationsWithin25Miles = sortedStations.filter(s => s.distance <= 25);
  return stationsWithin25Miles.slice(0, limit);
}

// Initialize map with improved styling
function initializeMap(userLat, userLng, nearestStations) {
  map = L.map('map', {
    attributionControl: false // Remove credits overlay
  });
  
  // Create a vibrant, colorful map style using Stadia Maps Outdoors
  // This provides rich colors, topography, and better visual appeal
  const outdoorLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
    attribution: '', // Attribution moved to page footer
    maxZoom: 18
  });
  
  outdoorLayer.addTo(map);

  // Custom CSS for enhanced map appearance
  const mapContainer = document.getElementById('map');
  mapContainer.style.filter = 'contrast(1.05) saturate(1.1) brightness(1.02)';
  mapContainer.style.borderRadius = '12px';
  mapContainer.style.overflow = 'hidden';
  mapContainer.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)';

  // User location marker - enhanced blue circle with gradient/shine
  const isMobile = window.innerWidth <= 768;
  const userMarkerSize = isMobile ? 36 : 28;
  const userIconSize = isMobile ? 42 : 34;
  
  const userIcon = L.divIcon({
    html: `<div style="
      width: ${userMarkerSize}px;
      height: ${userMarkerSize}px;
      background: radial-gradient(circle at 30% 30%, #5ba3f5 0%, #4a90e2 40%, #357abd 70%, #2c5aa0 100%);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 
        0 4px 12px rgba(74, 144, 226, 0.5), 
        inset 0 2px 4px rgba(255,255,255,0.4),
        0 0 0 2px rgba(74, 144, 226, 0.2);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 3px;
        left: 6px;
        width: ${Math.round(userMarkerSize * 0.3)}px;
        height: ${Math.round(userMarkerSize * 0.3)}px;
        background: rgba(255,255,255,0.6);
        border-radius: 50%;
        filter: blur(1px);
      "></div>
    </div>`,
    iconSize: [userIconSize, userIconSize],
    iconAnchor: [userIconSize/2, userIconSize/2],
    className: 'user-marker'
  });
  
  L.marker([userLat, userLng], { icon: userIcon })
   .addTo(map)
   .bindPopup(`
     <div style="
       background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
       color: white;
       padding: 12px 16px;
       border-radius: 8px;
       text-align: center;
       font-weight: 600;
       box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
       border: none;
     ">
       📍 Your Location
     </div>
   `)
   .openPopup();

  // Enhanced station markers with better colors and styling
  nearestStations.forEach((station, index) => {
    const stationNumber = index + 1;
    
    // Enhanced color palette with more vibrant, distinctive colors
    const colorPalette = [
      { bg: '#e74c3c', shadow: 'rgba(231, 76, 60, 0.4)' },    // Vibrant Red
      { bg: '#f39c12', shadow: 'rgba(243, 156, 18, 0.4)' },   // Orange
      { bg: '#9b59b6', shadow: 'rgba(155, 89, 182, 0.4)' },   // Purple  
      { bg: '#1abc9c', shadow: 'rgba(26, 188, 156, 0.4)' },   // Teal
      { bg: '#3498db', shadow: 'rgba(52, 152, 219, 0.4)' },   // Blue
      { bg: '#e67e22', shadow: 'rgba(230, 126, 34, 0.4)' },   // Dark Orange
      { bg: '#e91e63', shadow: 'rgba(233, 30, 99, 0.4)' },    // Pink
      { bg: '#795548', shadow: 'rgba(121, 85, 72, 0.4)' }     // Brown
    ];
    
    const colors = colorPalette[index] || { bg: '#6c757d', shadow: 'rgba(108, 117, 125, 0.4)' };
    
    // Responsive marker size
    const markerSize = isMobile ? 32 : 26;
    const iconSize = isMobile ? 36 : 30;
    const fontSize = isMobile ? 18 : 14;
    
    const stationIcon = L.divIcon({
      html: `<div style="
        width: ${markerSize}px;
        height: ${markerSize}px;
        background: linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}dd 100%);
        border: 3px solid white;
        border-radius: 6px;
        box-shadow: 
          0 3px 10px ${colors.shadow}, 
          inset 0 1px 0 rgba(255,255,255,0.3),
          0 0 0 1px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${fontSize}px;
        font-family: system-ui, sans-serif;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        position: relative;
      ">${stationNumber}
        <div style="
          position: absolute;
          top: 2px;
          left: 3px;
          width: 4px;
          height: 4px;
          background: rgba(255,255,255,0.6);
          border-radius: 50%;
          filter: blur(0.5px);
        "></div>
      </div>`,
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize/2, iconSize/2],
      className: 'station-marker'
    });
    
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.address)}`;
    const phoneUrl = `tel:${station.phone.replace(/[^\d]/g, '')}`;
    
    L.marker([station.lat, station.lng], { icon: stationIcon })
      .addTo(map)
      .bindPopup(`
        <div style="
          background: linear-gradient(135deg, ${colors.bg}15 0%, ${colors.bg}08 100%);
          border: 2px solid ${colors.bg}40;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          font-family: system-ui, -apple-system, sans-serif;
          min-width: 240px;
          backdrop-filter: blur(10px);
        ">
          <h3 style="
            color: #333; 
            font-size: 17px; 
            margin: 0 0 14px 0;
            font-weight: 600;
            line-height: 1.3;
            text-align: center;
          ">${station.name}</h3>
          <a href="${mapsUrl}" 
             target="_blank"
             style="
               color: ${colors.bg};
               text-decoration: none;
               font-weight: 500;
               padding: 10px 14px;
               border-radius: 8px;
               background: ${colors.bg}15;
               border: 1px solid ${colors.bg}30;
               display: block;
               margin-bottom: 10px;
               font-size: 14px;
               line-height: 1.4;
               text-align: center;
               transition: all 0.2s ease;
             "
             onmouseover="this.style.background='${colors.bg}25'; this.style.borderColor='${colors.bg}50'"
             onmouseout="this.style.background='${colors.bg}15'; this.style.borderColor='${colors.bg}30'">
            📍 ${station.address}
          </a>
          <a href="${phoneUrl}"
             style="
               color: ${colors.bg};
               text-decoration: none;
               font-weight: 600;
               padding: 12px 16px;
               border-radius: 8px;
               background: ${colors.bg}20;
               border: 1px solid ${colors.bg}40;
               display: block;
               font-size: 15px;
               text-align: center;
               transition: all 0.2s ease;
             "
             onmouseover="this.style.background='${colors.bg}30'; this.style.borderColor='${colors.bg}60'"
             onmouseout="this.style.background='${colors.bg}20'; this.style.borderColor='${colors.bg}40'">
            📞 ${station.phone}
          </a>
        </div>
      `);
  });

  // Fit map to show all displayed stations with optimal padding
  const allPoints = [[userLat, userLng], ...nearestStations.map(s => [s.lat, s.lng])];
  const markers = [L.marker([userLat, userLng]), ...nearestStations.map(s => L.marker([s.lat, s.lng]))];
  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.1)); // Slightly more padding for better framing
}

// Display stations list
function displayStationsList(stations) {
  stationListEl.innerHTML = '';
  
  // Add warning message at the top
  const warningDiv = document.createElement('div');
  warningDiv.className = 'warning-message';
  warningDiv.innerHTML = `
    <strong>⚠️ Important:</strong> Please call ahead before driving to these locations, as business hours and availability may vary.
  `;
  stationListEl.appendChild(warningDiv);
  
  // Enhanced color scheme for card numbers (matching map markers)
  const colorPalette = [
    '#e74c3c', // Vibrant Red
    '#f39c12', // Orange
    '#9b59b6', // Purple  
    '#1abc9c', // Teal
    '#3498db', // Blue
    '#e67e22', // Dark Orange
    '#e91e63', // Pink
    '#795548'  // Brown
  ];
  
  stations.forEach((station, index) => {
    const stationNumber = index + 1;
    const markerColor = colorPalette[index] || '#6c757d';
    
    // Create Google Maps URL for address
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.address)}`;
    
    // Create phone URL
    const phoneUrl = `tel:${station.phone.replace(/[^\d]/g, '')}`;
    
    const stationCard = document.createElement('div');
    stationCard.className = 'card';
    stationCard.innerHTML = `
      <h4 style="margin-bottom:0.75rem;color:var(--font-dark);display:flex;align-items:center;">
        <span style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, ${markerColor} 0%, ${markerColor}dd 100%);
          color: white;
          font-weight: bold;
          font-size: 16px;
          border-radius: 6px;
          margin-right: 12px;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
          text-shadow: 0 1px 1px rgba(0,0,0,0.3);
        ">${stationNumber}</span>
        ${station.name}
      </h4>
      <div class="card-buttons">
        <a href="${phoneUrl}" class="phone-link">
          📞 ${station.phone}
        </a>
        <a href="${mapsUrl}" target="_blank" class="address-link">
          📍 ${station.address}, ${station.city}
        </a>
      </div>
    `;
    stationListEl.appendChild(stationCard);
  });
  
  // Add "Show More" button if showing 4 stations and more are available
  if (stations.length === 4 && currentStationCount === 4) {
    const totalAvailable = findNearestStations(userLocation.lat, userLocation.lng, 8).length;
    if (totalAvailable > 4) {
      const showMoreContainer = document.createElement('div');
      showMoreContainer.className = 'show-more-container';
      showMoreContainer.innerHTML = `
        <button class="show-more-btn" id="showMoreBtn">
          Show More Stations (${totalAvailable - 4} more)
        </button>
      `;
      stationListEl.appendChild(showMoreContainer);
      
      // Add click handler
      document.getElementById('showMoreBtn').addEventListener('click', showMoreStations);
    }
  }
}

// Go back to search
function changeLocation() {
  // Reset state
  currentStationCount = 4;
  userLocation = null;
  
  // Remove map if it exists
  if (map) {
    map.remove();
    map = null;
  }
  
  // Hide results and show hero
  resultsEl.setAttribute('hidden', '');
  document.querySelector('.hero').style.display = 'block';
  
  // Clear address input
  addressInput.value = '';
  
  // Reset button states
  locateBtn.disabled = false;
  locateBtn.textContent = '📍 Use My Location';
  searchBtn.disabled = false;
  searchBtn.textContent = '🔍 Find Stations';
  
  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMoreStations() {
  if (currentStationCount >= 8) return; // Max 8 stations
  
  currentStationCount = 8;
  const nearestStations = findNearestStations(userLocation.lat, userLocation.lng, 8);
  
  // Update map
  if (map) {
    map.remove(); // Remove existing map
  }
  initializeMap(userLocation.lat, userLocation.lng, nearestStations);
  
  // Update station list
  displayStationsList(nearestStations);
}

// Free geocoding with multiple fallbacks
async function geocodeAddress(address) {
  // Add Hawaii context to improve results
  const fullAddress = address.includes('Hawaii') || address.includes('HI') ? 
    address : `${address}, Hawaii, USA`;
  
  const encodedAddress = encodeURIComponent(fullAddress);
  
  // Try multiple free services in order of reliability
  const services = [
    // Nominatim (OpenStreetMap) - most reliable free service
    {
      name: 'Nominatim',
      url: `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us`,
      parser: (data) => data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), formatted: data[0].display_name } : null
    }
  ];
  
  for (const service of services) {
    try {
      console.log(`Trying geocoding with ${service.name}...`);
      const response = await fetch(service.url);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      const result = service.parser(data);
      
      if (result && result.lat && result.lng) {
        console.log(`Geocoding successful with ${service.name}:`, result);
        return {
          success: true,
          lat: result.lat,
          lng: result.lng,
          formatted_address: result.formatted || address
        };
      }
    } catch (error) {
      console.log(`${service.name} geocoding failed:`, error);
      continue;
    }
  }
  
  return {
    success: false,
    error: 'Unable to find location. Please try a more specific address.'
  };
}

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
      const nearestStations = findNearestStations(userLocation.lat, userLocation.lng, currentStationCount);
      console.log('Found nearest stations:', nearestStations.length);

      // Hide hero section and show results
      document.querySelector('.hero').style.display = 'none';
      statusEl.setAttribute('hidden', '');
      
      // Show results
      resultsEl.removeAttribute('hidden');
      
      // Snap to top to show results
      window.scrollTo({ top: 0, behavior: 'instant' });
      
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

// Add the missing searchByAddress function
async function searchByAddress() {
  const address = document.getElementById('addressInput').value.trim();
  
  if (!address) {
    showError('Please enter an address or ZIP code.');
    return;
  }
  
  // Disable button and show loading state
  const searchBtn = document.getElementById('searchBtn');
  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching...';
  
  const statusEl = document.getElementById('status');
  statusEl.removeAttribute('hidden');
  statusEl.textContent = 'Finding your location...';
  
  try {
    // Ensure stations data is loaded
    if (safetyStations.length === 0) {
      statusEl.textContent = 'Loading safety station data...';
      await loadStationsData();
    }
    
    // Geocode the address
    statusEl.textContent = 'Looking up address...';
    const geocodeResult = await geocodeAddress(address);
    
    if (!geocodeResult.success) {
      showError(geocodeResult.error || 'Unable to find that location. Please try a different address.');
      searchBtn.disabled = false;
      searchBtn.textContent = '🔍 Find Stations';
      return;
    }
    
    const { lat, lng } = geocodeResult;
    console.log('Geocoded address:', address, 'to coordinates:', lat, lng);
    
    // Check if the location is within Big Island bounds
    if (!isWithinBigIsland(lat, lng)) {
      showLocationError(lat, lng);
      searchBtn.disabled = false;
      searchBtn.textContent = '🔍 Find Stations';
      return;
    }
    
    // Set user location
    userLocation = { lat, lng };
    
    // Find nearest stations
    statusEl.textContent = 'Finding nearby safety check stations...';
    const nearestStations = findNearestStations(lat, lng, currentStationCount);
    console.log('Found nearest stations:', nearestStations.length);
    
    if (nearestStations.length === 0) {
      showError('No safety check stations found within 25 miles of your location.');
      searchBtn.disabled = false;
      searchBtn.textContent = '🔍 Find Stations';
      return;
    }
    
    // Hide hero section and show results
    document.querySelector('.hero').style.display = 'none';
    statusEl.setAttribute('hidden', '');
    
    // Show results
    document.getElementById('results').removeAttribute('hidden');
    
    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Initialize map and display results
    setTimeout(() => {
      initializeMap(lat, lng, nearestStations);
      displayStationsList(nearestStations);
    }, 100);
    
  } catch (error) {
    console.error('Search error:', error);
    showError('An error occurred while searching. Please try again.');
    searchBtn.disabled = false;
    searchBtn.textContent = '🔍 Find Stations';
  }
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up event listeners');
  
  // Get the button elements
  const locateButton = document.getElementById('locateBtn');
  const searchButton = document.getElementById('searchBtn');
  const changeLocationButton = document.getElementById('changeLocationBtn');
  const addressField = document.getElementById('addressInput');
  
  if (!locateButton || !searchButton || !changeLocationButton || !addressField) {
    console.error('Required elements not found!');
    return;
  }
  
  // Add click handler for location button
  locateBtn.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Location button clicked!');
    getUserLocationAndFindStations();
  });
  
  // Add click handler for search button
  searchButton.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Search button clicked!');
    searchByAddress();
  });
  
  // Add click handler for change location button
  changeLocationButton.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Change location clicked!');
    changeLocation();
  });
  
  // Add enter key handler for address input
  addressField.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchByAddress();
    }
  });
  
  // Start loading station data in the background (optional preload)
  loadStationsData();
});