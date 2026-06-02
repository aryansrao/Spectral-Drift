import { sha256hex, verifyObj } from './crypto';
import type { OrbDef } from './world';

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface ClaimTx {
  id: string;
  sig: string;
  type: 'claim';
  from: string;
  to: string;
  orbId: number;
  orbType: 'common' | 'uncommon' | 'rare';
  nonce: string;
  ts: number;
}

export interface TransferTx {
  id: string;
  sig: string;
  type: 'transfer';
  from: string;
  to: string;
  amount: { common: number; uncommon: number; rare: number };
  nonce: string;
  ts: number;
}

export type Transaction = ClaimTx | TransferTx;
export type Ledger = Transaction[];

export interface Balance {
  common: number;
  uncommon: number;
  rare: number;
}

// ─── BALANCE ─────────────────────────────────────────────────────────────────
export function getBalance(pubKey: string, ledger: Ledger): Balance {
  const b: Balance = { common: 0, uncommon: 0, rare: 0 };
  for (const tx of ledger) {
    if (tx.type === 'claim' && tx.from === pubKey) {
      b[tx.orbType]++;
    } else if (tx.type === 'transfer') {
      if (tx.from === pubKey) {
        b.common -= tx.amount.common || 0;
        b.uncommon -= tx.amount.uncommon || 0;
        b.rare -= tx.amount.rare || 0;
      }
      if (tx.to === pubKey) {
        b.common += tx.amount.common || 0;
        b.uncommon += tx.amount.uncommon || 0;
        b.rare += tx.amount.rare || 0;
      }
    }
  }
  return b;
}

// ─── VALIDATION ──────────────────────────────────────────────────────────────
export async function validateTx(
  tx: unknown,
  ledger: Ledger,
  txSet: Set<string>,
  offenders: Map<string, number>,
  orbDefs: OrbDef[],
  BLACKLIST_AT = 3
): Promise<string> {
  if (
    !tx || typeof tx !== 'object' ||
    !(tx as Record<string, unknown>).id ||
    !(tx as Record<string, unknown>).sig ||
    !(tx as Record<string, unknown>).type ||
    !(tx as Record<string, unknown>).from
  ) return 'malformed';

  const t = tx as Transaction;
  if (txSet.has(t.id)) return 'duplicate';
  if ((offenders.get(t.from) || 0) >= BLACKLIST_AT) return 'blacklisted';

  const { id, sig, ...data } = t as unknown as Record<string, unknown>;
  void id; // used for hash check below

  if (!(await verifyObj(data as object, sig as string, t.from))) return 'bad_sig';

  const expected = await sha256hex(JSON.stringify({ ...data, sig }));
  if (expected !== t.id) return 'bad_hash';

  const ORB_TYPES = ['common', 'uncommon', 'rare'] as const;

  if (t.type === 'claim') {
    if (ledger.some(tx2 => tx2.type === 'claim' && tx2.orbId === t.orbId)) return 'already_claimed';
    const orb = orbDefs[t.orbId];
    if (!orb || orb.type !== t.orbType) return 'invalid_orb';
  } else if (t.type === 'transfer') {
    if (t.from === t.to) return 'self_transfer';
    if (!t.amount || typeof t.amount !== 'object') return 'malformed';
    const bal = getBalance(t.from, ledger);
    let total = 0;
    for (const k of ORB_TYPES) {
      const amt = t.amount[k] || 0;
      if (amt < 0) return 'negative';
      if (bal[k] < amt) return 'insufficient';
      total += amt;
    }
    if (total === 0) return 'empty';
  } else {
    return 'unknown_type';
  }

  return 'ok';
}

// ─── APPLY ───────────────────────────────────────────────────────────────────
export function applyTxToLedger(tx: Transaction, ledger: Ledger, txSet: Set<string>): void {
  ledger.push(tx);
  txSet.add(tx.id);
}
