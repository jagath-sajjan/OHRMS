import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyD9y33i4U1Svwww81KbrR2_xW-p_peyUU8',
  authDomain: 'ohrms-3c37a.firebaseapp.com',
  projectId: 'ohrms-3c37a',
  storageBucket: 'ohrms-3c37a.firebasestorage.app',
  messagingSenderId: '531759624025',
  appId: '1:531759624025:web:99253f3796fbc44508a648'
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const firebaseAuth = getAuth(app)
