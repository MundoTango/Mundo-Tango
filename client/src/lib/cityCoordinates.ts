/**
 * Centralized city coordinates for all map components
 * Single source of truth for 280+ tango cities worldwide
 * 
 * Usage:
 *   import { getCityCoordinates, BUENOS_AIRES_DEFAULT } from '@/lib/cityCoordinates';
 *   const coords = getCityCoordinates('Berlin'); // [52.52, 13.405]
 */

export const BUENOS_AIRES_DEFAULT: [number, number] = [-34.6037, -58.3816];

export const cityCoordinates: Record<string, [number, number]> = {
  // ==================== AMERICAS ====================
  // Argentina
  'Buenos Aires': [-34.6037, -58.3816],
  'Villa María': [-32.4073, -63.2427],
  
  // Brazil
  'São Paulo': [-23.5505, -46.6333],
  'Rio de Janeiro': [-22.9068, -43.1729],
  
  // Chile
  'San Pedro de la Paz': [-36.8526, -73.1069],
  'Santiago de Compostela': [42.8782, -8.5448],
  
  // Colombia
  'Bogotá': [4.7110, -74.0721],
  
  // Mexico
  'Cancún': [21.1619, -86.8515],
  'Mérida': [20.9674, -89.5926],
  'Ajijic': [20.2939, -103.2581],
  
  // Uruguay
  'Montevideo': [-34.9011, -56.1645],
  
  // USA - California
  'San Francisco': [37.7749, -122.4194],
  'Los Angeles': [34.0522, -118.2437],
  'Sacramento': [38.5816, -121.4944],
  'San Diego': [32.7157, -117.1611],
  'San Jose': [37.3382, -121.8863],
  'Berkeley': [37.8716, -122.2727],
  'Palo Alto': [37.4419, -122.1430],
  'Carmel': [36.5552, -121.9233],
  'Pacific Grove': [36.6177, -121.9166],
  'Larkspur': [37.9341, -122.5353],
  'Danville': [37.8216, -121.9999],
  'Emeryville': [37.8313, -122.2852],
  'Livermore': [37.6819, -121.7680],
  'Marin': [37.9735, -122.5311],
  'Irvine': [33.6846, -117.8265],
  'Kensington': [37.9102, -122.2802],
  
  // USA - East Coast
  'New York': [40.7128, -74.0060],
  'Boston': [42.3601, -71.0589],
  'Philadelphia': [39.9526, -75.1652],
  'Miami': [25.7617, -80.1918],
  'Cambridge': [42.3736, -71.1097],
  'Brookline': [42.3318, -71.1212],
  'Newton': [42.3370, -71.2092],
  'Somerville': [42.3876, -71.0995],
  
  // USA - Other
  'Spokane': [47.6588, -117.4260],
  'Portland': [45.5152, -122.6784],
  
  // Canada
  'Toronto': [43.6532, -79.3832],
  'Vancouver': [49.2827, -123.1207],
  'Quebec City': [46.8139, -71.2080],
  'Mississauga': [43.5890, -79.6441],
  'Neuville': [46.6978, -71.5833],
  
  // ==================== EUROPE ====================
  // UK & Ireland
  'London': [51.5074, -0.1278],
  'Cambridge, UK': [52.2053, 0.1218],
  'Cheltenham': [51.8994, -2.0783],
  'Felixstowe': [51.9617, 1.3513],
  'Paisley': [55.8456, -4.4239],
  'Bray': [53.2008, -6.0986],
  'Maynooth': [53.3815, -6.5916],
  
  // Germany
  'Berlin': [52.5200, 13.4050],
  'Munich': [48.1351, 11.5820],
  'Frankfurt': [50.1109, 8.6821],
  'Frankfurt am Main': [50.1109, 8.6821],
  'Hamburg': [53.5511, 9.9937],
  'Karlsruhe': [49.0069, 8.4037],
  'Cologne': [50.9375, 6.9603],
  'Keulen': [50.9375, 6.9603],
  'Dresden': [51.0504, 13.7373],
  'Bremen': [53.0793, 8.8017],
  'Heidelberg': [49.3988, 8.6724],
  'Darmstadt': [49.8728, 8.6512],
  'Ludwigshafen': [49.4774, 8.4452],
  'Magdeburg': [52.1205, 11.6276],
  'Saarbrücken': [49.2402, 6.9969],
  'Aschaffenburg': [49.9769, 9.1580],
  'Goch': [51.6772, 6.1600],
  'Witten': [51.4433, 7.3347],
  'Wuppertal': [51.2562, 7.1508],
  'Mönchengladbach': [51.1805, 6.4428],
  'Gaimersheim': [48.8089, 11.3697],
  'Manching': [48.7167, 11.5167],
  'Cham': [49.2230, 12.6619],
  'Kirchdorf': [48.0667, 14.1167],
  // German regions
  'Baden-Württemberg': [48.6616, 9.3501],
  'Nordrhein-Westfalen': [51.4332, 7.6616],
  'North Bavaria': [49.4521, 11.0767],
  'Ostsee': [54.1839, 12.0955],
  'Lake Constance': [47.6583, 9.1750],
  
  // Austria
  'Vienna': [48.2082, 16.3738],
  'Wien': [48.2082, 16.3738],
  'Salzburg': [47.8095, 13.0550],
  'Baden bei Wien': [48.0069, 16.2310],
  'Reichenau an der Rax': [47.7000, 15.8500],
  'Reichenau/Rax': [47.7000, 15.8500],
  
  // France
  'Paris': [48.8566, 2.3522],
  'Lyon': [45.7640, 4.8357],
  'Marseille': [43.2965, 5.3698],
  'Toulouse': [43.6047, 1.4442],
  'Cannes': [43.5528, 7.0174],
  'Montpellier': [43.6108, 3.8767],
  'Biarritz': [43.4832, -1.5586],
  'Perpignan': [42.6887, 2.8948],
  'Tours': [47.3941, 0.6848],
  'Crespin': [50.3667, 3.6667],
  'Arbois': [46.9031, 5.7742],
  'Carry-le-Rouet': [43.3306, 5.1528],
  'Hyères': [43.1203, 6.1286],
  'Langeais': [47.3247, 0.4064],
  'Sarzeau': [47.5278, -2.7689],
  'Sète': [43.4028, 3.6967],
  'Vannes': [47.6586, -2.7600],
  'Rieux': [43.2500, 1.2000],
  'Saint-Ouen-de-Thouberville': [49.3667, 0.8833],
  'Sarrebourg': [48.7356, 7.0531],
  'Moustiers-Sainte-Marie': [43.8456, 6.2211],
  'Noirmoutier-en-l\'Île': [46.9986, -2.2453],
  
  // Switzerland
  'Zürich': [47.3769, 8.5417],
  'Geneva': [46.2044, 6.1432],
  'Basel': [47.5596, 7.5886],
  'Lausanne': [46.5197, 6.6323],
  'Diessenhofen': [47.6894, 8.7539],
  'Walkringen': [46.9500, 7.6167],
  
  // Italy
  'Milan': [45.4642, 9.1900],
  'Rome': [41.9028, 12.4964],
  'Naples': [40.8518, 14.2681],
  'Turin': [45.0703, 7.6869],
  'Venice': [45.4408, 12.3155],
  'Bologna': [44.4949, 11.3426],
  'Genoa': [44.4056, 8.9463],
  'Siena': [43.3188, 11.3308],
  'Verona': [45.4384, 10.9916],
  'Trieste': [45.6495, 13.7768],
  'Palermo': [38.1157, 13.3615],
  'Catania': [37.5079, 15.0830],
  'Bari': [41.1171, 16.8719],
  'Perugia': [43.1107, 12.3908],
  'Cagliari': [39.2238, 9.1217],
  'Ravenna': [44.4184, 12.2035],
  'Rimini': [44.0678, 12.5695],
  'Mantua': [45.1564, 10.7914],
  'Lecce': [40.3516, 18.1718],
  'Matera': [40.6664, 16.6043],
  'Ascoli Piceno': [42.8536, 13.5750],
  'Baveno': [45.9089, 8.5019],
  'Bagheria': [38.0828, 13.5097],
  'Capaccio': [40.4228, 15.0839],
  'Paestum': [40.4228, 15.0039],
  'Casal Borsetti': [44.5333, 12.2833],
  'Castel San Pietro Terme': [44.3972, 11.5922],
  'Castro Marina': [39.9833, 18.4167],
  'Cattolica': [43.9617, 12.7392],
  'Cinisi': [38.1583, 13.1083],
  'Contursi Terme': [40.6500, 15.2333],
  'Druento': [45.1333, 7.5667],
  'Fermo': [43.1608, 13.7153],
  'Ischia': [40.7300, 13.9000],
  'La Morra': [44.6333, 7.9333],
  'Lipari': [38.4667, 14.9500],
  'Marzamemi': [36.7333, 15.1167],
  'Noci': [40.7936, 17.1294],
  'Pallanza': [45.9333, 8.5500],
  'Pizzo': [38.7333, 16.1667],
  'Procida': [40.7583, 14.0250],
  'Sestri Levante': [44.2694, 9.3933],
  'Trapani': [38.0174, 12.5365],
  'Vieste': [41.8817, 16.1767],
  
  // Spain
  'Madrid': [40.4168, -3.7038],
  'Barcelona': [41.3851, 2.1734],
  'Valencia': [39.4699, -0.3763],
  'Seville': [37.3891, -5.9845],
  'Bilbao': [43.2630, -2.9350],
  'Granada': [37.1773, -3.5986],
  'Málaga': [36.7213, -4.4214],
  'Murcia': [37.9922, -1.1307],
  'Zaragoza': [41.6488, -0.8891],
  'Santander': [43.4623, -3.8099],
  'Costa Brava': [41.8610, 3.0630],
  'Pamplona': [42.8125, -1.6458],
  'Valls': [41.2861, 1.2497],
  'Girona': [41.9794, 2.8214],
  'Altafulla': [41.1408, 1.3764],
  'Alicante': [38.3452, -0.4810],
  'Benidorm': [38.5411, -0.1225],
  'Calp': [38.6447, 0.0449],
  'Tossa de Mar': [41.7192, 2.9311],
  'O Grove': [42.4944, -8.8653],
  'Isla': [43.4833, -3.5333],
  'Noreña': [43.4200, -5.7100],
  
  // Portugal
  'Lisbon': [38.7223, -9.1393],
  'Porto': [41.1579, -8.6291],
  'Portimão': [37.1356, -8.5367],
  'Oeiras': [38.6914, -9.3117],
  'Monsaraz': [38.4428, -7.3800],
  'Ponta do Sol': [32.6833, -17.1000],
  
  // Netherlands
  'Amsterdam': [52.3676, 4.9041],
  'Rotterdam': [51.9244, 4.4777],
  'Leiden': [52.1601, 4.4970],
  'Utrecht': [52.0907, 5.1214],
  'Den Haag': [52.0705, 4.3007],
  'Eindhoven': [51.4416, 5.4697],
  'Maastricht': [50.8514, 5.6909],
  'Arnhem': [51.9851, 5.8987],
  'Almelo': [52.3567, 6.6625],
  'Amersfoort': [52.1561, 5.3878],
  'Enschede': [52.2215, 6.8937],
  'Heemstede': [52.3500, 4.6167],
  'Laren': [52.2578, 5.2283],
  'Overveen': [52.3986, 4.6083],
  'Sint Laurens': [51.5167, 3.6000],
  'Venlo': [51.3700, 6.1681],
  'Vught': [51.6500, 5.2833],
  
  // Belgium
  'Brussels': [50.8503, 4.3517],
  'Antwerpen': [51.2194, 4.4025],
  'Antwerp': [51.2194, 4.4025],
  'Ixelles': [50.8279, 4.3755],
  'Destelbergen': [51.0667, 3.8000],
  'Lommel': [51.2333, 5.3167],
  'Luik': [50.6326, 5.5797],
  'Antwerp, Brussels, Ghent': [50.9000, 4.0000],
  'Antwerpen, Destelbergen': [51.1500, 3.9000],
  
  // Poland
  'Warsaw': [52.2297, 21.0122],
  'Kraków': [50.0647, 19.9450],
  'Wrocław': [51.1079, 17.0385],
  'Poznań': [52.4064, 16.9252],
  'Łódź': [51.7592, 19.4560],
  'Olsztyn': [53.7799, 20.4942],
  'Kielce': [50.8661, 20.6286],
  'Rzeszów': [50.0412, 21.9991],
  'Sopot': [54.4418, 18.5601],
  'Zakopane': [49.2992, 19.9496],
  'Słupsk': [54.4641, 17.0285],
  'Szczawno-Zdrój': [50.7939, 16.2369],
  'Szczyrk': [49.7167, 19.0333],
  'Biała Podlaska': [52.0333, 23.1167],
  'Brzeg': [50.8608, 17.4686],
  'Bukowina Tatrzańska': [49.3417, 20.1083],
  'Grajów': [50.1000, 20.0833],
  'Jastrzębia Góra': [54.8333, 18.0667],
  'Karpacz': [50.7756, 15.7614],
  'Kików': [50.8167, 20.6167],
  'Kłodzko': [50.4344, 16.6614],
  'Krapkowice': [50.4747, 17.9656],
  'Międzybrodzie Bialskie': [49.7833, 19.0167],
  'Nieznanice': [50.7000, 19.1833],
  'Piechowice': [50.8667, 15.6000],
  'Pszów': [50.0500, 18.4167],
  'Smolec': [51.0500, 16.8833],
  'Szprotawa': [51.5667, 15.5333],
  'Wałbrzych': [50.7714, 16.2844],
  'Zabrze': [50.3249, 18.7857],
  'Żagań': [51.6167, 15.3167],
  
  // Czech Republic
  'Prague': [50.0755, 14.4378],
  'Brno': [49.1951, 16.6068],
  'Novy Jicin': [49.5944, 18.0103],
  'Znojmo': [48.8556, 16.0489],
  
  // Hungary
  'Budapest': [47.4979, 19.0402],
  'Siófok': [46.9086, 18.0483],
  'Székesfehérvár': [47.1860, 18.4221],
  'Röjtökmuzsaj': [47.5833, 16.8333],
  
  // Romania
  'Bucharest': [44.4268, 26.1025],
  'Cluj-Napoca': [46.7712, 23.6236],
  'Brașov': [45.6580, 25.6012],
  'Timișoara': [45.7489, 21.2087],
  'Iași': [47.1585, 27.6014],
  'Bușteni': [45.4167, 25.5333],
  
  // Greece
  'Athens': [37.9838, 23.7275],
  'Thessaloniki': [40.6401, 22.9444],
  'Patras': [38.2466, 21.7346],
  'Chania': [35.5138, 24.0180],
  'Alexandroupoli': [40.8475, 25.8744],
  'Rhodes': [36.4344, 28.2176],
  'Crete': [35.2401, 24.8093],
  'Lesbos Prefecture': [39.1833, 26.3333],
  'Neochori': [39.3167, 22.5833],
  'Samos': [37.7575, 26.9758],
  
  // Turkey
  'Istanbul': [41.0082, 28.9784],
  'İstanbul': [41.0082, 28.9784],
  'Antalya': [36.8969, 30.7133],
  'Kuşadası': [37.8579, 27.2610],
  'Marmaris': [36.8550, 28.2744],
  'Mudanya': [40.3833, 28.8833],
  'Nevşehir': [38.6244, 34.7239],
  'Pamukkale': [37.9167, 29.1167],
  'Şirince': [37.9444, 27.4256],
  
  // Baltics
  'Riga': [56.9496, 24.1052],
  'Tallinn': [59.4370, 24.7536],
  'Vilnius': [54.6872, 25.2797],
  'Liepāja': [56.5047, 21.0108],
  
  // Slovenia & Croatia
  'Ljubljana': [46.0569, 14.5058],
  'Laško': [46.1541, 15.2355],
  'Rogaška Slatina': [46.2372, 15.6397],
  'Veržej': [46.5833, 16.1667],
  'Split': [43.5081, 16.4402],
  'Dubrovnik': [42.6507, 18.0944],
  'Opatija': [45.3372, 14.3053],
  'Poreč': [45.2269, 13.5939],
  
  // Serbia, Bosnia, Montenegro, North Macedonia, Kosovo
  'Belgrade': [44.7866, 20.4489],
  'Sarajevo': [43.8563, 18.4131],
  'Kolašin': [42.8236, 19.5175],
  'Skopje': [41.9981, 21.4254],
  'Kraljevo': [43.7233, 20.6897],
  
  // Slovakia & Bulgaria
  'Bratislava': [48.1486, 17.1077],
  'Varna': [43.2141, 27.9147],
  
  // Scandinavia
  'Stockholm': [59.3293, 18.0686],
  'Oslo': [59.9139, 10.7522],
  'Copenhagen': [55.6761, 12.5683],
  'Helsinki': [60.1699, 24.9384],
  'Gothenburg': [57.7089, 11.9746],
  'Malmö': [55.6050, 13.0038],
  'Luleå': [65.5842, 22.1547],
  'Lomma': [55.6722, 13.0708],
  'Svendborg': [55.0594, 10.6069],
  
  // Russia & Ukraine & Georgia
  'Saint Petersburg': [59.9311, 30.3609],
  'Санкт-Петербург': [59.9311, 30.3609],
  'Kyiv': [50.4501, 30.5234],
  'Tbilisi': [41.7151, 44.8271],
  'Stepantsminda': [42.6561, 44.6378],
  
  // Spain - Canary Islands
  'Tenerife': [28.2916, -16.6291],
  'Santa Cruz de Tenerife': [28.4636, -16.2518],
  'Las Palmas de Gran Canaria': [28.1235, -15.4363],
  
  // Cyprus & Lebanon
  'Limassol': [34.6841, 33.0379],
  'Beirut': [33.8938, 35.5018],
  
  // ==================== ASIA & MIDDLE EAST ====================
  'Tokyo': [35.6762, 139.6503],
  'Taipei': [25.0330, 121.5654],
  'Taipei City': [25.0330, 121.5654],
  'Hong Kong': [22.3193, 114.1694],
  'Beijing': [39.9042, 116.4074],
  'Shanghai': [31.2304, 121.4737],
  'Seoul': [37.5665, 126.9780],
  'Busan': [35.1796, 129.0756],
  'Chuncheon-si': [37.8747, 127.7342],
  'Singapore': [1.3521, 103.8198],
  'Kuala Lumpur': [3.1390, 101.6869],
  'Petaling Jaya': [3.1073, 101.6067],
  'Hanoi': [21.0278, 105.8342],
  'Ho Chi Minh City': [10.8231, 106.6297],
  'Da Nang': [16.0544, 108.2022],
  'Hội An': [15.8801, 108.3380],
  'Dubai': [25.2048, 55.2708],
  'Cairo': [30.0444, 31.2357],
  'Astana': [51.1694, 71.4491],
  'Ubud': [-8.5069, 115.2625],
  'Auroville': [12.0053, 79.8094],
  'San Juan City': [14.6000, 121.0353],
  '都蘭村': [22.8833, 121.2000],
  
  // ==================== OCEANIA ====================
  'Melbourne': [-37.8136, 144.9631],
  'Sydney': [-33.8688, 151.2093],
  'Brisbane': [-27.4698, 153.0251],
  'Adelaide': [-34.9285, 138.6007],
  'Perth': [-31.9505, 115.8605],
  'Hobart': [-42.8821, 147.3272],
  'North Melbourne': [-37.7986, 144.9428],
  'South Yarra': [-37.8400, 144.9925],
  'Fitzroy': [-37.7986, 144.9781],
  'Brunswick East': [-37.7667, 144.9833],
  'Unley': [-34.9500, 138.5833],
  'Victoria': [-37.4713, 144.7852],
  
  // ==================== SPECIAL ENTRIES ====================
  'Unknown': [-34.6037, -58.3816],
  'PG': [37.8016, -122.4382],
  
  // French ski resorts
  'La Plagne-Tarentaise': [45.5000, 6.6667],
};

/**
 * Get coordinates for a city name
 * Returns Buenos Aires as default if city not found
 */
export function getCityCoordinates(cityName: string | null | undefined): [number, number] {
  if (!cityName) return BUENOS_AIRES_DEFAULT;
  
  const coords = cityCoordinates[cityName];
  if (coords) return coords;
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[cityCoordinates] Unknown city: "${cityName}" - falling back to Buenos Aires`);
  }
  
  return BUENOS_AIRES_DEFAULT;
}

/**
 * Check if a city has known coordinates
 */
export function hasCityCoordinates(cityName: string | null | undefined): boolean {
  if (!cityName) return false;
  return cityName in cityCoordinates;
}

/**
 * Get coordinates with deterministic offset for marker clustering prevention
 * Uses event index and city name as seed to ensure consistent placement
 * @param cityName - City name to lookup
 * @param index - Event index for deterministic offset (prevents stacking)
 * @param offsetRange - Range of offset in degrees (default 0.05 = ~5km)
 */
export function getCityCoordinatesWithOffset(
  cityName: string | null | undefined, 
  index: number = 0,
  offsetRange: number = 0.05
): [number, number] {
  const [lat, lng] = getCityCoordinates(cityName);
  
  // Create deterministic offset based on index and city name
  // This ensures markers are spread out but consistent across page loads
  const cityHash = (cityName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = index * 17 + cityHash;
  
  // Use sine/cosine for deterministic pseudo-random distribution in a circle
  const angle = (seed % 360) * (Math.PI / 180);
  const distance = (((seed * 7) % 100) / 100) * offsetRange;
  
  return [
    lat + Math.sin(angle) * distance,
    lng + Math.cos(angle) * distance
  ];
}
