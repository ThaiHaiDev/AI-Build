/**
 * ⚠️ In-memory blacklist cho access token jti.
 * Production → Redis SET revoked:<jti> với TTL = JWT_ACCESS_TTL.
 */
const revoked = new Map<string, number>(); // jti → expireAt (epoch ms)

export const revokedTokenStore = {
  async revoke(jti: string, ttlSec: number): Promise<void> {
    revoked.set(jti, Date.now() + ttlSec * 1000);
  },
  async isRevoked(jti: string): Promise<boolean> {
    const exp = revoked.get(jti);
    if (!exp) return false;
    if (exp < Date.now()) { revoked.delete(jti); return false; }
    return true;
  },
};
