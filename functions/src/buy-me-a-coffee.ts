import * as cors from 'cors';
import * as functions from 'firebase-functions';
import axios from 'axios';
import { initializeApp } from 'firebase-admin';
import { log } from 'firebase-functions/lib/logger';

const app = initializeApp();
const db = app.firestore();

export type TableName = 'users' | 'states';

/** Function is replaced by webhook.
 * Can be used for manual validation by the user (or if user does not have an account yet, but already supported)
 */
export const isEmailACustomer = functions.https.onRequest(async (req, res) => {
  cors()(req, res, async () => {
    let apiKey = functions.config().buymeacoffeeapi.id;
    let result: any = await axios.get('https://developers.buymeacoffee.com/api/v1/supporters', {
      headers: {Authorization: `Bearer ${apiKey}`},
    });

    let allCustomers: string[] = result.data.data.map((c: any) => c.payer_email);

    let isCustomer = allCustomers.some(email => email === req.query.email);
    log(`Email [${req.query.email}] is ${isCustomer ? '' : 'not'} a customer`);

    return res.json({isCustomer});
  });
});

export const webhookNewSupporter = functions.https.onRequest(async (req, res) => {
  cors()(req, res, async () => {
    let apiKey = functions.config().buymeacoffeeapi.id;
    let result: any = await axios.get('https://developers.buymeacoffee.com/api/v1/supporters', {
      headers: {Authorization: `Bearer ${apiKey}`},
    });

    let allCustomers: string[] = result.data.data.map((c: any) => c.payer_email);

    let usersTable: TableName = 'users';
    let newCustomers = await db.collection(usersTable)
      .where('email', 'in', allCustomers)
      .where('isCustomer', '!=', 'true')
      .get();

    for (const user of newCustomers.docs) {
      await user.ref.set({isCustomer: true}, {merge: true});

      let details = user.data();
      log(`Added new customer: [${details.email}]`);
    }

    return res.sendStatus(200);
  });
});

//response example
// {
//   "response" : {
//   "supporter_email" : "test@test.com",
//     "number_of_coffees" : "1",
//     "total_amount" : "3",
//     "support_created_on" : "2021-11-15 14:43:29"
// }
// }
