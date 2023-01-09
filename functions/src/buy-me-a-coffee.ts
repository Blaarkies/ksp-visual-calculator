import * as functions from 'firebase-functions';
import { log } from 'firebase-functions/logger';
import { db } from './common/singletons';
import { Supporter, TableName } from './common/types';
import { getAllBmacSupporters, getFirstSupporterDoc, getFirstUserDoc, uid } from './common/tools';
import WebhookRequest = Bmac.WebhookRequest;

import * as corsImport from 'cors';

let cors = corsImport.default({
  origin: ['https://ksp-visual-calculator.blaarkies.com'],
}) as unknown as (req: functions.https.Request,
                  res: functions.Response,
                  callback: () => void) => void;

/**
 * Verify if account is a supporter.
 * Used for manual validation by the user (or if user does not have an account yet, but already supported)
 */
export const isEmailACustomer = functions
  .https.onRequest(async (req, res) => cors(req, res, async () => {
    let allBmacSupporters = await getAllBmacSupporters();

    let allCustomers: string[] = allBmacSupporters.map(c => c.payer_email);

    let queryEmail = req.query.email;
    let isCustomer = allCustomers.some(email => email === queryEmail);

    log(`Email [${queryEmail}] is ${isCustomer ? '' : 'not'} a customer`);

    if (!isCustomer) {
      res.json({isCustomer});
      return;
    }

    let dbUserQuery = await db.collection(<TableName>'users')
      .where('email', '==', queryEmail)
      .limit(1)
      .get();
    let dbUser = dbUserQuery.docs[0];

    if (dbUser?.ref) {
      let dbSupporterQuery = await db.doc(`${<TableName>'supporters'}/${dbUser.id}`).get();
      if (dbSupporterQuery?.ref) {
        log(`User [${queryEmail}] found in firebase, with Supporters row already.`);
        res.json({isCustomer});
        return;
      }

      log(`User [${queryEmail}] found in firebase, without a Supporters row. Adding a Supporter row.`);
      await db.collection(<TableName>'supporters')
        .doc(dbUser.ref.id)
        .set({
          email: queryEmail,
          joined: dbUser.createTime.toDate(),
          type: 'once-off',
          user: dbUser.ref,
        } as Supporter);
    }
  }));

/**
 * Webhook called by BuyMeACoffee when a new purchase was made. This in turn will immediately update
 * the user's KSP Visual Calculator account to premium status.
 */
export const webhookNewSupporter = functions
  .https.onRequest(async (req, res) => {
    // let webhookSecret = functions.config().bmac.webhooksecret;
    let data: WebhookRequest = req.body.response;

    let existingSupporter = await getFirstSupporterDoc(data.supporter_email);
    if (existingSupporter) {
      log(`Supporter ${existingSupporter.email} already exists. Skipping this request.`);
      res.sendStatus(200)
      return;
    }

    let supporterDoc = {
      email: data.supporter_email,
      type: 'once-off',
      joined: new Date(data.support_created_on),
    } as Supporter;

    let userDoc = await getFirstUserDoc(data.supporter_email);

    if (!userDoc) {
      log(`No user found that matches ${data.supporter_email}. Saving supporter entry.`);
      await db.collection(<TableName>'supporters')
        .doc(`unmatched-${uid()}`)
        .set(supporterDoc);

      res.sendStatus(200)
      return;
    }

    await db.collection(<TableName>'supporters')
      .doc(userDoc.ref.id)
      .set({
        ...supporterDoc,
        user: userDoc.ref,
      });

    // backward compatible for old table
    log(`Set user [${data.supporter_email}] isCustomer [true].`);
    await userDoc.ref.set({isCustomer: true}, {merge: true});

    res.sendStatus(200)
    return;
  });
