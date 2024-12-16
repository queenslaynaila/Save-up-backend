import { USER_ROLE_ENUM } from './routes/users/schema';
export const convertToTitleCase = (str: string): string => {
  const titleCased = str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  if (!USER_ROLE_ENUM.safeParse(titleCased).success) {
    throw new Error('Invalid role');
  }

  return titleCased;
};
