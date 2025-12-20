import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a city name to a URL-safe slug
 * Example: "Buenos Aires" -> "buenos-aires"
 */
export function toCitySlug(cityName: string): string {
  return encodeURIComponent(cityName.toLowerCase().replace(/\s+/g, '-'));
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
