/**
 * Every address V-DESK can offer, by state — the coverage map behind the "120+ locations" claim.
 *
 * This is deliberately separate from `locations.js`. That file holds the centres we have prices and
 * addresses for, so they can be quoted and booked; this one is the full footprint, which is only a state,
 * a city and the area within it. Nothing here is bookable until it gains a price in `locations.js`.
 *
 * Source: the client's "State and City" sheet. Obvious misspellings in it were corrected so they do not
 * reach the public site — Vishakhapattanam → Visakhapatnam, Trirupati → Tirupati, Badodara → Vadodara,
 * Gururgram → Gurugram, Udhyog → Udyog, Vasi → Vashi, Nasik → Nashik, Kangarbagh → Kankarbagh,
 * Panji → Panaji, Varna → Verna, Old Plasia → Old Palasia.
 *
 * Each entry is [city, area]. `area` is null where the sheet named only the city.
 */

export const COVERAGE = [
  ['Andhra Pradesh', [
    ['Vijayawada', 'Moghalrajpuram'],
    ['Vijayawada', 'Brindavan Colony'],
    ['Vijayawada', 'Near Benz Circle'],
    ['Vijayawada', 'Bharathi Nagar'],
    ['Visakhapatnam', 'GVK Plaza'],
    ['Tirupati', 'Mangalam'],
    ['Ananthapuram', null],
  ]],
  ['Assam', [
    ['Guwahati', 'Guwahati Club'],
    ['Guwahati', 'Ulubari'],
    ['Guwahati', 'Tiniali'],
  ]],
  ['Bihar', [
    ['Patna', 'P.S. Patrakar Nagar'],
    ['Patna', 'T. Nagar'],
    ['Patna', 'Mehandiganj Road, Patna City'],
    ['Patna', 'Ramjaipal Nagar, Bailey Road'],
    ['Patna', 'Saguna More'],
    ['Patna', 'Kankarbagh'],
  ]],
  ['Chandigarh', [
    ['Chandigarh', 'Industrial Area Phase 11'],
    ['Chandigarh', 'IT Park'],
  ]],
  ['Chhattisgarh', [
    ['Raipur', 'Lalpur'],
    ['Raipur', 'Corporate Park'],
    ['Bhilai', 'Avanti Bai Chowk'],
    ['Bhilai', 'Vidya Vihar'],
  ]],
  ['Delhi', [
    ['Delhi', 'Near Saket Metro'],
    ['Delhi', 'Janakpuri West (near East Metro)'],
    ['Delhi', 'Laxmi Nagar'],
    ['Delhi', 'Laxmi Nagar II'],
    ['Delhi', 'Netaji Subhash Place'],
    ['Delhi', 'Asaf Ali Road'],
  ]],
  ['Goa', [
    ['Verna', null],
    ['Panaji', '18th June Road'],
    ['Panaji', 'Patto Area'],
    ['Panaji', null],
  ]],
  ['Gujarat', [
    ['Ahmedabad', 'Naranpura'],
    ['Ahmedabad', 'SG Highway'],
    ['Ahmedabad', 'Sardar Patel Stadium'],
    ['Ahmedabad', 'Shyamal Cross Road'],
    ['Ahmedabad', 'Nehrunagar Circle'],
    ['Ahmedabad', 'Ashram Road'],
    ['Vadodara', 'Mandi Gate'],
  ]],
  ['Haryana', [
    ['Gurugram', 'Palm Square, Sector 66'],
    ['Sonipat', null],
    ['Rewari', null],
    ['Gurugram', null],
    ['Gurugram', 'II'],
    ['Gurugram', 'III'],
    ['Gurugram', 'IV'],
    ['Gurugram', 'V'],
    ['Gurugram', 'VI'],
    ['Gurugram', 'Udyog Vihar'],
    ['Gurugram', 'Sector 18'],
  ]],
  ['Himachal Pradesh', [
    ['Dharamshala', null],
    ['Kangra', null],
  ]],
  ['Jammu & Kashmir', [['Jammu', 'Airport Road']]],
  ['Jharkhand', [
    ['Ranchi', null],
    ['Ranchi', 'II'],
  ]],
  ['Karnataka', [
    ['Bengaluru', 'Krishna Reddy Layout, Domlur'],
    ['Bengaluru', 'Banaswadi'],
    ['Bengaluru', 'Ganganagar'],
    ['Bengaluru', 'Indiranagar'],
    ['Bengaluru', 'HMT Layout'],
    ['Bengaluru', 'Ganganagar / HMT Layout'],
    ['Bengaluru', 'Ganganagar / Balaji Layout'],
    ['Bengaluru', 'JP Nagar'],
    ['Bengaluru', 'HSR Layout'],
    ['Bengaluru', 'Kammanahalli'],
    ['Bengaluru', 'Koramangala'],
    ['Bengaluru', 'Koramangala II'],
    ['Bengaluru', 'Koramangala III'],
    ['Bengaluru', 'HSR Layout II'],
    ['Bengaluru', 'Whitefield'],
    ['Bengaluru', 'Indiranagar II'],
  ]],
  ['Kerala', [
    ['Kochi', null],
    ['Kochi', 'II'],
    ['Kochi', 'III'],
    ['Kochi', 'IV'],
    ['Kochi', 'V'],
    ['Kochi', 'VI'],
  ]],
  ['Madhya Pradesh', [
    ['Indore', null],
    ['Gwalior', null],
    ['Indore', 'II'],
    ['Indore', 'III'],
    ['Indore', 'Old Palasia'],
  ]],
  ['Maharashtra', [
    ['Navi Mumbai', 'Vashi'],
    ['Thane', 'Thane West'],
    ['Navi Mumbai', 'Sector 30-A, Vashi'],
    ['Mumbai', 'Goregaon East'],
    ['Mumbai', 'Bandra West'],
    ['Pune', null],
    ['Pune', 'II'],
    ['Nagpur', null],
    ['Nashik', null],
    ['Pune', 'III'],
    ['Pune', 'IV'],
  ]],
  // The sheet names the state but not the city for this one — needs the real city before it goes public.
  ['Meghalaya', [['Meghalaya', null]]],
  ['Mizoram', [['Aizawl', null]]],
  ['Odisha', [
    ['Bhubaneswar', null],
    ['Bhubaneswar', 'II'],
    ['Bhubaneswar', 'III'],
    ['Bhubaneswar', 'IV'],
  ]],
  ['Punjab', [['Zirakpur', null]]],
  ['Rajasthan', [
    ['Jaipur', 'Vidhayak Nagar'],
    ['Jaipur', 'Sanganer'],
  ]],
  ['Sikkim', [['Gangtok', 'Sungava']]],
  ['Tamil Nadu', [
    ['Chennai', 'Little Mount'],
    ['Chennai', 'North Boag Road'],
    ['Chennai', 'Anna Nagar'],
    ['Chennai', 'Iron and Steel Market'],
    ['Chennai', 'Anna Salai, Phase II'],
    ['Coimbatore', 'Mettupalayam'],
    ['Coimbatore', 'Ponnurangam Road'],
    ['Coimbatore', 'Ram Nagar'],
  ]],
  ['Telangana', [
    ['Hyderabad', 'Rangareddy, Madhapur'],
    ['Hyderabad', 'Gachibowli'],
    ['Hyderabad', 'Kondapur'],
    ['Hyderabad', 'Patrika Nagar, Madhapur'],
    ['Hyderabad', 'Banjara Hills'],
    ['Hyderabad', 'Kondapur II'],
    ['Hyderabad', 'Kavuri Hills'],
    ['Warangal', 'Kothawada'],
  ]],
  ['Uttar Pradesh', [
    ['Noida', 'Sector 2, near Sector 15 Metro'],
    ['Noida', 'Sector 2, near Sector 15 Metro II'],
    ['Noida', 'Sector 2, Block A'],
    ['Noida', 'Sector 3, Red FM Road'],
    ['Noida', 'Sector 63, H Block'],
    ['Noida', 'Sector 63, C Block'],
    ['Noida', 'Sector 3, E Block'],
    ['Noida', 'Sector 3, Vyapar Marg'],
    ['Greater Noida', 'Sector 4'],
    ['Greater Noida', 'Sector 1'],
    ['Ghaziabad', null],
    ['Ghaziabad', 'Meerut Road'],
    ['Lucknow', 'Gomti Nagar'],
    ['Lucknow', 'Vikas Khand'],
    ['Lucknow', 'Vibhuti Khand'],
    ['Agra', 'Dwarika Green'],
    ['Varanasi', 'Madhopur'],
  ]],
  ['Uttarakhand', [['Dehradun', 'Dharampur']]],
  ['West Bengal', [
    ['Kolkata', 'New Town'],
    ['Kolkata', 'Park Street'],
    ['Kolkata', 'Salt Lake'],
    ['Kolkata', 'Camac Street'],
    ['Kolkata', 'Park Street II'],
    ['Kolkata', 'Kalighat'],
  ]],
];

/** Counted from the list above, so the figures on the site can never drift from the data. */
export const COVERAGE_STATES = COVERAGE.length;
export const COVERAGE_LOCATIONS = COVERAGE.reduce((total, [, entries]) => total + entries.length, 0);
export const COVERAGE_CITIES = new Set(COVERAGE.flatMap(([, entries]) => entries.map(([city]) => city))).size;

/**
 * The figure published on the site. The list above holds 143 locations, so "120+" is true and leaves room;
 * it is the client's own number, kept here as the single place to change it.
 *
 * It counts LOCATIONS, not cities: those 143 addresses sit in 49 cities. Saying "120+ cities" would be an
 * advertising claim the data does not support.
 */
export const COVERAGE_CLAIM = '120+';
