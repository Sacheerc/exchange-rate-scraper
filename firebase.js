var admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require('./firebase-config.json');

//Setting secrets from the environment
serviceAccount.private_key = process.env.private_key;
serviceAccount.private_key_id = process.env.private_key_id;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

module.exports = {
  db,
};
