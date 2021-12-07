import * as cors from 'cors';
import * as functions from 'firebase-functions';
import { log } from 'firebase-functions/lib/logger';
import { TableName } from './common/types';
import { db } from './common/singletons';

function getUniqueDateKey(): string {
  return new Date().toLocaleString(undefined, {
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

/**
 * Used by Feedback Dialog. This stores the feedback, and notify with an email that feedback has been received.
 */
export const captureFeedback = functions.https.onRequest(async (req, res) => {
  cors()(req, res, async () => {
    // let apiKey = functions.config().emailSendToAddress.id;

    let feedbackTable: TableName = 'feedback';
    let key = getUniqueDateKey();

    await db.doc(`${feedbackTable}/${key}`)
      .set({...req.body});

    log(`Saved feedback [${Object.values(req.body).join().slice(0, 50)}] to document [${key}]`);

    return res.sendStatus(200);
  });
});


