/**
 * Catalog constants — the enums the schemas, validation and staff endpoints share.
 */

export const CITY_TIERS = ['Tier-1', 'Tier-2', 'Tier-3'];
export const AVAILABILITY_STATUSES = ['available', 'limited', 'unavailable'];
export const WORKSPACE_TYPES = ['Virtual Office', 'Coworking', 'Meeting Rooms', 'Private Office'];

/** Lower-case words joined by single dashes — city slugs appear in public URLs (/locations/mumbai). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Staff-created centres and workspaces continue the seeded pattern: CTR-NSK-003, WS-MUM-004. */
export const REF_NUMBER_DIGITS = 3;
export const REF_ALLOCATION_ATTEMPTS = 3;
