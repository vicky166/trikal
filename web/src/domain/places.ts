export type City = {
  id: string
  label: string
  country: string
  countryCode: string
  timeZone: string
  latitude: number
  longitude: number
}

/**
 * City centres from widely published geographic coordinates.
 * A centre is not the building where someone was born.
 */
export const cities: City[] = [
  { id: 'mumbai', label: 'Mumbai', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 19.076, longitude: 72.8777 },
  { id: 'delhi', label: 'Delhi', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 28.6139, longitude: 77.209 },
  { id: 'bengaluru', label: 'Bengaluru', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 12.9716, longitude: 77.5946 },
  { id: 'hyderabad', label: 'Hyderabad', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 17.385, longitude: 78.4867 },
  { id: 'chennai', label: 'Chennai', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 13.0827, longitude: 80.2707 },
  { id: 'kolkata', label: 'Kolkata', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { id: 'pune', label: 'Pune', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 18.5204, longitude: 73.8567 },
  { id: 'ahmedabad', label: 'Ahmedabad', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 23.0225, longitude: 72.5714 },
  { id: 'jaipur', label: 'Jaipur', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 26.9124, longitude: 75.7873 },
  { id: 'lucknow', label: 'Lucknow', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 26.8467, longitude: 80.9462 },
  { id: 'varanasi', label: 'Varanasi', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 25.3176, longitude: 82.9739 },
  { id: 'chandigarh', label: 'Chandigarh', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 30.7333, longitude: 76.7794 },
  { id: 'kochi', label: 'Kochi', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 9.9312, longitude: 76.2673 },
  { id: 'bhopal', label: 'Bhopal', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 23.2599, longitude: 77.4126 },
  { id: 'indore', label: 'Indore', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 22.7196, longitude: 75.8577 },
  { id: 'patna', label: 'Patna', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 25.5941, longitude: 85.1376 },
  { id: 'guwahati', label: 'Guwahati', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 26.1445, longitude: 91.7362 },
  { id: 'thiruvananthapuram', label: 'Thiruvananthapuram', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 8.5241, longitude: 76.9366 },
  { id: 'srinagar', label: 'Srinagar', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 34.0837, longitude: 74.7973 },
  { id: 'panaji', label: 'Panaji', country: 'India', countryCode: 'IN', timeZone: 'Asia/Kolkata', latitude: 15.4909, longitude: 73.8278 },
  { id: 'kathmandu', label: 'Kathmandu', country: 'Nepal', countryCode: 'NP', timeZone: 'Asia/Kathmandu', latitude: 27.7172, longitude: 85.324 },
  { id: 'dubai', label: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', timeZone: 'Asia/Dubai', latitude: 25.2048, longitude: 55.2708 },
  { id: 'singapore', label: 'Singapore', country: 'Singapore', countryCode: 'SG', timeZone: 'Asia/Singapore', latitude: 1.3521, longitude: 103.8198 },
  { id: 'london', label: 'London', country: 'United Kingdom', countryCode: 'GB', timeZone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
  { id: 'new-york', label: 'New York', country: 'United States', countryCode: 'US', timeZone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
]

export function searchCities(query: string): City[] {
  const needle = query.trim().toLowerCase()
  if (needle.length < 1) return cities.slice(0, 6)
  return cities.filter((city) => `${city.label} ${city.country}`.toLowerCase().includes(needle)).slice(0, 8)
}

export function findCity(id: string): City | undefined {
  return cities.find((city) => city.id === id)
}
