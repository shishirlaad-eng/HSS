// ─────────────────────────────────────────────────────────────
// HSS UK — Role-Based Data Scope
// Each role is assigned a "home" location in the hierarchy.
// This drives both DATA FILTERING and FILTER UI visibility.
//
// NOTE: All location values below are MOCK assignments.
//       On backend integration, these will come from the
//       authenticated user's profile — remove this file's
//       hardcoded values and replace with API data.
// ─────────────────────────────────────────────────────────────

import { MASTERS_CASCADE } from './membersData';

export type ScopeLevel = 'all' | 'national' | 'regional' | 'town' | 'centre';

export interface RoleScope {
  level: ScopeLevel;
  country?: string;   // defined for national, regional, town, centre
  region?:  string;   // defined for regional, town, centre
  town?:    string;   // defined for town, centre
  centre?:  string;   // defined for centre only
  // Which geographical filter dropdowns to show in listings / reports
  showCountryFilter:  boolean;
  showRegionFilter:   boolean;
  showTownFilter:     boolean;
  showCentreFilter:   boolean;
  // true for Member/Teen — attendance log shows only their own records
  selfOnly?:    boolean;
  // Mock member ID for the "logged-in" member when selfOnly is true
  selfMemberId?: string;
}

// ─────────────────────────────────────────────────────────────
// MOCK HOME ASSIGNMENTS — one per role persona
// ─────────────────────────────────────────────────────────────
export const ROLE_SCOPE_MAP: Record<string, RoleScope> = {

  'Super Admin': {
    level: 'all',
    showCountryFilter: true, showRegionFilter: true,
    showTownFilter: true,    showCentreFilter: true,
  },

  // Sees all HSS UK data (all regions, towns, centres under UK)
  'National Head': {
    level: 'national', country: 'HSS UK',
    showCountryFilter: false, showRegionFilter: true,
    showTownFilter: true,     showCentreFilter: true,
  },

  // Scoped to London & South East region (largest mock data set)
  'Regional Head': {
    level: 'regional', country: 'HSS UK', region: 'London & South East',
    showCountryFilter: false, showRegionFilter: false,
    showTownFilter: true,     showCentreFilter: true,
  },

  // Scoped to Wembley town (within London & South East)
  'Town Head': {
    level: 'town', country: 'HSS UK', region: 'London & South East', town: 'Wembley',
    showCountryFilter: false, showRegionFilter: false,
    showTownFilter: false,    showCentreFilter: true,
  },

  // Scoped to Wembley Activity Centre
  'Activity Centre Admin': {
    level: 'centre', country: 'HSS UK', region: 'London & South East',
    town: 'Wembley', centre: 'Wembley Activity Centre',
    showCountryFilter: false, showRegionFilter: false,
    showTownFilter: false,    showCentreFilter: false,
  },

  // Event Admin scoped to Wembley (London & South East)
  'Event Admin': {
    level: 'centre', country: 'HSS UK', region: 'London & South East',
    town: 'Wembley', centre: 'Wembley Activity Centre',
    showCountryFilter: false, showRegionFilter: false,
    showTownFilter: false,    showCentreFilter: false,
  },

  // Reporting User — national scope (sees all UK data)
  'Reporting User': {
    level: 'national', country: 'HSS UK',
    showCountryFilter: false, showRegionFilter: true,
    showTownFilter: true,     showCentreFilter: true,
  },

  // Ops User — scoped to Wembley Activity Centre
  'Ops User': {
    level: 'centre', country: 'HSS UK', region: 'London & South East',
    town: 'Wembley', centre: 'Wembley Activity Centre',
    showCountryFilter: false, showRegionFilter: false,
    showTownFilter: false,    showCentreFilter: false,
  },

  // Members see only their own attendance log (selfOnly = true)
  'Member (18+)': {
    level: 'centre', country: 'HSS UK', region: 'London & South East',
    town: 'Wembley', centre: 'Wembley Activity Centre',
    showCountryFilter: false, showRegionFilter: false,
    showTownFilter: false,    showCentreFilter: false,
    selfOnly: true,  selfMemberId: 'WBL-001',  // mock: Vikram Singh
  },

  'Teen (13–17)': {
    level: 'centre', country: 'HSS UK', region: 'London & South East',
    town: 'Wembley', centre: 'Wembley Activity Centre',
    showCountryFilter: false, showRegionFilter: false,
    showTownFilter: false,    showCentreFilter: false,
    selfOnly: true,  selfMemberId: 'WBL-004',  // mock: Kavya Reddy (youth member)
  },
};

// ─────────────────────────────────────────────────────────────
// UTILITY — get scope for a role name
// ─────────────────────────────────────────────────────────────
export function getRoleScope(roleName: string): RoleScope {
  return ROLE_SCOPE_MAP[roleName] ?? ROLE_SCOPE_MAP['Super Admin'];
}

// ─────────────────────────────────────────────────────────────
// UTILITY — filter any data array by scope
// Works for members, events, sessions, log entries, etc.
// The item must have at least one of: country, region, town, activityCentre
// ─────────────────────────────────────────────────────────────
export function filterByScope<T extends {
  country?: string;
  region?: string;
  town?: string;
  activityCentre?: string;
}>(data: T[], scope: RoleScope): T[] {
  if (scope.level === 'all') return data;
  return data.filter(item => {
    if (scope.level === 'national')  return item.country        === scope.country;
    if (scope.level === 'regional')  return item.region         === scope.region;
    if (scope.level === 'town')      return item.town           === scope.town;
    if (scope.level === 'centre')    return item.activityCentre === scope.centre;
    return true;
  });
}

// ─────────────────────────────────────────────────────────────
// UTILITY — compute scoped dropdown options for filter panels
// Returns only the region/town/centre values relevant to scope
// ─────────────────────────────────────────────────────────────
export interface ScopedFilterOptions {
  regionOptions:  string[];
  townOptions:    string[];
  centreOptions:  string[];
}

export function getScopedFilterOptions(scope: RoleScope): ScopedFilterOptions {
  // Regions available in scope
  let regionOptions: string[] = [];
  if (scope.level === 'all') {
    regionOptions = Object.values(MASTERS_CASCADE.regions).flat();
  } else if (scope.level === 'national' && scope.country) {
    regionOptions = MASTERS_CASCADE.regions[scope.country] ?? [];
  } else if (scope.region) {
    regionOptions = [scope.region];
  }

  // Towns available in scope
  let townOptions: string[] = [];
  if (scope.level === 'all') {
    townOptions = Object.values(MASTERS_CASCADE.towns).flat();
  } else if (scope.level === 'national' && scope.country) {
    const countryRegions = MASTERS_CASCADE.regions[scope.country] ?? [];
    townOptions = countryRegions.flatMap(r => MASTERS_CASCADE.towns[r] ?? []);
  } else if (scope.level === 'regional' && scope.region) {
    townOptions = MASTERS_CASCADE.towns[scope.region] ?? [];
  } else if (scope.town) {
    townOptions = [scope.town];
  }

  // Centres available in scope
  let centreOptions: string[] = [];
  if (scope.level === 'all') {
    centreOptions = Object.values(MASTERS_CASCADE.centres).flat();
  } else if (scope.level === 'national' && scope.country) {
    const countryRegions = MASTERS_CASCADE.regions[scope.country] ?? [];
    const countryTowns   = countryRegions.flatMap(r => MASTERS_CASCADE.towns[r] ?? []);
    centreOptions        = countryTowns.flatMap(t => MASTERS_CASCADE.centres[t] ?? []);
  } else if (scope.level === 'regional' && scope.region) {
    const regionTowns = MASTERS_CASCADE.towns[scope.region] ?? [];
    centreOptions     = regionTowns.flatMap(t => MASTERS_CASCADE.centres[t] ?? []);
  } else if (scope.level === 'town' && scope.town) {
    centreOptions = MASTERS_CASCADE.centres[scope.town] ?? [];
  } else if (scope.centre) {
    centreOptions = [scope.centre];
  }

  return { regionOptions, townOptions, centreOptions };
}
