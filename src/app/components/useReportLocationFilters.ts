// ─────────────────────────────────────────────────────────────
// HSS UK — Report location filters (Vibhag / Nagar / Shakha)
// Drives the three location filters of every report from the logged-in admin's level:
//   Super Admin / Kendriya / Reporting User → pick any Vibhag, then Nagar, then Shakha
//   Vibhag Admin  → Vibhag is fixed to their own; pick a Nagar, then a Shakha
//   Nagar Admin   → Vibhag and Nagar are fixed; pick a Shakha
//   Shakha Admin  → all three are fixed to their own Shakha
// Fixed levels are pre-selected, disabled, and cannot be cleared.
// ─────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from 'react';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { MASTERS_CASCADE } from '../../mockAPI/membersData';
import { getScopedFilterOptions } from '../../mockAPI/roleScope';

export function useReportLocationFilters() {
  const { scope } = useRoleScope();

  const lockedRegion = scope.showRegionFilter ? '' : (scope.region ?? '');
  const lockedTown   = scope.showTownFilter   ? '' : (scope.town ?? '');
  const lockedCentre = scope.showCentreFilter ? '' : (scope.centre ?? '');

  const [regionState, setRegionState] = useState(lockedRegion);
  const [townState,   setTownState]   = useState(lockedTown);
  const [centreState, setCentreState] = useState(lockedCentre);

  // Switching role (different admin level) resets the filters to that level's fixed values.
  useEffect(() => {
    setRegionState(lockedRegion);
    setTownState(lockedTown);
    setCentreState(lockedCentre);
  }, [lockedRegion, lockedTown, lockedCentre]);

  const region = lockedRegion || regionState;
  const town   = lockedTown   || townState;
  const centre = lockedCentre || centreState;

  const regionOptions = useMemo(() => {
    if (lockedRegion) return [lockedRegion];
    return Array.from(new Set(getScopedFilterOptions(scope).regionOptions));
  }, [scope, lockedRegion]);

  const townOptions = useMemo(() => {
    if (lockedTown) return [lockedTown];
    return region ? (MASTERS_CASCADE.towns[region] ?? []) : [];
  }, [lockedTown, region]);

  const centreOptions = useMemo(() => {
    if (lockedCentre) return [lockedCentre];
    return town ? (MASTERS_CASCADE.centres[town] ?? []) : [];
  }, [lockedCentre, town]);

  return {
    scope,
    region, town, centre,
    // Setters ignore changes to fixed levels so "Clear" can't remove an admin's own location.
    setRegion: (v: string) => { if (!lockedRegion) setRegionState(v); },
    setTown:   (v: string) => { if (!lockedTown)   setTownState(v); },
    setCentre: (v: string) => { if (!lockedCentre) setCentreState(v); },
    regionOptions, townOptions, centreOptions,
    regionLocked: !!lockedRegion,
    townLocked:   !!lockedTown,
    centreLocked: !!lockedCentre,
    regionDisabled: !!lockedRegion,
    townDisabled:   !!lockedTown   || !region,
    centreDisabled: !!lockedCentre || !town,
  };
}
