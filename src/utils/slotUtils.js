import { collection, query, where, getDocs, getDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Resolves the real Firebase UID for a professional.
 */
export const resolveProId = async (pro) => {
  if (!pro) return null;
  const proId = pro.uid || pro.userId || (typeof pro === 'string' ? pro : pro.id);
  
  // 1. If it already looks like a real Firebase UID (long string, no spaces)
  if (proId && proId.length >= 20 && !proId.includes(' ') && proId !== 'demo-pro') {
    return proId;
  }

  try {
    // 2. Try to fetch the professional document to see if it has a hidden uid/userId field
    if (proId) {
      const proDoc = await getDoc(doc(db, 'professionals', proId));
      if (proDoc.exists()) {
        const data = proDoc.data();
        if (data.uid) return data.uid;
        if (data.userId) return data.userId;
      }
    }

    // 3. Fallback: Search users collection by name/alias
    const searchName = pro.name || pro.alias || (typeof pro === 'string' ? pro : null);
    if (searchName) {
      // Try alias first
      let userQuery = query(collection(db, 'users'), where('alias', '==', searchName));
      let userSnap = await getDocs(userQuery);
      
      // If no alias match, try name
      if (userSnap.empty) {
        userQuery = query(collection(db, 'users'), where('name', '==', searchName));
        userSnap = await getDocs(userQuery);
      }

      if (!userSnap.empty) {
        return userSnap.docs[0].id;
      }
    }
  } catch (err) {
    console.error("[resolveProId] Error:", err);
  }
  
  return proId || 'demo-pro';
};

export const getAvailableSlots = async (pro, daysCount = 14) => {
  try {
    const resolvedId = await resolveProId(pro);
    if (!resolvedId) return [];

    // 1. Fetch ALL active Availability Rules (more resilient than strict ID query for now)
    const availSnap = await getDocs(query(collection(db, 'availability'), where('isActive', '==', true)));
    const rules = availSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(r => {
        const rId = String(r.professionalId || '').trim();
        const targetId = String(resolvedId).trim();
        return rId === targetId || rId.replace(/\s/g, '') === targetId.replace(/\s/g, '');
      });

    if (rules.length === 0) return [];

    // 2. Fetch Existing Bookings to exclude overlaps
    const startOfRange = new Date();
    startOfRange.setHours(0, 0, 0, 0);
    const endOfRange = new Date(startOfRange);
    endOfRange.setDate(endOfRange.getDate() + daysCount);

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('professionalId', '==', proId),
      where('status', '==', 'upcoming')
    );
    const bookingsSnap = await getDocs(bookingsQuery);
    const bookings = bookingsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        startsAt: new Date(data.startsAt)
      };
    }).filter(b => b.startsAt >= startOfRange && b.startsAt <= endOfRange);

    // 3. Generate Slots
    const days = [];
    const now = new Date();

    for (let i = 0; i < daysCount; i++) {
      const currentDay = new Date();
      currentDay.setDate(now.getDate() + i);
      currentDay.setHours(0, 0, 0, 0);

      const dayOfWeek = currentDay.getDay();
      const dayRules = rules.filter(r => Number(r.dayOfWeek) === dayOfWeek);

      const daySlots = [];

      dayRules.forEach(rule => {
        const [startH, startM] = rule.startTime.split(':').map(Number);
        const [endH, endM] = rule.endTime.split(':').map(Number);
        const slotDuration = rule.slotDuration || 50;
        const breakMinutes = rule.breakMinutes || 10;

        let slotStart = new Date(currentDay);
        slotStart.setHours(startH, startM, 0, 0);

        const dayEnd = new Date(currentDay);
        dayEnd.setHours(endH, endM, 0, 0);

        while (slotStart < dayEnd) {
          const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
          
          if (slotEnd <= dayEnd) {
            // Check if slot is in the future
            if (slotStart > now) {
              // Check for overlaps with existing bookings
              const isBooked = bookings.some(b => {
                const bStart = b.startsAt;
                const bEnd = new Date(bStart.getTime() + (b.duration || 50) * 60000);
                // Simple overlap check
                return (slotStart < bEnd && slotEnd > bStart);
              });

              if (!isBooked) {
                daySlots.push({
                  startsAt: new Date(slotStart),
                  endsAt: new Date(slotEnd),
                  duration: slotDuration
                });
              }
            }
          }
          // Move to next slot start (including break)
          slotStart = new Date(slotEnd.getTime() + breakMinutes * 60000);
        }
      });

      if (daySlots.length > 0) {
        days.push({
          date: currentDay,
          slots: daySlots.sort((a, b) => a.startsAt - b.startsAt)
        });
      }
    }

    // DIAGNOSTIC: Add a dummy slot if no slots found to test UI
    if (days.length === 0) {
      const dummyDate = new Date("2026-05-01T10:00:00");
      days.push({
        date: new Date("2026-05-01T00:00:00"),
        slots: [{
          startsAt: dummyDate,
          endsAt: new Date(dummyDate.getTime() + 50 * 60000),
          duration: 50,
          isDummy: true
        }]
      });
    }

    return days;
  } catch (error) {
    console.error("[getAvailableSlots] Error:", error);
    throw error;
  }
};
