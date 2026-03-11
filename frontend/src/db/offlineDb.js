import Dexie from 'dexie';

export const offlineDb = new Dexie('LandSurveyOfflineDB');

offlineDb.version(1).stores({
  pendingLands: '++id, title, userId, createdAt' // Primary key id, and some indexed fields
});
