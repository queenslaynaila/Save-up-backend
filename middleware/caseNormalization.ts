import { UserRole } from '../globalTypes/index';
export const convertToTitleCase = (str: string): UserRole => {
  const titleCased = str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  if (!Object.values(UserRole).includes(titleCased as UserRole)) {
    throw new Error('Invalid role');
  }
  return titleCased as UserRole;
};

export const isValidValue = (value: string | undefined, acceptedValues: string[]): boolean => {
  return value !== undefined && acceptedValues.includes(value);
};
