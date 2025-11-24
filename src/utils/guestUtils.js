// Utility functions for guest list management

import guestListData from '../data/guestList.json';

/**
 * Normalize string for comparison (remove accents, lowercase, trim)
 */
export const normalizeString = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Get all guests from all groups
 */
export const getAllGuests = () => {
  const allGuests = [];
  
  guestListData.groups.forEach((group) => {
    group.guests.forEach((guestName) => {
      if (guestName && guestName.trim()) {
        allGuests.push({
          name: guestName,
          normalizedName: normalizeString(guestName),
          group: group.name,
          groupId: group.id,
          maxGuests: group.maxGuests,
        });
      }
    });
  });
  
  return allGuests;
};

/**
 * Search for a guest by name (fuzzy search)
 */
export const searchGuest = (searchTerm) => {
  if (!searchTerm || searchTerm.trim().length < 3) {
    return [];
  }
  
  const normalized = normalizeString(searchTerm);
  const allGuests = getAllGuests();
  
  return allGuests.filter((guest) =>
    guest.normalizedName.includes(normalized)
  );
};

/**
 * Validate if a guest exists in the list
 */
export const validateGuest = (guestName) => {
  const normalized = normalizeString(guestName);
  const allGuests = getAllGuests();
  
  return allGuests.find((guest) => guest.normalizedName === normalized);
};

/**
 * Get guest statistics
 */
export const getGuestStats = () => {
  const groups = guestListData.groups;
  const totalGroups = groups.length;
  const totalGuests = getAllGuests().length;
  const totalCapacity = groups.reduce((sum, group) => sum + group.maxGuests, 0);
  
  return {
    totalGroups,
    totalGuests,
    totalCapacity,
    averagePerGroup: (totalGuests / totalGroups).toFixed(1),
  };
};

/**
 * Parse guest name to check for companion allowance
 * Returns { principalName, companionAllowed }
 */
export const parseCompanionName = (fullName) => {
  if (!fullName) return { principalName: '', companionAllowed: false };

  const suffixes = [
    ' e esposa',
    ' e esposo',
    ' e mulher',
    ' e marido',
    ' +1'
  ];

  const lowerName = fullName.toLowerCase();
  const matchedSuffix = suffixes.find(suffix => lowerName.endsWith(suffix));

  if (matchedSuffix) {
    const suffixIndex = lowerName.lastIndexOf(matchedSuffix);
    const principalName = fullName.substring(0, suffixIndex).trim();
    
    return {
      principalName,
      companionAllowed: true
    };
  }

  return {
    principalName: fullName,
    companionAllowed: false
  };
};

export default {
  normalizeString,
  getAllGuests,
  searchGuest,
  validateGuest,
  getGuestStats,
  parseCompanionName,
};
