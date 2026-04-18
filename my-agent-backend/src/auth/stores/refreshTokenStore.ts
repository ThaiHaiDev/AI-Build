import type { Role } from '../constants.js';

/**
 * ⚠️ In-memory store cho scaffold. Production → swap sang Redis:
 *   KEY  refresh:<hash>  → JSON { userId, email, role, family, expiresAt }
 *   TTL  khớp JWT_REFRESH_TTL
 */
interface RefreshRecord {
  userId:   string;
  email:    string;
  role:     Role;
  family:   string;
  expiresAt: number;  // epoch ms
}

const store = new Map<string, RefreshRecord>();
// family → Set<hash> để revoke toàn bộ family khi phát hiện reuse
const familyIndex = new Map<string, Set<string>>();

export const refreshTokenStore = {
  async save(hash: string, rec: RefreshRecord): Promise<void> {
    store.set(hash, rec);
    if (!familyIndex.has(rec.family)) familyIndex.set(rec.family, new Set());
    familyIndex.get(rec.family)!.add(hash);
  },

  async get(hash: string): Promise<RefreshRecord | null> {
    const rec = store.get(hash);
    if (!rec) return null;
    if (rec.expiresAt < Date.now()) {
      store.delete(hash);
      return null;
    }
    return rec;
  },

  /** Consume = get + delete. Nếu trả null ⇒ token không tồn tại hoặc đã dùng. */
  async consume(hash: string): Promise<RefreshRecord | null> {
    const rec = await this.get(hash);
    if (rec) {
      store.delete(hash);
      familyIndex.get(rec.family)?.delete(hash);
    }
    return rec;
  },

  /** Revoke toàn bộ family — dùng khi detect reuse (token theft). */
  async revokeFamily(family: string): Promise<void> {
    const hashes = familyIndex.get(family);
    if (!hashes) return;
    for (const h of hashes) store.delete(h);
    familyIndex.delete(family);
  },

  /** Revoke tất cả token của một user — dùng khi logout-all / đổi password. */
  async revokeUser(userId: string): Promise<void> {
    for (const [hash, rec] of store.entries()) {
      if (rec.userId === userId) {
        store.delete(hash);
        familyIndex.get(rec.family)?.delete(hash);
      }
    }
  },
};
