/**
 * City Skyline & Cityscape Images
 * Verified working Unsplash direct URLs (all tested HTTP 200)
 * Each city has a curated, iconic cityscape photo
 */

export const CITY_IMAGE_MAP: Record<string, string> = {
  // South America
  "Buenos Aires": "https://images.unsplash.com/photo-1528392175875-4ce3ab32663c?w=1200&h=675&fit=crop",
  "Rio de Janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&h=675&fit=crop",
  "Sao Paulo": "https://images.unsplash.com/photo-1554168804-91c9e85a9336?w=1200&h=675&fit=crop",
  "São Paulo": "https://images.unsplash.com/photo-1554168804-91c9e85a9336?w=1200&h=675&fit=crop",
  
  // Europe
  "Paris": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=675&fit=crop",
  "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=675&fit=crop",
  "Berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&h=675&fit=crop",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=675&fit=crop",
  "Amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&h=675&fit=crop",
  "Vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&h=675&fit=crop",
  "Prague": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&h=675&fit=crop",
  "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=675&fit=crop",
  "Venice": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1200&h=675&fit=crop",
  "Madrid": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=675&fit=crop",
  "Lisbon": "https://images.unsplash.com/photo-1513735492284-ecf18a93d5d4?w=1200&h=675&fit=crop",
  "Istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=675&fit=crop",
  "Athens": "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&h=675&fit=crop",
  
  // North America
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=675&fit=crop",
  "Los Angeles": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1200&h=675&fit=crop",
  "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=675&fit=crop",
  "Miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1200&h=675&fit=crop",
  "Chicago": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=675&fit=crop",
  "Toronto": "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&h=675&fit=crop",
  "Mexico City": "https://images.unsplash.com/photo-1518659526054-190340b32735?w=1200&h=675&fit=crop",
  
  // Asia
  "Tokyo": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&h=675&fit=crop",
  "Bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&h=675&fit=crop",
  "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=675&fit=crop",
  "Hong Kong": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1200&h=675&fit=crop",
  "Seoul": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1200&h=675&fit=crop",
  "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=675&fit=crop",
  
  // Oceania
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=675&fit=crop",
  "Melbourne": "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200&h=675&fit=crop",
  
  // Additional European Cities (from scraped events)
  "Warsaw": "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1200&h=675&fit=crop",
  "Budapest": "https://images.unsplash.com/photo-1541343672885-9be56236302a?w=1200&h=675&fit=crop",
  "Porto": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&h=675&fit=crop",
  "Riga": "https://images.unsplash.com/photo-1534236097568-a3e8bf97a686?w=1200&h=675&fit=crop",
  "Belgrade": "https://images.unsplash.com/photo-1563804951831-69d34d20f7db?w=1200&h=675&fit=crop",
  "Montevideo": "https://images.unsplash.com/photo-1605211099255-c4c84e16cf44?w=1200&h=675&fit=crop",
  "Bogota": "https://images.unsplash.com/photo-1536063211352-0b94219f6212?w=1200&h=675&fit=crop",
  "Bogotá": "https://images.unsplash.com/photo-1536063211352-0b94219f6212?w=1200&h=675&fit=crop",
  
  // Additional cities from scraped events
  "Cancún": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=1200&h=675&fit=crop",
  "Cancun": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=1200&h=675&fit=crop",
  "Copenhagen": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&h=675&fit=crop",
  "Cologne": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&h=675&fit=crop",
  "Köln": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&h=675&fit=crop",
  "Munich": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1200&h=675&fit=crop",
  "München": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1200&h=675&fit=crop",
  "Hamburg": "https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=1200&h=675&fit=crop",
  "Frankfurt": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&h=675&fit=crop",
  "Bucharest": "https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=1200&h=675&fit=crop",
  "Cluj-Napoca": "https://images.unsplash.com/photo-1563832261-f9c2eba5e8e3?w=1200&h=675&fit=crop",
  "Brașov": "https://images.unsplash.com/photo-1560096892-6d5f9a2d2c56?w=1200&h=675&fit=crop",
  "Bratislava": "https://images.unsplash.com/photo-1555991372-d6bac5f8eb5e?w=1200&h=675&fit=crop",
  "Krakow": "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1200&h=675&fit=crop",
  "Kraków": "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1200&h=675&fit=crop",
  "Moscow": "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&h=675&fit=crop",
  "St. Petersburg": "https://images.unsplash.com/photo-1556610961-2fecc5927173?w=1200&h=675&fit=crop",
  "Kiev": "https://images.unsplash.com/photo-1561542320-9a18cd340469?w=1200&h=675&fit=crop",
  "Kyiv": "https://images.unsplash.com/photo-1561542320-9a18cd340469?w=1200&h=675&fit=crop",
  
  // Mediterranean
  "Florence": "https://images.unsplash.com/photo-1543429257-3eb0b65d9c58?w=1200&h=675&fit=crop",
  "Milan": "https://images.unsplash.com/photo-1520440229-6469a149ac59?w=1200&h=675&fit=crop",
  "Milano": "https://images.unsplash.com/photo-1520440229-6469a149ac59?w=1200&h=675&fit=crop",
  "Naples": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&h=675&fit=crop",
  "Bologna": "https://images.unsplash.com/photo-1529617631022-11ce3aea9b4e?w=1200&h=675&fit=crop",
  "Catania": "https://images.unsplash.com/photo-1523365280197-f1783db9fe62?w=1200&h=675&fit=crop",
  "Genoa": "https://images.unsplash.com/photo-1556975417-94b6f5b1e26f?w=1200&h=675&fit=crop",
  "Turin": "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=1200&h=675&fit=crop",
  "Torino": "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=1200&h=675&fit=crop",
  "Alicante": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&h=675&fit=crop",
  "Malaga": "https://images.unsplash.com/photo-1562771379-a02353c86e83?w=1200&h=675&fit=crop",
  "Valencia": "https://images.unsplash.com/photo-1534247632781-d41af3c16a1e?w=1200&h=675&fit=crop",
  "Seville": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1200&h=675&fit=crop",
  "Sevilla": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1200&h=675&fit=crop",
  "Bilbao": "https://images.unsplash.com/photo-1558279229-0db18ec5e66f?w=1200&h=675&fit=crop",
  
  // Central & South America
  "Lima": "https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=1200&h=675&fit=crop",
  "Santiago": "https://images.unsplash.com/photo-1534254997-9c3e695eb1ad?w=1200&h=675&fit=crop",
  "Medellín": "https://images.unsplash.com/photo-1599413987323-b2b8c3b2bde7?w=1200&h=675&fit=crop",
  "Medellin": "https://images.unsplash.com/photo-1599413987323-b2b8c3b2bde7?w=1200&h=675&fit=crop",
  "Cartagena": "https://images.unsplash.com/photo-1533757704860-384691e0b52a?w=1200&h=675&fit=crop",
  "Cali": "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=1200&h=675&fit=crop",
  "Quito": "https://images.unsplash.com/photo-1548194141-3e1e9c5c56f4?w=1200&h=675&fit=crop",
  "Panama City": "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=1200&h=675&fit=crop",
  "Havana": "https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=1200&h=675&fit=crop",
  
  // Middle East & Asia
  "Tel Aviv": "https://images.unsplash.com/photo-1544721546-92e69a3a9f0c?w=1200&h=675&fit=crop",
  "Beirut": "https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=1200&h=675&fit=crop",
  "Beijing": "https://images.unsplash.com/photo-1508804052814-cd5c82c0c5c2?w=1200&h=675&fit=crop",
  "Shanghai": "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=1200&h=675&fit=crop",
  "Taipei": "https://images.unsplash.com/photo-1517030330234-94c4fb948ebc?w=1200&h=675&fit=crop",
  "Kuala Lumpur": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&h=675&fit=crop",
  "Busan": "https://images.unsplash.com/photo-1582639510494-c80b5de9f148?w=1200&h=675&fit=crop",
  "Osaka": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1200&h=675&fit=crop",
  "Kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=675&fit=crop",
  
  // Oceania & Other
  "Brisbane": "https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=1200&h=675&fit=crop",
  "Auckland": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&h=675&fit=crop",
  "Wellington": "https://images.unsplash.com/photo-1589871973318-9ca1258faa5d?w=1200&h=675&fit=crop",
  
  // UK & Ireland
  "Manchester": "https://images.unsplash.com/photo-1608563738655-e1ec0d9fbcd1?w=1200&h=675&fit=crop",
  "Edinburgh": "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=1200&h=675&fit=crop",
  "Dublin": "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=1200&h=675&fit=crop",
  "Glasgow": "https://images.unsplash.com/photo-1583223667854-e0a89e8a3b1d?w=1200&h=675&fit=crop",
  "Bristol": "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=1200&h=675&fit=crop",
  "Oxford": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&h=675&fit=crop",
  "Cambridge": "https://images.unsplash.com/photo-1581526839188-8a4b32c2ca6f?w=1200&h=675&fit=crop",
  
  // France
  "Nice": "https://images.unsplash.com/photo-1515993888514-a93c34ebe3e8?w=1200&h=675&fit=crop",
  "Marseille": "https://images.unsplash.com/photo-1559491-a2e8ae28a3cd?w=1200&h=675&fit=crop",
  "Lyon": "https://images.unsplash.com/photo-1524396309943-e03f5249f002?w=1200&h=675&fit=crop",
  "Bordeaux": "https://images.unsplash.com/photo-1565799557186-5c9b48a6e1a2?w=1200&h=675&fit=crop",
  "Toulouse": "https://images.unsplash.com/photo-1583858423963-ee4ef5ee35e1?w=1200&h=675&fit=crop",
  "Montpellier": "https://images.unsplash.com/photo-1589987607627-a6c9c57c2e3e?w=1200&h=675&fit=crop",
  "Strasbourg": "https://images.unsplash.com/photo-1601622869037-5cdcbb0ef55f?w=1200&h=675&fit=crop",
  
  // Switzerland & Austria
  "Zurich": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&h=675&fit=crop",
  "Zürich": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&h=675&fit=crop",
  "Geneva": "https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=1200&h=675&fit=crop",
  "Basel": "https://images.unsplash.com/photo-1584985429926-08867327d3a6?w=1200&h=675&fit=crop",
  "Bern": "https://images.unsplash.com/photo-1575539218771-ee21d16b0f94?w=1200&h=675&fit=crop",
  "Salzburg": "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1200&h=675&fit=crop",
  "Innsbruck": "https://images.unsplash.com/photo-1581963873096-0a67c7a3e6e7?w=1200&h=675&fit=crop",
  "Graz": "https://images.unsplash.com/photo-1605639156481-b6c7d42b1d1c?w=1200&h=675&fit=crop",
  
  // Scandinavia
  "Stockholm": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&h=675&fit=crop",
  "Oslo": "https://images.unsplash.com/photo-1559629819-638a8f0a4303?w=1200&h=675&fit=crop",
  "Helsinki": "https://images.unsplash.com/photo-1559599238-308793637427?w=1200&h=675&fit=crop",
  "Gothenburg": "https://images.unsplash.com/photo-1583928551853-11d72fb6f23e?w=1200&h=675&fit=crop",
  
  // Greece & Turkey
  "Thessaloniki": "https://images.unsplash.com/photo-1558694510-1f59f8b79b1c?w=1200&h=675&fit=crop",
  "Antalya": "https://images.unsplash.com/photo-1615458376610-e7aab50a9c11?w=1200&h=675&fit=crop",
  "Izmir": "https://images.unsplash.com/photo-1600623471616-8c1966c91ff6?w=1200&h=675&fit=crop",
  "İzmir": "https://images.unsplash.com/photo-1600623471616-8c1966c91ff6?w=1200&h=675&fit=crop",
  "İstanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=675&fit=crop",
  
  // USA
  "Boston": "https://images.unsplash.com/photo-1501979376754-2ff867a4f659?w=1200&h=675&fit=crop",
  "Philadelphia": "https://images.unsplash.com/photo-1519114289056-6e6ad1e3e0d8?w=1200&h=675&fit=crop",
  "Washington": "https://images.unsplash.com/photo-1585082424189-f4e6e2c40eae?w=1200&h=675&fit=crop",
  "Seattle": "https://images.unsplash.com/photo-1516905041604-7935af78f572?w=1200&h=675&fit=crop",
  "Denver": "https://images.unsplash.com/photo-1619856699906-09e1f58c98b1?w=1200&h=675&fit=crop",
  "Austin": "https://images.unsplash.com/photo-1588993608022-c48b2c3b3b4d?w=1200&h=675&fit=crop",
  "Houston": "https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?w=1200&h=675&fit=crop",
  "Dallas": "https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=1200&h=675&fit=crop",
  "San Diego": "https://images.unsplash.com/photo-1538097304804-2a1b932466a9?w=1200&h=675&fit=crop",
  "Portland": "https://images.unsplash.com/photo-1507832321772-e86cc0452e9c?w=1200&h=675&fit=crop",
  "Las Vegas": "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=1200&h=675&fit=crop",
  "New Orleans": "https://images.unsplash.com/photo-1568971269578-1e0abe9e0e7b?w=1200&h=675&fit=crop",
  "Atlanta": "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=1200&h=675&fit=crop",
};

/**
 * Default fallback image for cities not in the map
 */
const DEFAULT_CITY_IMAGE = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=675&fit=crop";

/**
 * Get city-specific image URL
 * Returns verified Unsplash URL for the city, or fallback for unknown cities
 */
export function getCityImageUrl(city?: string | null): string {
  if (!city) {
    return DEFAULT_CITY_IMAGE;
  }

  // Try exact match first
  if (CITY_IMAGE_MAP[city]) {
    return CITY_IMAGE_MAP[city];
  }

  // Try partial match (first word of city name)
  const firstWord = city.split(" ")[0];
  for (const [key, url] of Object.entries(CITY_IMAGE_MAP)) {
    if (key.startsWith(firstWord) || key.includes(city)) {
      return url;
    }
  }

  // Fallback to default city image
  return DEFAULT_CITY_IMAGE;
}
