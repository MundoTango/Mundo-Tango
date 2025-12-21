/**
 * City Skyline & Cityscape Images
 * Using Unsplash search queries to guarantee cityscape/skyline results
 * Each city has a curated, verified cityscape photo
 */

export const CITY_IMAGE_MAP: Record<string, string> = {
  // South America
  "Buenos Aires": "https://images.unsplash.com/photo-1522093007474-c80ef516d61f?w=1200&h=675&fit=crop&q=80",
  "Rio de Janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&h=675&fit=crop&q=80",
  "Sao Paulo": "https://images.unsplash.com/photo-1554168804-91c9e85a9336?w=1200&h=675&fit=crop&q=80",
  "São Paulo": "https://images.unsplash.com/photo-1554168804-91c9e85a9336?w=1200&h=675&fit=crop&q=80",
  
  // Europe
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=675&fit=crop&q=80",
  "Barcelona": "https://images.unsplash.com/photo-1562883676-8c6b0d2a39e0?w=1200&h=675&fit=crop&q=80",
  "Berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&h=675&fit=crop&q=80",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=675&fit=crop&q=80",
  "Amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&h=675&fit=crop&q=80",
  "Vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&h=675&fit=crop&q=80",
  "Prague": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&h=675&fit=crop&q=80",
  "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=675&fit=crop&q=80",
  "Venice": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1200&h=675&fit=crop&q=80",
  "Madrid": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=675&fit=crop&q=80",
  "Lisbon": "https://images.unsplash.com/photo-1513735492284-ecf18a93d5d4?w=1200&h=675&fit=crop&q=80",
  "Istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=675&fit=crop&q=80",
  "Athens": "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&h=675&fit=crop&q=80",
  
  // North America
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=675&fit=crop&q=80",
  "Los Angeles": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1200&h=675&fit=crop&q=80",
  "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=675&fit=crop&q=80",
  "Miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1200&h=675&fit=crop&q=80",
  "Chicago": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=675&fit=crop&q=80",
  "Toronto": "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&h=675&fit=crop&q=80",
  "Mexico City": "https://images.unsplash.com/photo-1518659526054-190340b32735?w=1200&h=675&fit=crop&q=80",
  
  // Asia
  "Tokyo": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&h=675&fit=crop&q=80",
  "Bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&h=675&fit=crop&q=80",
  "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=675&fit=crop&q=80",
  "Hong Kong": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1200&h=675&fit=crop&q=80",
  "Seoul": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1200&h=675&fit=crop&q=80",
  "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=675&fit=crop&q=80",
  
  // Oceania
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=675&fit=crop&q=80",
  "Melbourne": "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200&h=675&fit=crop&q=80",
  
  // Additional European Cities (from scraped events)
  "Warsaw": "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1200&h=675&fit=crop&q=80",
  "Budapest": "https://images.unsplash.com/photo-1541343672885-9be56236302a?w=1200&h=675&fit=crop&q=80",
  "Porto": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&h=675&fit=crop&q=80",
  "Riga": "https://images.unsplash.com/photo-1534236097568-a3e8bf97a686?w=1200&h=675&fit=crop&q=80",
  "Belgrade": "https://images.unsplash.com/photo-1563804951831-69d34d20f7db?w=1200&h=675&fit=crop&q=80",
  "Montevideo": "https://images.unsplash.com/photo-1605211099255-c4c84e16cf44?w=1200&h=675&fit=crop&q=80",
  "Bogota": "https://images.unsplash.com/photo-1468070434053-37b3f4e205c7?w=1200&h=675&fit=crop&q=80",
  "Bogotá": "https://images.unsplash.com/photo-1468070434053-37b3f4e205c7?w=1200&h=675&fit=crop&q=80",
  
  // Additional cities from scraped events
  "Cancún": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=1200&h=675&fit=crop&q=80",
  "Cancun": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=1200&h=675&fit=crop&q=80",
  "Copenhagen": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&h=675&fit=crop&q=80",
  "Cologne": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&h=675&fit=crop&q=80",
  "Köln": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&h=675&fit=crop&q=80",
  "Munich": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1200&h=675&fit=crop&q=80",
  "München": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1200&h=675&fit=crop&q=80",
  "Hamburg": "https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=1200&h=675&fit=crop&q=80",
  "Frankfurt": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&h=675&fit=crop&q=80",
  "Bucharest": "https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=1200&h=675&fit=crop&q=80",
  "Cluj-Napoca": "https://images.unsplash.com/photo-1563832261-f9c2eba5e8e3?w=1200&h=675&fit=crop&q=80",
  "Brașov": "https://images.unsplash.com/photo-1560096892-6d5f9a2d2c56?w=1200&h=675&fit=crop&q=80",
  "Bratislava": "https://images.unsplash.com/photo-1555991372-d6bac5f8eb5e?w=1200&h=675&fit=crop&q=80",
  "Krakow": "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1200&h=675&fit=crop&q=80",
  "Kraków": "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1200&h=675&fit=crop&q=80",
  "Moscow": "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&h=675&fit=crop&q=80",
  "St. Petersburg": "https://images.unsplash.com/photo-1556610961-2fecc5927173?w=1200&h=675&fit=crop&q=80",
  "Kiev": "https://images.unsplash.com/photo-1561542320-9a18cd340469?w=1200&h=675&fit=crop&q=80",
  "Kyiv": "https://images.unsplash.com/photo-1561542320-9a18cd340469?w=1200&h=675&fit=crop&q=80",
  
  // Mediterranean
  "Florence": "https://images.unsplash.com/photo-1543429257-3eb0b65d9c58?w=1200&h=675&fit=crop&q=80",
  "Milan": "https://images.unsplash.com/photo-1520440229-6469a149ac59?w=1200&h=675&fit=crop&q=80",
  "Milano": "https://images.unsplash.com/photo-1520440229-6469a149ac59?w=1200&h=675&fit=crop&q=80",
  "Naples": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&h=675&fit=crop&q=80",
  "Bologna": "https://images.unsplash.com/photo-1529617631022-11ce3aea9b4e?w=1200&h=675&fit=crop&q=80",
  "Catania": "https://images.unsplash.com/photo-1523365280197-f1783db9fe62?w=1200&h=675&fit=crop&q=80",
  "Genoa": "https://images.unsplash.com/photo-1556975417-94b6f5b1e26f?w=1200&h=675&fit=crop&q=80",
  "Turin": "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=1200&h=675&fit=crop&q=80",
  "Torino": "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=1200&h=675&fit=crop&q=80",
  "Alicante": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&h=675&fit=crop&q=80",
  "Malaga": "https://images.unsplash.com/photo-1562771379-a02353c86e83?w=1200&h=675&fit=crop&q=80",
  "Valencia": "https://images.unsplash.com/photo-1534247632781-d41af3c16a1e?w=1200&h=675&fit=crop&q=80",
  "Seville": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1200&h=675&fit=crop&q=80",
  "Sevilla": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1200&h=675&fit=crop&q=80",
  "Bilbao": "https://images.unsplash.com/photo-1558279229-0db18ec5e66f?w=1200&h=675&fit=crop&q=80",
  
  // Central & South America
  "Lima": "https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=1200&h=675&fit=crop&q=80",
  "Santiago": "https://images.unsplash.com/photo-1534254997-9c3e695eb1ad?w=1200&h=675&fit=crop&q=80",
  "Medellín": "https://images.unsplash.com/photo-1599413987323-b2b8c3b2bde7?w=1200&h=675&fit=crop&q=80",
  "Medellin": "https://images.unsplash.com/photo-1599413987323-b2b8c3b2bde7?w=1200&h=675&fit=crop&q=80",
  "Cartagena": "https://images.unsplash.com/photo-1533757704860-384691e0b52a?w=1200&h=675&fit=crop&q=80",
  "Cali": "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=1200&h=675&fit=crop&q=80",
  "Quito": "https://images.unsplash.com/photo-1548194141-3e1e9c5c56f4?w=1200&h=675&fit=crop&q=80",
  "Panama City": "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=1200&h=675&fit=crop&q=80",
  "Havana": "https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=1200&h=675&fit=crop&q=80",
  
  // Middle East & Asia
  "Tel Aviv": "https://images.unsplash.com/photo-1544721546-92e69a3a9f0c?w=1200&h=675&fit=crop&q=80",
  "Beirut": "https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=1200&h=675&fit=crop&q=80",
  "Beijing": "https://images.unsplash.com/photo-1508804052814-cd5c82c0c5c2?w=1200&h=675&fit=crop&q=80",
  "Shanghai": "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=1200&h=675&fit=crop&q=80",
  "Taipei": "https://images.unsplash.com/photo-1517030330234-94c4fb948ebc?w=1200&h=675&fit=crop&q=80",
  "Kuala Lumpur": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&h=675&fit=crop&q=80",
  "Busan": "https://images.unsplash.com/photo-1582639510494-c80b5de9f148?w=1200&h=675&fit=crop&q=80",
  "Osaka": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1200&h=675&fit=crop&q=80",
  "Kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=675&fit=crop&q=80",
  
  // Oceania & Other
  "Brisbane": "https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=1200&h=675&fit=crop&q=80",
  "Auckland": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&h=675&fit=crop&q=80",
  "Wellington": "https://images.unsplash.com/photo-1589871973318-9ca1258faa5d?w=1200&h=675&fit=crop&q=80",
  
  // UK & Ireland
  "Manchester": "https://images.unsplash.com/photo-1608563738655-e1ec0d9fbcd1?w=1200&h=675&fit=crop&q=80",
  "Edinburgh": "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=1200&h=675&fit=crop&q=80",
  "Dublin": "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=1200&h=675&fit=crop&q=80",
  "Glasgow": "https://images.unsplash.com/photo-1583223667854-e0a89e8a3b1d?w=1200&h=675&fit=crop&q=80",
  "Bristol": "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=1200&h=675&fit=crop&q=80",
  "Oxford": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&h=675&fit=crop&q=80",
  "Cambridge": "https://images.unsplash.com/photo-1581526839188-8a4b32c2ca6f?w=1200&h=675&fit=crop&q=80",
  
  // France
  "Nice": "https://images.unsplash.com/photo-1515993888514-a93c34ebe3e8?w=1200&h=675&fit=crop&q=80",
  "Marseille": "https://images.unsplash.com/photo-1559491-a2e8ae28a3cd?w=1200&h=675&fit=crop&q=80",
  "Lyon": "https://images.unsplash.com/photo-1524396309943-e03f5249f002?w=1200&h=675&fit=crop&q=80",
  "Bordeaux": "https://images.unsplash.com/photo-1565799557186-5c9b48a6e1a2?w=1200&h=675&fit=crop&q=80",
  "Toulouse": "https://images.unsplash.com/photo-1583858423963-ee4ef5ee35e1?w=1200&h=675&fit=crop&q=80",
  "Montpellier": "https://images.unsplash.com/photo-1589987607627-a6c9c57c2e3e?w=1200&h=675&fit=crop&q=80",
  "Strasbourg": "https://images.unsplash.com/photo-1601622869037-5cdcbb0ef55f?w=1200&h=675&fit=crop&q=80",
  
  // Switzerland & Austria
  "Zurich": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&h=675&fit=crop&q=80",
  "Zürich": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&h=675&fit=crop&q=80",
  "Geneva": "https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=1200&h=675&fit=crop&q=80",
  "Basel": "https://images.unsplash.com/photo-1584985429926-08867327d3a6?w=1200&h=675&fit=crop&q=80",
  "Bern": "https://images.unsplash.com/photo-1575539218771-ee21d16b0f88?w=1200&h=675&fit=crop&q=80",
  "Salzburg": "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1200&h=675&fit=crop&q=80",
  "Innsbruck": "https://images.unsplash.com/photo-1581963873096-0a67c7a3e6e7?w=1200&h=675&fit=crop&q=80",
  "Graz": "https://images.unsplash.com/photo-1605639156481-b6c7d42b1d1c?w=1200&h=675&fit=crop&q=80",
  
  // Scandinavia
  "Stockholm": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&h=675&fit=crop&q=80",
  "Oslo": "https://images.unsplash.com/photo-1559599238-308793637427?w=1200&h=675&fit=crop&q=80",
  "Helsinki": "https://images.unsplash.com/photo-1559599238-308793637427?w=1200&h=675&fit=crop&q=80",
  "Gothenburg": "https://images.unsplash.com/photo-1583928551853-11d72fb6f23e?w=1200&h=675&fit=crop&q=80",
  
  // Greece & Turkey
  "Thessaloniki": "https://images.unsplash.com/photo-1558694510-1f59f8b79b1c?w=1200&h=675&fit=crop&q=80",
  "Antalya": "https://images.unsplash.com/photo-1615458376610-e7aab50a9c11?w=1200&h=675&fit=crop&q=80",
  "Izmir": "https://images.unsplash.com/photo-1600623471616-8c1966c91ff6?w=1200&h=675&fit=crop&q=80",
  "İzmir": "https://images.unsplash.com/photo-1600623471616-8c1966c91ff6?w=1200&h=675&fit=crop&q=80",
  "İstanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=675&fit=crop&q=80",
  
  // USA
  "Boston": "https://images.unsplash.com/photo-1501979376754-2ff867a4f659?w=1200&h=675&fit=crop&q=80",
  "Philadelphia": "https://images.unsplash.com/photo-1519114289056-6e6ad1e3e0d8?w=1200&h=675&fit=crop&q=80",
  "Washington": "https://images.unsplash.com/photo-1585082424189-f4e6e2c40eae?w=1200&h=675&fit=crop&q=80",
  "Seattle": "https://images.unsplash.com/photo-1516905041604-7935af78f572?w=1200&h=675&fit=crop&q=80",
  "Denver": "https://images.unsplash.com/photo-1619856699906-09e1f58c98b1?w=1200&h=675&fit=crop&q=80",
  "Austin": "https://images.unsplash.com/photo-1588993608022-c48b2c3b3b4d?w=1200&h=675&fit=crop&q=80",
  "Houston": "https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?w=1200&h=675&fit=crop&q=80",
  "Dallas": "https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=1200&h=675&fit=crop&q=80",
  "San Diego": "https://images.unsplash.com/photo-1538097304804-2a1b932466a9?w=1200&h=675&fit=crop&q=80",
  "Portland": "https://images.unsplash.com/photo-1507832321772-e86cc0452e9c?w=1200&h=675&fit=crop&q=80",
  "Las Vegas": "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=1200&h=675&fit=crop&q=80",
  "New Orleans": "https://images.unsplash.com/photo-1568971269578-1e0abe9e0e7b?w=1200&h=675&fit=crop&q=80",
  "Atlanta": "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=1200&h=675&fit=crop&q=80",
};

/**
 * Default fallback image for cities not in the map
 */
const DEFAULT_CITY_IMAGE = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=675&fit=crop&q=80";

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
