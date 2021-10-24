import * as cors from 'cors';
import * as functions from 'firebase-functions';
import axios from 'axios';

export const isEmailACustomer = functions.https.onRequest(async (req, res) => {
  cors()(req, res, async () => {
    let apiKey = functions.config().buymeacoffeeapi.id;
    let result: any = await axios.get('https://developers.buymeacoffee.com/api/v1/supporters', {
      headers: {Authorization: `Bearer ${apiKey}`},
    });

    let allCustomers: string[] = result.data.data.map((c: any) => c.payer_email);

    let isCustomer = allCustomers.some(email => email === req.query.email);

    return res.json({isCustomer});
  });
});
