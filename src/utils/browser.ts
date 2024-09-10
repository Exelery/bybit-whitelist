import { SERIAL_NUMBER } from '../config';
import { wait } from './wait.js';
import axios from 'axios';

import { chromium } from 'playwright';

export async function startBrowser(serialNumber: number) {
  try {
    const response = await axios.get(
      `http://local.adspower.net:50325/api/v1/browser/start?serial_number=${serialNumber}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error starting browser:', error);
    throw error;
  }
}

export async function getBrowserPage() {
  let res = await isBrowserRunning();

  if (!res) {
    console.log(`Browser with serial number ${SERIAL_NUMBER} is not running. Starting it...`);
    res = await startBrowser(SERIAL_NUMBER);
    console.log('Browser started:', res);
  }

  if (!res) {
    console.error('Failed to start or find the browser.');
    return;
  }

  const puppeteer = res.data.data.list?.[0]?.ws?.puppeteer ?? res.data.data.ws?.puppeteer;

  if (!puppeteer) {
    console.error('Puppeteer websocket endpoint not found.');
    return;
  }
  const wlPageUrl = 'https://www.bybit.com/user/assets/money-address';

  const browser = await chromium.connectOverCDP(puppeteer);
  const defaultContext = browser.contexts()[0];
  let page = defaultContext.pages().find((el) => el.url() === wlPageUrl);

  if (!page) {
    page = await defaultContext.newPage();
    await page.goto(wlPageUrl);
    await wait(1, 1);
  }

  return page;
}

async function isBrowserRunning() {
  try {
    const response = await axios.get('http://local.adspower.net:50325/api/v1/browser/local-active');
    console.log('response', response);
    const browsers = response.data.data.list;
    return browsers.length > 0 ? response : null;
  } catch (error) {
    console.error('Error checking browser status:', error);
    return null;
  }
}
