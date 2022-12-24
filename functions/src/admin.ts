import * as corsImport from 'cors';
import * as functions from 'firebase-functions';
import { log } from 'firebase-functions/logger';
import { TableName } from './common/types';
import { db } from './common/singletons';
import { gzip } from 'pako';
import admin from 'firebase-admin';

let cors = corsImport.default as any as Function;

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
export const compressOldSavegames = functions.runWith({timeoutSeconds: 540})
  .https.onRequest(async (req, res) => {
    cors()(req, res, async () => {
      let table: TableName = 'states';

      let usersGames = await db.collection(table)
        .get();
      let docsNotCompressed = usersGames.docs
        .filter(d => !(d.data()?.isCompressed?.isTrue));

      log(`Found [${docsNotCompressed.length}] rows that are not compressed yet.`);

      for (let row of docsNotCompressed) {
        let data = row.data();
        let names = Object.keys(data);

        for (let name of names) {
          let details = row.get(name);
          let isCompressed = typeof details.state !== 'string';
          if (isCompressed) {
            continue;
          }

          let compressedState = gzip(details.state);
          let bytes = compressedState;

          details.state = bytes;

          await db.doc(row.ref.path).set({[name]: details}, {merge: true});
        }

        await row.ref.set({isCompressed: true}, {merge: true});

        log(`User [${row.id}] has [${names.length}] not compressed savegames`);
      }

      return res.sendStatus(200);
    });
  });

/**
 * Version v1.2.6 introduces compressed savegame state. This function will remove the isCompressed field
 * left in by compressOldSavegames()
 */
export const removeIsCompressedField = functions.runWith({timeoutSeconds: 540})
  .https.onRequest(async (req, res) => {
    cors()(req, res, async () => {
      let table: TableName = 'states';

      let usersGames = await db.collection(table)
        .get();
      let docsNotCompressed = usersGames.docs
        .filter(d => !(d.data()?.isCompressed?.isTrue));

      log(`Found [${docsNotCompressed.length}] rows that are not compressed yet.`);

      for (let row of docsNotCompressed) {
        await row.ref.update({
          isCompressed: admin.firestore.FieldValue.delete()
        });
        log(`User [${row.id}], removed isCompressed`);
      }

      return res.sendStatus(200);
    });
  });
