export const convertToTitleCase = (str: string | undefined): string => {
  return str ? str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : '';
};

export const isValidValue = (value: string | undefined, acceptedValues: string[]): boolean => {
  return value !== undefined && acceptedValues.includes(value);
};
