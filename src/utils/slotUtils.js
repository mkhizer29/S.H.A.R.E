import { collection, query, where, getDocs, getDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Resolves the real Firebase UID for a professional.
 */
export const resolveProId = async (pro) => {
  if (!pro) return null;
  
  // 1. Get candidate ID from common fields
  const proId = pro.uid || pro.userId || (typeof pro === 'string' ? pro : pro.id);
  
  console.log("[resolveProId] Input:", pro?.name || pro, "Candidate ID:", proId);

  // 2. If it already looks like a real Firebase UID (long string, no spaces)
  if (proId && typeof proId === 'string' && proId.length >= 20 && !proId.includes(' ') && proId !== 'demo-pro') {
    return proId;
  }

  try {
    // 3. Try to fetch the professional document to see if it has a hidden uid/userId field
    // Some docs might use the 'id' field to store a slug but have the real UID inside
    if (proId && typeof proId === 'string') {
      const proDoc = await getDoc(doc(db, 'professionals', proId));
      if (proDoc.exists()) {
        const data = proDoc.data();
        if (data.uid) return data.uid;
        if (data.userId) return data.userId;
      }
    }

    // 4. Fallback: Search users collection by name/alias
    const searchName = pro.name || pro.alias || (typeof pro === 'string' ? pro : null);
    if (searchName) {
      console.log("[resolveProId] Falling back to name search for:", searchName);
      // Try alias first
      let userQuery = query(collection(db, 'users'), where('alias', '==', searchName));
      let userSnap = await getDocs(userQuery);
      
      // If no alias match, try name
      if (userSnap.empty) {
        userQuery = query(collection(db, 'users'), where('name', '==', searchName));
        userSnap = await getDocs(userQuery);
      }

      if (!userSnap.empty) {
        const foundId = userSnap.docs[0].id;
        console.log("[resolveProId] Found UID via search:", foundId);
        return foundId;
      }
    }
  } catch (err) {
    console.error("[resolveProId] Error:", err);
  }
  
  console.warn("[resolveProId] Could not resolve real UID, using candidate:", proId);
  return proId || 'demo-pro';
};

export const getAvailableSlots = async (pro, daysCount = 14) => {
  try {
    const resolvedId = await resolveProId(pro);
    if (!resolvedId) return [];

    console.log(`[getAvailableSlots] Starting check for ${resolvedId}. Days: ${daysCount}`);

    // 1. Fetch Active Availability Rules for this professional
    const availQuery = query(
      collection(db, 'availability'), 
      where('professionalId', '==', resolvedId),
      where('isActive', '==', true)
    );
    const availSnap = await getDocs(availQuery);
    const rules = availSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (rules.length === 0) {
      console.log("[getAvailableSlots] No availability rules found for:", resolvedId);
      return [];
    }

    // 2. Fetch Existing Bookings to exclude overlaps
    const startOfRange = new Date();
    startOfRange.setHours(0, 0, 0, 0);
    const endOfRange = new Date(startOfRange);
    endOfRange.setDate(endOfRange.getDate() + daysCount);

    let bookings = [];
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('professionalId', '==', resolvedId), // FIXED: used resolvedId
        where('status', '==', 'upcoming')
      );
      const bookingsSnap = await getDocs(bookingsQuery);
      bookings = bookingsSnap.docs.map(doc => {
        const data = doc.data();
        let startsAt = data.startsAt;
        if (startsAt && typeof startsAt.toDate === 'function') {
          startsAt = startsAt.toDate();
        } else {
          startsAt = new Date(startsAt);
        }
        
        return {
          id: doc.id,
          ...data,
          startsAt
        };
      }).filter(b => b.startsAt >= startOfRange && b.startsAt <= endOfRange);
      console.log(`[getAvailableSlots] Found ${bookings.length} upcoming bookings for ${resolvedId}`);
    } catch (bookingErr) {
      console.error("[getAvailableSlots] Booking fetch failed:", bookingErr);
    }

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
                const bStart = b.startsAt.getTime();
                const bEnd = bStart + (b.duration || 50) * 60000;
                const sStart = slotStart.getTime();
                const sEnd = slotEnd.getTime();
                
                const overlaps = (sStart < bEnd && sEnd > bStart);
                if (overlaps) {
                  console.log(`[getAvailableSlots] Slot ${slotStart.toISOString()} is BOOKED by booking ${b.id}`);
                }
                return overlaps;
              });

              daySlots.push({
                startsAt: new Date(slotStart),
                endsAt: new Date(slotEnd),
                duration: slotDuration,
                isBooked: isBooked
              });
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

    return days;
  } catch (error) {
    console.error("[getAvailableSlots] Error:", error);
    throw error;
  }
};
