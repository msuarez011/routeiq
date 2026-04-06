import supabase from '../config/supabase.js';

export const stopService = {
  async findNearest(lat, lng, cityId) {
    const { data, error } = await supabase.rpc('find_nearest_stops', {
      user_lat: lat,
      user_lng: lng,
      city_uuid: cityId,
      max_results: 1,
    });
    if (error) {
      console.error('stopService error:', error.message);
      return [];
    }
    return data ?? [];
  },
};