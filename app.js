// Big Island Safety Check Station Finder
// Refactored JavaScript with real Hawaii safety station data

// Real safety check stations data for Big Island (Hawaii County only)
const safetyStations = [
  { name: "DT Customs", address: "83-5326 Mamalahoa Highway, Captain Cook HI 96704", phone: "(808) 938-6063", lat: 19.4478643, lng: -155.8794948 },
  { name: "Cartow Kohala", address: "55-510 Hawi Rd., Hawi HI 96719", phone: "(808) 889-1061", lat: 20.2376651, lng: -155.8309846 },
  { name: "AKM Performance LLC", address: "66 Kukila Street., Hilo HI 96720", phone: "(808) 756-4859", lat: 19.7023384, lng: -155.0599128 },
  { name: "Aloha Kia Hilo", address: "226 Kanoelehua Avenue, Hilo HI 96720", phone: "(808) 935-3500", lat: 19.7193486, lng: -155.0647679 },
  { name: "Big Island Honda-Hilo", address: "124 Wiwoole Street, Hilo HI 96720", phone: "(808) 961-5505", lat: 19.7023527, lng: -155.0650399 },
  { name: "Big Island Toyota, Inc.", address: "811 Kanoelehua, Hilo HI 96720", phone: "(808) 974-2237", lat: 19.7061143, lng: -155.0634478 },
  { name: "Cal's Union Service", address: "56 E. Puainako Street, Hilo HI 96720", phone: "(808) 959-9860", lat: 19.6946705, lng: -155.0665988 },
  { name: "Downtown Texaco", address: "192 Kinoole Street., Hilo HI 96720", phone: "(808) 935-8613", lat: 19.7235342, lng: -155.0883261 },
  { name: "Firestone Complete Auto Care", address: "26 Kekela Street, Hilo HI 96720", phone: "(808) 959-7654", lat: 19.6959845, lng: -155.0664163 },
  { name: "Lex Brodie's", address: "1095 Kilauea Avenue., Hilo HI 96720", phone: "(808) 985-8473", lat: 19.7123553, lng: -155.0768369 },
  { name: "Orchid Isle Auto Center", address: "1030 Kanoelehua Avenue, Hilo HI 96720", phone: "(808) 935-1191", lat: 19.6997056, lng: -155.0659542 },
  { name: "Hualalai garage", address: "77-6069 Mamalahoa Highway, Holualoa HI 96725", phone: "(808) 324-4772", lat: 19.6096659, lng: -155.9493458 },
  { name: "Waikoloa automotive", address: "68-1897 Pua Melia Street., Waikoloa HI 96738", phone: "(808) 883-0888", lat: 19.9262132, lng: -155.7873643 },
  { name: "All About Autos Hawaii Inc.", address: "73-5580 Maiau Street, Kailua Kona HI 96740", phone: "(808) 334-1994", lat: 19.6864636, lng: -156.0181318 },
  { name: "Big Island Toyota Kona", address: "74-5504 Kaiwi Street., Kailua Kona HI 96740", phone: "(808) 329-4520", lat: 19.6462868, lng: -156.0011803 },
  { name: "Goodyear Tire and Rubber Company", address: "74-5488 Kaiwi Street., Kailua Kona HI 96740", phone: "(808) 329-1750", lat: 19.6474824, lng: -156.0009577 },
  { name: "KN Mazda, Subaru, Hyundai", address: "75-5793 Kuakini Highway, Kailua Kona HI 96740", phone: "(808) 329-5274", lat: 19.6361744, lng: -155.9881794 },
  { name: "Kona Dodge", address: "76-6353 Kuakini Highway, Kailua Kona HI 96740", phone: "(808) 329-4408", lat: 19.6098508, lng: -155.9647437 },
  { name: "Lex Brodie Tire Co. Kona", address: "75-5570 Kuakini Highway, Kailua Kona HI 96740", phone: "(808) 329-8826", lat: 19.6416486, lng: -156.0008192 },
  { name: "Tony Honda Kona", address: "75-5608 Kuakini Highway, Kailua Kona HI 96740", phone: "(808) 329-8101", lat: 19.6422239, lng: -155.9983699 },
  { name: "Gearheadz Auto Salon", address: "64-1013 Mamalahoa Highway. #2,#3, Kamuela HI 96743", phone: "(808) 885-0000", lat: 20.0256135, lng: -155.6575465 },
  { name: "Hawaii Tire Company, LLC, Lex Brodie's Tire Co.", address: "67-1185 Mamalahoa Highway. Bldg. I, Kamuela HI 96743", phone: "(808) 885-5959", lat: 20.0206399, lng: -155.667106 },
  { name: "RT's Service", address: "64-5223 Kauakea Rd, Waimea HI 96743", phone: "(808) 885-4488", lat: 20.040267, lng: -155.616308 },
  { name: "Eddie's Auto Diagnostic & Repair", address: "16-768 Hoawa Street, Keaau HI 96749", phone: "(808) 966-8594", lat: 19.6241792, lng: -155.0358762 },
  { name: "Silva's Service", address: "15-5014 28th Ave, Keaau HI 96749", phone: "(808) 966-8580", lat: 19.5750555, lng: -154.9956024 },
  { name: "Autotech Inc.", address: "81-981 Halekii Street., Kealakekua HI 96750", phone: "(808) 322-8881", lat: 19.5188739, lng: -155.9211556 },
  { name: "Keaau Service Station, Inc.", address: "17-355 Volcano Rd, Kurtistown, HI 96760", phone: "(808) 966-9373", lat: 19.5932527, lng: -155.0571719 },
  { name: "Kau Auto Repair", address: "95-1178 Kaalaiki Rd., Naalehu HI 96772", phone: "(808) 929-9096", lat: 19.0624672, lng: -155.5867295 },
  { name: "Kainehe Service Station", address: "42-1034 Old Mamalahoa Highway, Paauilo HI 96776", phone: "(808) 776-1012", lat: 20.0312607, lng: -155.3492006 },
  { name: "Lex brodie tire Co. Pahoa", address: "15-2660 Keaau-Pahoa Road, Pahoa HI 96778", phone: "(808) 965-9125", lat: 19.5050397, lng: -154.9588343 },
  { name: "Paul's Repair Service", address: "15-2992 Pahoa Village Rd, Pahoa HI 96778", phone: "(808) 965-8386", lat: 19.4936224, lng: -154.9440872 }
];

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

let userLocation = null;

// DOM elements
const locateBtn = document.getElementById('locateBtn');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const stationListEl = document.getElementById('stationList');

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

// Find nearest stations
function findNearestStations(userLat, userLng, limit = 6) {
  const stationsWithDistance = safetyStations.map(station => ({
    ...station,
    distance: calculateDistance(userLat, userLng, station.lat, station.lng)
  }));

  return stationsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, limit);
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
      <div>
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
      </div>
      <div class="distance">${station.distance.toFixed(1)} mi</div>
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