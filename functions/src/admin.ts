import * as cors from 'cors';
import * as functions from 'firebase-functions';
import { log } from 'firebase-functions/lib/logger';
import { TableName } from './common/types';
import { db } from './common/singletons';
import { firestore } from 'firebase-admin';
import FieldPath = firestore.FieldPath;
import { gzip } from 'pako';

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

/**
 * Version v1.2.6 introduces compressed savegame state. This function will compress all old savegames
 * to save on cloud storage
 */
export const compressOldSavegames = functions.https.onRequest(async (req, res) => {
  cors()(req, res, async () => {
    let table: TableName = 'states';

    let usersGames = await db.collection(table)
      .where(FieldPath.documentId(), '==', '5ldJmvzL4AQJyepdNhPmPoICPVr1')
      .limit(3)
      .get();

    for (let savegameList of usersGames.docs) {
      let data = savegameList.data();
      let savegameNames = Object.keys(data);

      let needsUpdateList = savegameNames.map(name =>
        ({name, version: Number(data[name].version.join(''))}))
        .filter(({version}) => version < 126);

      for (let old of needsUpdateList) {
        let savegameDetails = savegameList.get(old.name);
        let compressed = gzip(savegameDetails.state);

        savegameDetails.state = compressed;

        await savegameList.ref.update(old.name, savegameDetails)
      }

      log(
`User [${savegameList.id}] has [${savegameNames.length}] savegames,
  [${needsUpdateList.length}] of which needs compressing.
  [${needsUpdateList.map(({name}) => '[' + name + ']').join(',')}]
`);
    }

    return res.sendStatus(200);
  });
});


