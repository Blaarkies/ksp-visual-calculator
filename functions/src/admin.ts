import * as cors from 'cors';
import * as functions from 'firebase-functions';

/**
 * Used by Feedback Dialog. This stores the feedback, and notify with an email that feedback has been received.
 */
export const captureFeedback = functions.https.onRequest(async (req, res) => {
  cors()(req, res, async () => {
    // let apiKey = functions.config().emailSendToAddress.id;
    throw new Error('[captureFeedback] Not implemented!');

    return res.sendStatus(200);
  });
});
