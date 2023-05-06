import { Supporter, TableName } from './types';
import { db } from './singletons';
import * as functions from 'firebase-functions';
import V1SupportersResponse = Bmac.V1SupportersResponse;
import log = functions.logger.log;

export function uid(): string {
  return [1, 2, 3]
    .map(() => ((Math.random() * 9e8) | 0).toString(36))
    .join('')
    .slice(-17)
    .padEnd(17, (Math.round(Math.random() * 35)).toString(36));
}

let getFirst = q => q.docs?.[0];

export async function getFirstSupporterDoc(email: string): Promise<Supporter> {
  let supportersQuery = await db.collection(<TableName>'supporters')
    .where('email', '==', email)
    .limit(1)
    .get().then(getFirst);
  return supportersQuery as unknown as Supporter;
}

export async function getFirstUserDoc(email: string) {
  let userQuery = await db.collection(<TableName>'users')
    .where('email', '==', email)
    .limit(1)
    .get().then(getFirst);
  return userQuery;
}

export function listNumbers(count = 3): number[] {
  return [...Array(count).keys()];
}

export function getUniqueDateKey(): string {
  return new Date().toLocaleString('en-GB', {
      month: '2-digit',
      year: 'numeric',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .split(',')
      .map((text, i) => i === 0
        ? text
          .split('/')
          .reduce<string[]>((sum, c) => [c, ...sum], [])
          .join('.')
        : text)
      .join('')
    + ' >' + (Math.round(Math.random() * 9e7)).toString(36);
}

export function distinct<T>(list: Array<T>, keySelector: (item: T) => any): Array<T> {
  return Array.from(
    new Map(list.map(s => [keySelector(s), s]))
      .values());
}

export async function getAllBmacSupporters(): Promise<Bmac.Supporter[]> {
  let apiKey = functions.config().bmac.authtoken;

  let bmacData = await fetch(
    'https://developers.buymeacoffee.com/api/v1/supporters', {
      headers: {Authorization: `Bearer ${apiKey}`},
      method: 'GET',
    })
    .then(response => response.json())
    .then(json => json as V1SupportersResponse);

  log(`Calling buymeacoffee api ${bmacData.to} times to get all pages.`);

  let pageNumbers = listNumbers(bmacData.to).map(n => n + 1);
  let allBmacSupporters: Bmac.Supporter[] = [];
  for (const page of pageNumbers) {
    let supporters = await fetch(
      `https://developers.buymeacoffee.com/api/v1/supporters?page=${page}`, {
        headers: {Authorization: `Bearer ${apiKey}`},
        method: 'GET',
      })
      .then(response => response.json())
      .then(json => json as V1SupportersResponse)
      .then(json => json.data);

    allBmacSupporters.push(...supporters);
  }

  log(`Found ${allBmacSupporters.length} supporters on Buy me a coffee.`);

  return allBmacSupporters;
}
