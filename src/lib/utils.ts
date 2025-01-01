export const getShortAddress = (address: string, size = 4) => `${address.slice(0, size)}...${address.slice(-size)}`;
