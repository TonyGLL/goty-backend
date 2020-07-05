import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({

    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://games-graphic.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {

    response.json({
        
        message: "Hello from Firebase Functions!"
    });
});

export const getGOTY = functions.https.onRequest(async (request, response) => {

    // const name = request.query.name || 'Without name';
    
    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const games = docsSnap.docs.map(doc => doc.data());

    response.json(games);
});

// Express
const app = express();
app.use(cors({ origin: true }));

app.get('/goty', async (req, res) => {

    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const games = docsSnap.docs.map(doc => doc.data());

    res.json(games);
});

app.post('/goty/:id', async (req, res) => {

    const id = req.params.id;
    const gameRef = db.collection('goty').doc(id);
    const gameSnap = await gameRef.get();

    if (!gameSnap.exists) {
        
        res.status(400).json({

            ok: false,
            message : 'There is no game with that ID: ' + id
        });
    }else {

        const before = gameSnap.data() || { votes: 0 };
        await gameRef.update({

            votes: before.votes + 1
        });

        res.json({

            ok: true,
            message: `Thanks for your vote to ${before.name}`
        });
    }
});

export const api = functions.https.onRequest(app);