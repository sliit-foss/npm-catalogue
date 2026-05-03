const secretKeyPattern = /(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY|AUTH|CREDENTIAL)/i;

export const isSecretKey = (key: string): boolean => secretKeyPattern.test(key);
