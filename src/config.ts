import 'dotenv/config';

export const SERIAL_NUMBER = 216;
export const TWO_FA = process.env.TWO_FA!;
export const GMAIL_USER = process.env.GMAIL_USER!;
export const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD!;
export const IS_INTERNAL = false;
export const CHAIN: 'SOL' | 'TON' | 'ERC20' | 'Arbitrum One' | 'Avalanche' = 'Avalanche';

export const FAILED_ADDRESSES_FILE = 'src/data/failed.txt';
export const SUCCESSFUL_ADDRESSES_FILE = 'src/data/success.txt';
export const NEW_ADDRESSES_FILE = 'src/data/add-to.txt';
