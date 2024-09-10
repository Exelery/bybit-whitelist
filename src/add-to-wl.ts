import { wait } from './utils/wait.js';

import { Page } from 'playwright';

import twofactor from 'node-2fa';
import { appendFile, readFile } from 'fs/promises';
import { getBybitSecurityCode } from './utils/gmail';
import {
  CHAIN,
  FAILED_ADDRESSES_FILE,
  IS_INTERNAL,
  SUCCESSFUL_ADDRESSES_FILE,
  TWO_FA,
} from './config.js';
import { getBrowserPage } from './utils/browser.js';
// console.log(newToken)

function get2fa() {
  return twofactor.generateToken(TWO_FA)!;
}

export async function processBybit(addresses: string[]) {
  const page = await getBrowserPage();
  if (!page) {
    console.log('no page');
    return;
  }
  for (const address of addresses) {
    const added = (await readFile(SUCCESSFUL_ADDRESSES_FILE, 'utf-8')).split('\n');
    const failed = (await readFile(FAILED_ADDRESSES_FILE, 'utf-8')).split('\n');
    try {
      if (![...added, ...failed].includes(address)) await handleAddress(address, page);
    } catch (error) {
      console.error(`Error processing Bybit ID ${address}:`, error);
    }
  }
}

async function handleAddress(address: string, page: Page) {
  console.log('start to add', address);

  if (page) {
    await page.bringToFront();
    await wait(3, 4);
    await page.click('button.moly-btn.bg-brandColor-bds-brand-700-normal');

    if (IS_INTERNAL) {
      await page.getByText('Внутренний перевод').click();
      await page.click('p.money__address-internal-address-type > span:nth-of-type(3)');
    } else {
      await page.click('div.money__address-common-switch > button');
      // await page.click('input#chain_type');
      const selector = page.locator('input#chain_type');
      // \selector.selectOption()
      await selector.click();
      await wait(2, 2);
      // await selector.selectOption( 'SOL')
      const findedOption = page.locator(`div[label="${CHAIN}"]`);
      while (!(await findedOption.isVisible())) {
        const coordinates = await (await page
          .locator('div.ant-select-item-option-content')
          .all())[4]
          .boundingBox();
        await page.mouse.move(
          coordinates!.x + coordinates!.width / 2,
          coordinates!.y + coordinates!.height / 2,
        );
        await page.mouse.wheel(0, 50);
        console.log('test');
        await wait(1, 1);
      }
      await page.locator(`div[label="${CHAIN}"]`).click();
      await wait(1, 1);

      // await page.getByText('SOL').click();
    }
    await page.fill('#address', address);
    await page.check('input#is_verified');

    const button = page.locator('div.money__address-submit-wrapper > button');
    await button.click();
    await wait(2, 2);
    if (await page.getByText('Такого аккаунта не существует').isVisible()) {
      console.log(address);
      // await appendFile('src/drops/bybit-wl/data/failed.txt', `${bybitId}\n`);
    } else {
      await page.getByText('Проверка безопасности').waitFor();
      const fields = await page.locator('[title="code"]').all();

      if (fields.length > 0) {
        do {
          const fa = get2fa();
          const faSplited = fa.token.split('');

          for (const field of fields) {
            await field.fill(faSplited.shift()!);
          }
          await wait(20, 20);
        } while (
          (await page
            .getByText('Код Google Authenticator действует всего 30 секунд.')
            .isVisible()) ||
          (await page.getByText('Код верификации не совпадает').isVisible())
        );
      }

      const emailVerif = page.locator('div.by-safety-reset-btn');
      if (await emailVerif.isVisible()) {
        await emailVerif.click();

        let code;

        let counter = 0;
        do {
          if (counter > 4) {
            await wait(600, 600);
            await page.reload();
            return;
            // await emailVerif.click();
          }
          await wait(7, 7);
          code = await getBybitSecurityCode();
          counter++;
        } while (!code);
        if (code) {
          const input = page.locator(
            'input[placeholder="Введите код подтверждения из эл. письма"]',
          );
          await input.fill(code);
        }

        let count = 0;
        do {
          if (count) await wait(10, 10);

          const input = page.locator('input[placeholder="Введите код Google Authenticator"]');
          const fa = get2fa();
          await input.fill(fa.token);

          await wait(1, 1);
          await page.locator(`div.by-security-show-modal-footer > button`).click();

          count++;
          await wait(2, 2);
        } while (
          (await page
            .getByText('Код Google Authenticator действует всего 30 секунд.')
            .isVisible()) ||
          (await page.getByText('Код верификации не совпадает').isVisible())
        );
      }
    }

    const closeBtn = page.locator('span.ant-modal-close-x');
    await wait(3, 4);
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await appendFile(FAILED_ADDRESSES_FILE, `${address}\n`);
    } else {
      await appendFile(SUCCESSFUL_ADDRESSES_FILE, `${address}\n`);
    }
    await wait(10, 20);
  }
}
