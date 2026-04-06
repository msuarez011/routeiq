const strategies = {
    flat:           ({ base_fare }) => base_fare,
    distance_based: ({ base_fare, price_per_km }, km) => base_fare + price_per_km * km,
  };
  
  const timePerKm = {
    bus_brt: 3.5, bus_conventional: 4.5,
    rideshare: 2.0, taxi: 2.2,
    bicycle: 6.0, walking: 13.0,
  };
  
  function assignBadges(results) {
    const byPrice = [...results].sort((a, b) => a.estimated_price - b.estimated_price);
    const byTime  = [...results].sort((a, b) => a.estimated_minutes - b.estimated_minutes);
    byPrice[0].badge = 'cheapest';
    if (byTime[0].operator_id !== byPrice[0].operator_id) byTime[0].badge = 'fastest';
    results.forEach(r => { if (['walking','bicycle'].includes(r.type)) r.badge = 'eco'; });
    return results;
  }
  
  export const priceService = {
    calculateAll(operators, distanceKm, nearestStops) {
      const results = operators
        .filter(op => op.base_fare !== null)
        .map(op => {
          const strategy = op.price_per_km > 0 ? 'distance_based' : 'flat';
          const price    = strategies[strategy](op, distanceKm);
          const minutes  = Math.round(distanceKm * (timePerKm[op.type] || 3));
          const stop     = nearestStops.find(s => s.operator_id === op.id);
          return {
            operator_id: op.id, operator_name: op.name,
            type: op.type, color_hex: op.color_hex,
            estimated_price: Math.round(price), currency: op.currency,
            estimated_minutes: minutes,
            distance_km: Math.round(distanceKm * 10) / 10,
            nearest_stop: stop ?? null,
            walk_to_stop_m: stop?.distance_m ?? null,
            deep_link: op.deep_link_template,
            badge: null, status: 'estimated',
          };
        });
      return assignBadges(results).sort((a, b) => a.estimated_price - b.estimated_price);
    },
  };