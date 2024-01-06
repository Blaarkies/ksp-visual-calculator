import * as functions from 'firebase-functions';
import { log } from 'firebase-functions/logger';
import { Supporter, TableName, UserData } from './common/types';
import { db } from './common/singletons';
import {
  gzip,
  ungzip,
} from 'pako';
import admin from 'firebase-admin';
import { distinct, getAllBmacSupporters, getUniqueDateKey, uid } from './common/tools';

import * as corsImport from 'cors';
import {
  writeFileSync,
  mkdirSync,
  existsSync,
} from 'fs';

let cors = corsImport.default({
  origin: ['https://ksp-visual-calculator.blaarkies.com'],
}) as unknown as (req: functions.https.Request,
                  res: functions.Response,
                  callback: () => void) => void;

/**
 * Used by Feedback Dialog. This stores the feedback, and notify with an email that feedback has been received.
 */
export const captureFeedback = functions
  .https.onRequest(async (req, res) => cors(req, res, async () => {
  // let feedbackEmail = functions.config().emailSendToAddress.id;

  let key = getUniqueDateKey();

  await db.doc(`${<TableName>'feedback'}/${key}`)
    .set({...req.body});

  log(`Saved feedback [${Object.values(req.body).join().slice(0, 50)}] to document [${key}]`);

  res.sendStatus(200);
  return;
}));

/**
 * Version v1.2.6 introduces compressed savegame state. This function will compress all old savegames
 * to save on cloud storage
 */
export const compressOldSavegames = functions.runWith({timeoutSeconds: 540})
  .https.onRequest(async (req, res) => {

    let usersGames = await db.collection(<TableName>'states')
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

    res.sendStatus(200);
    return;
  });

/**
 * Version v1.2.6 introduces compressed savegame state. This function will remove the isCompressed field
 * left in by compressOldSavegames()
 */
export const removeIsCompressedField = functions.runWith({timeoutSeconds: 540})
  .https.onRequest(async (req, res) => {

    let usersGames = await db.collection(<TableName>'states')
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

    res.sendStatus(200);
    return;
  });

/**
 * Upgrade existing supporter users into the supporters table.
 */
export const upgradeIsCustomerToSupportersTable = functions
  .runWith({timeoutSeconds: 540})
  .https.onRequest(async (req, res) => {
    let dbCustomers = await db.collection(<TableName>'users')
      .where('isCustomer', '==', true)
      .get();

    log(`Found ${dbCustomers.docs.length} isCustomer users in firestore db.`);
    let allSupporters: Supporter[] = dbCustomers.docs
      .map(d => {
        let data = d.data() as UserData;
        return {
          email: data.email,
          joined: d.createTime.toDate(),
          type: 'once-off',
          user: d.ref,
        };
      });

    let allBmacSupporters = await getAllBmacSupporters();

    let bmacSupportersAsDbRows = allBmacSupporters.map(b => ({
      email: b.payer_email,
      joined: new Date(b.support_created_on),
      type: 'once-off',
    } as Supporter));
    allSupporters.push(...bmacSupportersAsDbRows);

    let uniqueSupporters = distinct(
      allSupporters.sort((a, b) => (a.user ? 1 : 0) - (b.user ? 1 : 0)),
      s => s.email);
    log(`We have ${uniqueSupporters.length} supporters in total.`);

    let refUserCount = uniqueSupporters.filter(s => s.user).length;
    log(`Adding ${refUserCount} rows with references ids, and ${uniqueSupporters.length - refUserCount} unmatched rows.`)

    for (const supporter of uniqueSupporters) {
      await db.collection(<TableName>'supporters')
        .doc(supporter.user?.id ?? `unmatched-${uid()}`)
        .set(supporter);
    }

    res.sendStatus(200)
    return;
  });

export const collectOldVersionSavegames = functions.runWith({timeoutSeconds: 540})
  .https.onRequest(async (req, res) => {

    let savegames = await db.collection(<TableName>'states').get();

    let collectedVersions = new Set()
    let states = [];
    for (let row of savegames.docs) {
      let data = row.data();
      let gameNames = Object.keys(data);
      for (let gameName of gameNames) {
        let details = row.get(gameName);

        let versionString = details.version.toString();
        if (collectedVersions.has(versionString)) {
          continue;
        }

        collectedVersions.add(versionString);
        let unzipped = ungzip(details.state, {to: 'string'});
        let jsonState = {
          ...details,
          state: JSON.parse(unzipped),
        };
        states.push(JSON.stringify(jsonState));
      }

      if (collectedVersions.size > 10) {
        break;
      }
    }

    if (!existsSync('dist')) {
      mkdirSync('dist');
    }
    states.forEach(s => writeFileSync(`dist/${JSON.parse(s).version}.json`, s, {encoding: 'utf8'}))

    res.sendStatus(200);
    return;
  });
