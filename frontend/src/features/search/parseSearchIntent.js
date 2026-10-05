/**
 * Natural-language intent parser for the universal search (PRD §10).
 * "Office for 8 people in Gurgaon" → { intent: 'Private Office', location: 'Gurgaon', capacity: 8 }
 */
export function parseSearchIntent(query) {
  if (!query || !query.trim()) return null;
  const q = query.toLowerCase().trim();

  let intent = 'General Discovery';
  let location = null;
  let locality = null;
  let capacity = null;
  let service = null;

  // City matching
  const cities = ['mumbai', 'delhi', 'bangalore', 'nashik', 'pune', 'hyderabad', 'gurgaon', 'noida', 'chennai', 'kolkata'];
  for (const c of cities) {
    if (q.includes(c)) {
      location = c.charAt(0).toUpperCase() + c.slice(1);
      if (location === 'Delhi' || location === 'Gurgaon' || location === 'Noida') {
        // Can also normalize to NCR if needed
      }
      break;
    }
  }

  // Locality matching
  const localities = {
    'bkc': 'Bandra Kurla Complex (BKC)',
    'andheri': 'Andheri East',
    'lower parel': 'Lower Parel',
    'connaught place': 'Connaught Place',
    'cp': 'Connaught Place',
    'koramangala': 'Koramangala',
    'hsr': 'HSR Layout',
    'college road': 'College Road',
    'gangapur road': 'Gangapur Road',
    'baner': 'Baner',
    'viman nagar': 'Viman Nagar',
    'cyber city': 'DLF Cyber City',
    'hitec': 'HITEC City'
  };

  for (const [key, val] of Object.entries(localities)) {
    if (q.includes(key)) {
      locality = val;
      break;
    }
  }

  // Capacity extraction: e.g. "for 8 people", "8 people", "10 pax", "seats 6", "for 4"
  const capMatch = q.match(/(?:for|seats|capacity of)?\s*(\d+)\s*(?:people|pax|seats|persons|members)?/);
  if (capMatch && parseInt(capMatch[1], 10) > 0) {
    const num = parseInt(capMatch[1], 10);
    // If user explicitly typed a number between 1 and 200
    if (num <= 200 && (q.includes('people') || q.includes('pax') || q.includes('seats') || q.includes('office for') || q.includes('room for'))) {
      capacity = num;
    }
  }

  // Intent classification
  if (q.includes('virtual office') || q.includes('business address') || q.includes('mailing address') || q.includes('apob') || q.includes('ppob')) {
    intent = 'Virtual Office';
  } else if (q.includes('meeting room') || q.includes('boardroom') || q.includes('conference') || q.includes('huddle')) {
    intent = 'Meeting Room';
  } else if (q.includes('private office') || q.includes('cabin') || (capacity && capacity >= 4) || q.includes('team office')) {
    intent = 'Private Office';
  } else if (q.includes('coworking') || q.includes('desk') || q.includes('shared office')) {
    intent = 'Coworking';
  } else if (q.includes('gst') || q.includes('tax')) {
    intent = 'Business Service';
    service = 'GST Registration';
  } else if (q.includes('company') || q.includes('incorporation') || q.includes('pvt ltd') || q.includes('llp') || q.includes('opc')) {
    intent = 'Business Service';
    service = 'Company Registration';
  } else if (location) {
    intent = 'Location Hub Explorer';
  }

  return {
    rawQuery: query,
    intent,
    location,
    locality,
    capacity,
    service,
    summary: `${intent}${location ? ' • ' + location : ''}${locality ? ' (' + locality + ')' : ''}${capacity ? ' • ' + capacity + ' Pax' : ''}${service ? ' • ' + service : ''}`
  };
}
