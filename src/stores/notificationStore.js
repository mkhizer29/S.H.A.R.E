import { create } from 'zustand'
import { db } from '../lib/firebase'
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  writeBatch,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  _unsubscribe: null,

  subscribeNotifications: (userId) => {
    if (!userId) return;

    // Cleanup previous subscription
    const { _unsubscribe } = get();
    if (_unsubscribe) _unsubscribe();

    set({ isLoading: true, error: null });

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      })
      .slice(0, 20);

      const unreadCount = notifications.filter(n => !n.read).length;

      set({ 
        notifications, 
        unreadCount, 
        isLoading: false 
      });
    }, (error) => {
      console.error("[NotificationStore] Subscription error:", error);
      set({ error: error.message, isLoading: false });
    });

    set({ _unsubscribe: unsubscribe });
  },

  markAsRead: async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error("[NotificationStore] Error marking as read:", error);
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, 'notifications', n.id), {
          read: true,
          readAt: serverTimestamp()
        });
      });
      await batch.commit();
    } catch (error) {
      console.error("[NotificationStore] Error marking all as read:", error);
    }
  },

  cleanup: () => {
    const { _unsubscribe } = get();
    if (_unsubscribe) _unsubscribe();
    set({ notifications: [], unreadCount: 0, _unsubscribe: null });
  }
}));

/**
 * Utility to create a notification in Firestore
 */
export const createNotification = async (notifData) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notifData,
      read: false,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("[NotificationStore] Error creating notification:", error);
    return false;
  }
};
