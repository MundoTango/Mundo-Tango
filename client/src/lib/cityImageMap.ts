/**
 * City Skyline & Cityscape Images
 * Using verified stock photo assets (actual cityscapes - no people)
 * All images are confirmed cityscape/architecture photos
 */

// South America
import buenosAiresImg from "@assets/stock_images/buenos_aires_city_sk_e19a76a2.jpg";
import rioDeJaneiroImg from "@assets/stock_images/rio_de_janeiro_skyli_39aceb0a.jpg";
import saoPauloImg from "@assets/stock_images/são_paulo_cityscape__9e45fc09.jpg";
import montevideoImg from "@assets/stock_images/montevideo_cityscape_0ef8132c.jpg";
import bogotaImg from "@assets/stock_images/bogota_cityscape_cit_29d0dc8c.jpg";
import limaImg from "@assets/stock_images/lima_peru_cityscape__1618a48b.jpg";
import santiagoImg from "@assets/stock_images/santiago_chile_citys_ee5c173d.jpg";
import medellinImg from "@assets/stock_images/medellin_colombia_ci_205ba838.jpg";

// Europe - Western
import parisImg from "@assets/stock_images/paris_cityscape_eiff_2153bb26.jpg";
import londonImg from "@assets/stock_images/london_cityscape_sky_d46764f3.jpg";
import amsterdamImg from "@assets/stock_images/amsterdam_cityscape__1962745c.jpg";
import copenhagenImg from "@assets/stock_images/copenhagen_denmark_c_a34f19e5.jpg";

// Europe - Southern
import barcelonaImg from "@assets/stock_images/barcelona_cityscape__75599dda.jpg";
import madridImg from "@assets/stock_images/madrid_cityscape_arc_aebbb162.jpg";
import lisbonImg from "@assets/stock_images/lisbon_cityscape_arc_3dd530f1.jpg";
import portoImg from "@assets/stock_images/porto_portugal_citys_5032394b.jpg";
import romeImg from "@assets/stock_images/rome_cityscape_colos_d7e83bc0.jpg";
import veniceImg from "@assets/stock_images/venice_italy_citysca_dc9ed1dc.jpg";
import florenceImg from "@assets/stock_images/florence_italy_citys_ccabbb1d.jpg";
import milanImg from "@assets/stock_images/milan_italy_cityscap_9054dc96.jpg";
import valenciaImg from "@assets/stock_images/valencia_spain_citys_2d8561a8.jpg";
import sevilleImg from "@assets/stock_images/seville_spain_citysc_f5e215f7.jpg";

// Europe - Central/Eastern
import berlinImg from "@assets/stock_images/berlin_cityscape_sky_165df076.jpg";
import viennaImg from "@assets/stock_images/vienna_cityscape_arc_0fbbcd79.jpg";
import pragueImg from "@assets/stock_images/prague_cityscape_cha_594f6662.jpg";
import budapestImg from "@assets/stock_images/budapest_hungary_cit_821db880.jpg";
import warsawImg from "@assets/stock_images/warsaw_poland_citysc_9db57edf.jpg";
import krakowImg from "@assets/stock_images/krakow_poland_citysc_e6dbb012.jpg";
import bucharestImg from "@assets/stock_images/bucharest_romania_ci_3209c162.jpg";
import moscowImg from "@assets/stock_images/moscow_russia_citysc_71912514.jpg";

// Europe - Germany
import munichImg from "@assets/stock_images/munich_germany_citys_4124709e.jpg";
import hamburgImg from "@assets/stock_images/hamburg_germany_city_2f17937e.jpg";
import frankfurtImg from "@assets/stock_images/frankfurt_germany_ci_84857e9f.jpg";
import cologneImg from "@assets/stock_images/cologne_germany_city_3a1de3a3.jpg";

// Mediterranean/Middle East
import istanbulImg from "@assets/stock_images/istanbul_cityscape_b_66bef161.jpg";
import athensImg from "@assets/stock_images/athens_cityscape_acr_19ff5946.jpg";
import telAvivImg from "@assets/stock_images/tel_aviv_israel_city_4153ea68.jpg";

// North America
import newYorkImg from "@assets/stock_images/new_york_city_skylin_5d1028b2.jpg";
import losAngelesImg from "@assets/stock_images/los_angeles_cityscap_0b1db171.jpg";
import sanFranciscoImg from "@assets/stock_images/san_francisco_citysc_8d3bfe4c.jpg";
import chicagoImg from "@assets/stock_images/chicago_cityscape_do_39349d42.jpg";
import miamiImg from "@assets/stock_images/miami_cityscape_down_2a6528de.jpg";
import torontoImg from "@assets/stock_images/toronto_canada_citys_8ac3accc.jpg";
import mexicoCityImg from "@assets/stock_images/mexico_city_cityscap_08a737b2.jpg";
import cancunImg from "@assets/stock_images/cancun_mexico_citysc_e0dec5ba.jpg";

// Asia
import tokyoImg from "@assets/stock_images/tokyo_cityscape_skyl_1e27ef74.jpg";
import bangkokImg from "@assets/stock_images/bangkok_thailand_cit_dfeee550.jpg";
import singaporeImg from "@assets/stock_images/singapore_cityscape__7728071f.jpg";
import hongKongImg from "@assets/stock_images/hong_kong_cityscape__3560e67b.jpg";
import seoulImg from "@assets/stock_images/seoul_south_korea_ci_9b2d8cf4.jpg";
import shanghaiImg from "@assets/stock_images/shanghai_china_citys_c1169590.jpg";
import dubaiImg from "@assets/stock_images/dubai_cityscape_skyl_b23b4fcf.jpg";

// Oceania
import sydneyImg from "@assets/stock_images/sydney_australia_cit_96425aea.jpg";
import melbourneImg from "@assets/stock_images/melbourne_australia__0f529827.jpg";

export const CITY_IMAGE_MAP: Record<string, string> = {
  // South America
  "Buenos Aires": buenosAiresImg,
  "Rio de Janeiro": rioDeJaneiroImg,
  "Sao Paulo": saoPauloImg,
  "São Paulo": saoPauloImg,
  "Montevideo": montevideoImg,
  "Bogota": bogotaImg,
  "Bogotá": bogotaImg,
  "Lima": limaImg,
  "Santiago": santiagoImg,
  "Medellín": medellinImg,
  "Medellin": medellinImg,
  
  // Europe - Western
  "Paris": parisImg,
  "London": londonImg,
  "Amsterdam": amsterdamImg,
  "Copenhagen": copenhagenImg,
  
  // Europe - Southern
  "Barcelona": barcelonaImg,
  "Madrid": madridImg,
  "Lisbon": lisbonImg,
  "Porto": portoImg,
  "Rome": romeImg,
  "Venice": veniceImg,
  "Florence": florenceImg,
  "Milan": milanImg,
  "Milano": milanImg,
  "Valencia": valenciaImg,
  "Seville": sevilleImg,
  "Sevilla": sevilleImg,
  
  // Europe - Central/Eastern
  "Berlin": berlinImg,
  "Vienna": viennaImg,
  "Prague": pragueImg,
  "Budapest": budapestImg,
  "Warsaw": warsawImg,
  "Krakow": krakowImg,
  "Kraków": krakowImg,
  "Bucharest": bucharestImg,
  "Moscow": moscowImg,
  
  // Europe - Germany
  "Munich": munichImg,
  "München": munichImg,
  "Hamburg": hamburgImg,
  "Frankfurt": frankfurtImg,
  "Cologne": cologneImg,
  "Köln": cologneImg,
  
  // Mediterranean/Middle East
  "Istanbul": istanbulImg,
  "Athens": athensImg,
  "Tel Aviv": telAvivImg,
  
  // North America
  "New York": newYorkImg,
  "Los Angeles": losAngelesImg,
  "San Francisco": sanFranciscoImg,
  "Chicago": chicagoImg,
  "Miami": miamiImg,
  "Toronto": torontoImg,
  "Mexico City": mexicoCityImg,
  "Cancún": cancunImg,
  "Cancun": cancunImg,
  
  // Asia
  "Tokyo": tokyoImg,
  "Bangkok": bangkokImg,
  "Singapore": singaporeImg,
  "Hong Kong": hongKongImg,
  "Seoul": seoulImg,
  "Shanghai": shanghaiImg,
  "Dubai": dubaiImg,
  
  // Oceania
  "Sydney": sydneyImg,
  "Melbourne": melbourneImg,
};

/**
 * Default fallback image for cities not in the map (generic cityscape)
 */
export const DEFAULT_CITY_IMAGE = newYorkImg;

/**
 * Normalize diacritics to ASCII for matching
 */
function normalizeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Title case a string
 */
function titleCase(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Get city-specific image URL
 * Returns verified cityscape image for the city, or NYC as fallback
 * Handles: "Buenos Aires", "buenos-aires", "Málaga", "malaga", etc.
 * Falls back to NYC if no cityscape found for the city
 */
export function getCityImageUrl(city: string): string {
  // Direct lookup
  if (CITY_IMAGE_MAP[city]) {
    return CITY_IMAGE_MAP[city];
  }
  
  // Normalize and try variations
  const normalized = city.trim();
  const asciiVersion = normalizeDiacritics(normalized);
  const fromSlug = titleCase(normalized.replace(/-/g, ' '));
  const asciiFromSlug = titleCase(normalizeDiacritics(normalized.replace(/-/g, ' ')));
  
  // Try with different variations
  const variations = [
    normalized,
    asciiVersion,
    fromSlug,
    asciiFromSlug,
    titleCase(normalized),
    titleCase(asciiVersion),
  ];
  
  for (const variant of variations) {
    if (CITY_IMAGE_MAP[variant]) {
      return CITY_IMAGE_MAP[variant];
    }
  }
  
  // Try partial matching for multi-word cities like "Buenos Aires"
  const normalizedLower = asciiVersion.toLowerCase();
  for (const [cityName, image] of Object.entries(CITY_IMAGE_MAP)) {
    const cityLower = normalizeDiacritics(cityName).toLowerCase();
    if (cityLower === normalizedLower || cityLower.replace(/\s+/g, '-') === normalizedLower) {
      return image;
    }
  }
  
  // Fallback to NYC cityscape for any city without a specific image
  console.log(`[getCityImageUrl] No cityscape found for "${city}", using NYC as fallback`);
  return DEFAULT_CITY_IMAGE;
}
