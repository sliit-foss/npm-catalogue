const booleanMap: Record<string, boolean> = {
  "0": false,
  "1": true,
  "false": false,
  "no": false,
  "off": false,
  "on": true,
  "true": true,
  "yes": true
};

export const parseBoolean = (value: string): boolean | undefined => {
  const normalized = value.trim().toLowerCase();
  return booleanMap[normalized];
};
