import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyChtJH9_aLYGcZl_UOxVkyp71nXJxhpxrc",
  authDomain: "share-platform-2a6a2.firebaseapp.com",
  projectId: "share-platform-2a6a2",
  storageBucket: "share-platform-2a6a2.firebasestorage.app",
  messagingSenderId: "465260747733",
  appId: "1:465260747733:web:80fe41a0c138b1cb48bb5c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyAllPros() {
  console.log('--- Verifying All Professionals ---');
  try {
    const prosSnap = await getDocs(collection(db, 'professionals'));
    console.log(`Found ${prosSnap.size} professionals.`);
    
    for (const proDoc of prosSnap.docs) {
      console.log(`Updating ${proDoc.id} (verified: true)...`);
      await updateDoc(doc(db, 'professionals', proDoc.id), {
        verified: true,
        updatedAt: new Date().toISOString()
      });
    }
    console.log('Professionals update complete.');
  } catch (error) {
    console.error('Error verifying professionals:', error);
  }

  console.log('\n--- Activating All Availability Rules ---');
  try {
    const availSnap = await getDocs(collection(db, 'availability'));
    console.log(`Found ${availSnap.size} availability rules.`);
    
    for (const availDoc of availSnap.docs) {
      console.log(`Updating ${availDoc.id} (isActive: true)...`);
      await updateDoc(doc(db, 'availability', availDoc.id), {
        isActive: true,
        updatedAt: new Date().toISOString()
      });
    }
    console.log('Availability update complete.');
  } catch (error) {
    console.error('Error activating availability:', error);
  }
}

verifyAllPros();
