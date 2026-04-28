
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './src/lib/firebase';

async function debug() {
  console.log("Checking bookings...");
  const q = query(collection(db, 'bookings'));
  const snap = await getDocs(q);
  snap.docs.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}

debug();
