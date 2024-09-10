/* eslint-disable @typescript-eslint/no-explicit-any */
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { writeFile } from 'fs/promises';
import { GMAIL_PASSWORD, GMAIL_USER } from '../config';

const imapConfig = {
  imap: {
    user: GMAIL_USER!,
    password: GMAIL_PASSWORD!,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,

    tlsOptions: { servername: 'imap.gmail.com' },
    authTimeout: 3000,
  },
};

export async function getBybitSecurityCode() {
  try {
    const connection = await imaps.connect(imapConfig);

    await connection.openBox('INBOX');

    const searchCriteria = [
      //   ['FROM', 'notification@bybit.com, support@email-service.bybit.com'],
      ['SUBJECT', '[Bybit]Код безопасности для аккаунта Bybit'],
      ['UNSEEN'],
    ];

    const fetchOptions = {
      bodies: ['HEADER', 'TEXT'],
      markSeen: true,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    if (messages.length === 0) {
      console.log('No new Bybit emails found.');
      return;
    }

    for (const message of messages) {
      // console.log(message)
      const allParts = message.parts.filter((part: any) => part.which === 'TEXT');
      const rawBody = allParts[0].body;

      const parsed = await simpleParser(rawBody);
      // console.log(parsed)
      const emailBody = parsed.text || parsed.html || '';
      //   const decodedBody = quotedPrintable.decode(emailBody).toString();

      //   console.log('emailBody', emailBody)
      await writeFile('src/drops/bybit-wl/test.txt', emailBody!);

      const code = extractSecurityCode(emailBody);

      if (code) {
        console.log(`Bybit security code: ${code}`);
        return code;
      } else {
        console.log('Security code not found in this email.');
      }
    }

    await connection.end();
  } catch (error) {
    console.error('Failed to retrieve emails:', error);
  }
}

function extractSecurityCode(emailBody: string): string | null {
  // console.log(emailBody)
  //   const regex = /код безопасности:\s*(\d+)/; // Adjust regex as needed
  const regex = /lor: #ff9c2e;">([0-9]{6})<\/span>/i;

  const match = emailBody.match(regex);
  //   console.log('match', match);
  return match ? match[1] : null;
}

// getBybitSecurityCode().catch(console.error);
