import { UserRole } from './globalTypes';

export const convertToTitleCase = (str: string): UserRole => {
  const titleCased = str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  if (!Object.values(UserRole).includes(titleCased as UserRole)) {
    throw new Error('Invalid role');
  }
  return titleCased as UserRole;
};