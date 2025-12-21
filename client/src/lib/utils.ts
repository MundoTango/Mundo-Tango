import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize diacritics to ASCII
 * Example: "Málaga" -> "malaga", "Bogotá" -> "bogota", "Laško" -> "lasko"
 */
export function normalizeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Convert a city name to a URL-safe ASCII slug
 * Example: "Buenos Aires" -> "buenos-aires", "Málaga" -> "malaga", "São Paulo" -> "sao-paulo"
 */
export function toCitySlug(cityName: string): string {
  return normalizeDiacritics(cityName)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert a city slug back to a readable city name
 * Example: "buenos-aires" -> "Buenos Aires"
 */
export function fromCitySlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());
}
