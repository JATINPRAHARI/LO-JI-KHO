const RESTAURANT_LAT = 29.00656;
const RESTAURANT_LNG = 77.75901;

export function getDistanceFromLatLngInKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinDeliveryRadius(
  userLat: number,
  userLng: number,
  restaurantLat?: number,
  restaurantLng?: number,
  radiusKm?: number,
): { within: boolean; distance: number; maxRadius: number } {
  const rLat = restaurantLat ?? RESTAURANT_LAT;
  const rLng = restaurantLng ?? RESTAURANT_LNG;
  const maxRadius = radiusKm ?? 5;

  const distance = Number(getDistanceFromLatLngInKm(rLat, rLng, userLat, userLng).toFixed(1));
  return { within: distance <= maxRadius, distance, maxRadius };
}

export function getDeliveryInfoMessage(distance: number, maxRadius: number): { message: string; type: 'success' | 'warning' | 'error' } {
  if (distance === 0) {
    return { message: 'Enable GPS to check delivery availability', type: 'warning' };
  }
  if (distance <= maxRadius) {
    const percent = Math.round((distance / maxRadius) * 100);
    return { message: `We deliver to your area! (${distance} km away — ${percent}% of delivery range)`, type: 'success' };
  }
  return { message: `Sorry, you're ${(distance - maxRadius).toFixed(1)} km beyond our ${maxRadius} km delivery range`, type: 'error' };
}
