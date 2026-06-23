import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import config from '../../firebase-applet-config.json';

export function getFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({
      projectId: config.projectId,
    });
  }
  return {
    auth: getAuth(),
    firestore: getFirestore(getApp(), config.firestoreDatabaseId),
  };
}
