import { readFile } from "fs/promises";
import { SUCCESSFUL_ADDRESSES_FILE, FAILED_ADDRESSES_FILE, NEW_ADDRESSES_FILE } from "./config";
import { ensureFileExists } from "./utils";
import { processBybit } from "./add-to-wl";

async function main() {
    await ensureFileExists(SUCCESSFUL_ADDRESSES_FILE);
    await ensureFileExists(FAILED_ADDRESSES_FILE);
  
    const data = await readFile(NEW_ADDRESSES_FILE, 'utf-8');
    const bybitIds = data.split('\n'); // Replace with actual Bybit IDs
    await processBybit(bybitIds);
    console.log('done');
  }
  main();