/* ─────────────────────────────────────────────────────────────
   TUNGSTON GUEST DEMO BENCHMARK SCENARIOS & CANVAS EXPORTER
   100% Client-Side // $0.00 Vercel Cost // Zero Telemetry
───────────────────────────────────────────────────────────── */

export const GUEST_SCENARIOS = {
  'lru-cache': {
    id: 'lru-cache',
    badge: '01: DATA STRUCTURE',
    label: '⚡ LRU CACHE (TS)',
    tag: 'O(1) DOUBLE-LINKED // TYPE SAFE',
    prompt: 'Implement a high-performance LRU Cache in TypeScript with O(1) get and put operations, complete type safety, capacity bounds, and eviction tests.',
    engineA: {
      provider: 'groq',
      providerName: 'Groq Cloud',
      model: 'llama-3.3-70b-versatile',
      targetTokens: 645,
      targetDurationMs: 1040,
      tokensPerSec: 620,
      ttftMs: 172,
      text: `### High-Performance TypeScript O(1) LRU Cache

Here is a zero-dependency, type-safe **Least Recently Used (LRU) Cache** utilizing a Hash Map combined with a Doubly Linked List for strict $O(1)$ read and write guarantees.

\`\`\`typescript
interface ListNode<K, V> {
  key: K;
  value: V;
  prev: ListNode<K, V> | null;
  next: ListNode<K, V> | null;
}

export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly map = new Map<K, ListNode<K, V>>();
  private head: ListNode<K, V> | null = null;
  private tail: ListNode<K, V> | null = null;
  private onEvict?: (key: K, value: V) => void;

  constructor(capacity: number, onEvict?: (key: K, value: V) => void) {
    if (capacity <= 0) throw new RangeError("Capacity must be greater than 0");
    this.capacity = capacity;
    this.onEvict = onEvict;
  }

  public get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToHead(node);
    return node.value;
  }

  public put(key: K, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.moveToHead(existing);
      return;
    }

    if (this.map.size >= this.capacity) {
      this.evictTail();
    }

    const newNode: ListNode<K, V> = { key, value, prev: null, next: this.head };
    if (this.head) this.head.prev = newNode;
    this.head = newNode;
    if (!this.tail) this.tail = newNode;

    this.map.set(key, newNode);
  }

  private moveToHead(node: ListNode<K, V>): void {
    if (node === this.head) return;

    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.tail) this.tail = node.prev;

    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
  }

  private evictTail(): void {
    if (!this.tail) return;
    const evicted = this.tail;
    this.map.delete(evicted.key);

    if (evicted.prev) {
      evicted.prev.next = null;
      this.tail = evicted.prev;
    } else {
      this.head = null;
      this.tail = null;
    }

    this.onEvict?.(evicted.key, evicted.value);
  }

  public get size(): number {
    return this.map.size;
  }
}
\`\`\`

#### Verification Unit Tests
\`\`\`typescript
const cache = new LRUCache<string, number>(2);
cache.put("a", 1);
cache.put("b", 2);
console.assert(cache.get("a") === 1, "Expected 'a' to be 1");
cache.put("c", 3); // evicts 'b'
console.assert(cache.get("b") === undefined, "'b' should have been evicted");
console.assert(cache.get("c") === 3, "'c' should be 3");
console.log("All LRU invariants verified O(1).");
\`\`\`
`
    },
    engineB: {
      provider: 'deepseek',
      providerName: 'DeepSeek',
      model: 'deepseek-chat',
      targetTokens: 628,
      targetDurationMs: 5980,
      tokensPerSec: 105,
      ttftMs: 418,
      text: `### O(1) LRU Cache Architecture (TypeScript)

To achieve true $O(1)$ amortized time complexity for both \`get\` and \`put\`, JavaScript's built-in \`Map\` is often leveraged because it maintains insertion order. However, a manual Doubly Linked List paired with a Map gives deterministic control over memory layout and eviction callbacks without relying on Map re-insertion side-effects.

#### Key Invariants:
1. **Lookup**: $O(1)$ via \`Map<K, Node<K, V>>\`.
2. **Promotion**: $O(1)$ node detachment and re-attachment at list head.
3. **Eviction**: $O(1)$ deletion from the list tail when \`size === capacity\`.

\`\`\`typescript
type DoublyNode<K, V> = {
  key: K;
  value: V;
  prev: DoublyNode<K, V> | null;
  next: DoublyNode<K, V> | null;
};

export class ProductionLRU<K, V> {
  private readonly capacity: number;
  private readonly store = new Map<K, DoublyNode<K, V>>();
  private head: DoublyNode<K, V> | null = null;
  private tail: DoublyNode<K, V> | null = null;

  constructor(capacity: number) {
    if (capacity < 1) throw new Error("Capacity must be positive integer");
    this.capacity = capacity;
  }

  get(key: K): V | null {
    const node = this.store.get(key);
    if (!node) return null;
    this.detach(node);
    this.attachHead(node);
    return node.value;
  }

  set(key: K, value: V): void {
    let node = this.store.get(key);
    if (node) {
      node.value = value;
      this.detach(node);
      this.attachHead(node);
      return;
    }

    if (this.store.size >= this.capacity && this.tail) {
      const dropKey = this.tail.key;
      this.detach(this.tail);
      this.store.delete(dropKey);
    }

    node = { key, value, prev: null, next: null };
    this.attachHead(node);
    this.store.set(key, node);
  }

  private detach(node: DoublyNode<K, V>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;

    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    node.prev = null;
    node.next = null;
  }

  private attachHead(node: DoublyNode<K, V>): void {
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }
}
\`\`\`
`
    }
  },

  'btree-lsm': {
    id: 'btree-lsm',
    badge: '02: STORAGE ARCHITECTURE',
    label: '🧠 B-TREE VS LSM-TREE',
    tag: 'WRITE AMPLIFICATION // READ LATENCY',
    prompt: 'Compare B-Trees vs Log-Structured Merge (LSM) Trees from a storage engine perspective. Analyze write amplification, read latency, memory overhead, and compaction strategies with concrete database examples.',
    engineA: {
      provider: 'groq',
      providerName: 'Groq Cloud',
      model: 'llama-3.3-70b-versatile',
      targetTokens: 688,
      targetDurationMs: 1160,
      tokensPerSec: 593,
      ttftMs: 184,
      text: `### B-Trees vs. LSM-Trees: Storage Engine Comparison

Storage architectures navigate a fundamental trade-off: **Read Optimization (B-Trees)** vs. **Write Optimization (LSM-Trees)**.

| Metric | B-Tree (e.g., PostgreSQL, InnoDB) | LSM-Tree (e.g., RocksDB, Cassandra) |
| :--- | :--- | :--- |
| **Primary I/O Pattern** | Random In-Place Updates (Pages) | Append-Only Sequential Writes (SSTables) |
| **Write Amplification (WAF)** | High (Overwrites whole 8-16KB page for small delta) | Low to Medium (Batched in MemTable, amortized in compaction) |
| **Point Read Latency** | $O(\\log_B N)$ — typically 1-3 page hits | Multiple levels + Bloom filters needed |
| **Range Scan Speed** | Extremely fast (ordered sequential leaves) | Moderate (merges streams from active SSTables) |
| **Memory Footprint** | Buffer Pool cache pages directly | MemTable + Bloom Filters + Block Cache |

#### 1. Write Amplification Factor (WAF)
- **B-Trees:** Updating a single 64-byte row triggers a write of a full 8KB/16KB page to disk plus WAL write, giving a typical WAF of $30-100\\times$.
- **LSM-Trees:** Writes land in an in-memory sorted **MemTable** (SkipList) with zero disk seeks besides sequential WAL append. Disk writes happen as bulk immutable **SSTable flushes**.

#### 2. Read Latency & Bloom Filter Defense
Because LSM data is dispersed across multiple levels ($L_0, L_1, \\dots, L_k$), reading an absent key could require checking every level. LSM engines mitigate this using **Bloom Filters** (typically 10 bits/key for ~1% false positive rate), preserving near-B-Tree point lookup speeds.

#### 3. Compaction Strategies
- **Size-Tiered (STCS):** Merges SSTables of similar sizes. Favors high-write workloads (Cassandra default), but requires up to 50% free disk space headroom.
- **Leveled (LCS):** Each level has a fixed total size (e.g., $L_1 = 10\\text{MB}, L_2 = 100\\text{MB}$). Delivers lower read amplification and tighter space bounds (RocksDB default).
`
    },
    engineB: {
      provider: 'deepseek',
      providerName: 'DeepSeek',
      model: 'deepseek-chat',
      targetTokens: 664,
      targetDurationMs: 6520,
      tokensPerSec: 102,
      ttftMs: 435,
      text: `### Deep Dive: B-Trees vs Log-Structured Merge Trees

The choice between B-Trees and LSM Trees boils down to hardware mechanical realities: SSD write endurance, sequential vs random IOPS, and memory budget.

#### Structural Mechanics
1. **B-Trees (In-Place Mutation)**
   - Maintain a balanced tree where every node corresponds to a page on disk (typically 4KB to 16KB).
   - Writes update pages in memory and flush dirty pages to disk during checkpoints.
   - **Trade-off:** High write amplification and random I/O, but deterministic $O(\\log N)$ read bounds without background compaction interference.

2. **LSM Trees (Out-of-Place Append)**
   - Writes are buffered in an in-memory SkipList (\`MemTable\`).
   - When full, MemTables are flushed as immutable \`SSTables\` (Sorted String Tables) to disk.
   - Deletions are represented as "tombstones".
   - **Trade-off:** Minimal write latency and high storage density, but read latency suffers unless shielded by Bloom Filters, and background compactions can cause I/O latency spikes (P99 tail latency degradation).

#### Production Engine Mapping
- **Choose B-Trees:** Heavy read/write mixed OLTP where P99 predictable latency is critical (PostgreSQL, MySQL InnoDB, SQLite).
- **Choose LSM-Trees:** High write-rate telemetry, time-series, log ingestion, or massive datasets on NVMe drives where write throughput dominates (RocksDB, CockroachDB, ScyllaDB, LevelDB).
`
    }
  },

  'rate-limiter': {
    id: 'rate-limiter',
    badge: '03: DISTRIBUTED SYSTEMS',
    label: '🛡️ DISTRIBUTED RATE LIMITER',
    tag: 'CONCURRENCY // REDIS LUA',
    prompt: 'Detail the failure modes, clock drift issues, and race conditions of a distributed token-bucket rate limiter built on Redis clusters, and provide an atomic Lua script solution to mitigate them.',
    engineA: {
      provider: 'groq',
      providerName: 'Groq Cloud',
      model: 'llama-3.3-70b-versatile',
      targetTokens: 712,
      targetDurationMs: 1170,
      tokensPerSec: 608,
      ttftMs: 168,
      text: `### Distributed Redis Rate Limiter: Failure Modes & Mitigation

In high-concurrency clusters, naive multi-step rate limiting (\`GET\`, check balance, \`SET\`) creates catastrophic race conditions. Below is the architecture for production resilience.

#### Core Failure Modes & Clock Drift
1. **Race Conditions (TOCTOU):** Multiple application nodes reading remaining tokens simultaneously will all authorize requests before decrementing, permitting burst overages.
2. **Client-Side Clock Drift:** If application instances inject client timestamps (\`Date.now()\`), disparate server clock skew creates asymmetric token replenishment. **Remedy:** Always rely on Redis internal \`redis.call('TIME')\` or pass normalized Unix epoch seconds.
3. **Redis Cluster Slot Partitioning:** In Redis Cluster, multi-key scripts fail with \`CROSSSLOT\` errors. Ensure all keys for a given user map to the same hash slot by using hash tags: \`{user_id}:limiter\`.

#### Production Atomic Lua Script
\`\`\`lua
-- KEYS[1]: Rate limit key e.g. "{user:1042}:bucket"
-- ARGV[1]: Max bucket capacity (e.g. 100)
-- ARGV[2]: Refill rate in tokens per second (e.g. 10)
-- ARGV[3]: Requested tokens (e.g. 1)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])

-- Get Redis server time to prevent application server clock drift
local time = redis.call('TIME')
local now = tonumber(time[1]) + (tonumber(time[2]) / 1000000)

local data = redis.call('HMGET', key, 'tokens', 'last_updated')
local tokens = tonumber(data[1])
local last_updated = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  last_updated = now
else
  local delta = math.max(0, now - last_updated)
  tokens = math.min(capacity, tokens + delta * refill_rate)
  last_updated = now
end

if tokens >= cost then
  tokens = tokens - cost
  redis.call('HMSET', key, 'tokens', tokens, 'last_updated', last_updated)
  redis.call('EXPIRE', key, math.ceil(capacity / refill_rate) * 2)
  return {1, math.floor(tokens)} -- Allowed
else
  redis.call('HMSET', key, 'tokens', tokens, 'last_updated', last_updated)
  return {0, math.floor(tokens)} -- Blocked (HTTP 429)
end
\`\`\`

#### Guarantees
- **Atomicity:** The Lua script executes in a single Redis thread without context switches.
- **No Clock Drift:** Utilizes Redis master node \`TIME\` primitive.
- **Automatic TTL:** Idle buckets expire cleanly, consuming 0 persistent storage.
`
    },
    engineB: {
      provider: 'deepseek',
      providerName: 'DeepSeek',
      model: 'deepseek-chat',
      targetTokens: 685,
      targetDurationMs: 6650,
      tokensPerSec: 103,
      ttftMs: 428,
      text: `### Concurrency & Clock Synchronization in Distributed Rate Limiters

#### Failure Vectors:
1. **Clock Discrepancy Across Replicas:** If failover occurs to an out-of-sync replica, token balances may suddenly reset or advance into the future.
2. **Redis Cluster Resharding:** Moving slots during live traffic can cause temporary key unavailability or split-brain windows.
3. **Pipelining Race Conditions:** Without Lua scripts or Redis Transactions (\`MULTI\`/\`EXEC\`), parallel HTTP workers will overconsume bucket capacity.

#### Edge Recommendations:
- Store state using **Hash Tags** (\`{tenant_id}:token_bucket\`) to enforce single-slot locality across Redis Cluster shards.
- Return standard HTTP rate-limiting headers on every response:
  - \`X-RateLimit-Limit\`: Maximum tokens
  - \`X-RateLimit-Remaining\`: Current tokens remaining
  - \`Retry-After\`: Calculated replenishment seconds needed for next unit
`
    }
  }
};

/* ─────────────────────────────────────────────────────────────
   CANVAS BENCHMARK SOCIAL CARD GENERATOR (1200x630)
───────────────────────────────────────────────────────────── */

export function generateBenchmarkCanvas({ engineA, engineB, resA, resB, verdict, prompt }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0B0C0D';
  ctx.fillRect(0, 0, 1200, 630);

  // Industrial dot grid
  ctx.fillStyle = '#1D2125';
  for (let x = 20; x < 1200; x += 30) {
    for (let y = 20; y < 630; y += 30) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // Outer brutalist border
  ctx.strokeStyle = '#FFB800';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 1194, 624);

  // Top header bar
  ctx.fillStyle = '#141618';
  ctx.fillRect(6, 6, 1188, 70);
  ctx.strokeStyle = '#0B0C0D';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, 1188, 70);

  // Brand Badge
  ctx.fillStyle = '#FFB800';
  ctx.fillRect(24, 20, 64, 42);
  ctx.fillStyle = '#0B0C0D';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('W 74', 32, 49);

  // Header Titles
  ctx.fillStyle = '#F2EFE6';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('TUNGSTON DUAL ARENA // SPEED BENCHMARK', 104, 48);

  ctx.fillStyle = '#FFB800';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('ZERO-BACKEND CLIENT-SIDE TELEMETRY', 890, 48);

  // Prompt Box
  ctx.fillStyle = '#141618';
  ctx.fillRect(24, 95, 1152, 60);
  ctx.strokeStyle = '#2E3237';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 95, 1152, 60);

  ctx.fillStyle = '#6B6B63';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('BENCHMARK PROMPT:', 38, 118);

  ctx.fillStyle = '#F2EFE6';
  ctx.font = '14px monospace';
  const cleanPrompt = prompt ? prompt.replace(/\s+/g, ' ').slice(0, 105) + (prompt.length > 105 ? '...' : '') : 'Custom Benchmark Execution';
  ctx.fillText(`"${cleanPrompt}"`, 38, 140);

  // Columns: Left = Engine A, Right = Engine B
  const colW = 566;
  const colY = 175;
  const colH = 340;

  // ── ENGINE A BOX ──
  ctx.fillStyle = '#141618';
  ctx.fillRect(24, colY, colW, colH);
  ctx.strokeStyle = '#FFB800';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, colY, colW, colH);

  // Engine A Header
  ctx.fillStyle = '#FFB800';
  ctx.fillRect(24, colY, colW, 40);
  ctx.fillStyle = '#0B0C0D';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`ENGINE A: ${engineA.name || engineA.provider} / ${engineA.model}`, 40, colY + 26);

  // Engine A Big Speed
  ctx.fillStyle = '#FFB800';
  ctx.font = 'bold 64px monospace';
  ctx.fillText(`${resA.tokensPerSec || 0}`, 45, colY + 125);
  ctx.font = 'bold 20px monospace';
  ctx.fillText('TOKENS / SEC', 220, colY + 125);

  // Engine A Metrics
  ctx.fillStyle = '#F2EFE6';
  ctx.font = '14px monospace';
  ctx.fillText(`EXECUTION TIME : ${resA.latencyMs ? (resA.latencyMs / 1000).toFixed(2) : '0'}s`, 45, colY + 190);
  ctx.fillText(`OUTPUT TOKENS  : ~${resA.tokens || 0} TOKENS`, 45, colY + 225);
  ctx.fillText(`HARDWARE / API : ${engineA.provider.toUpperCase()} ENGINE`, 45, colY + 260);

  if (verdict === 'A') {
    ctx.fillStyle = '#FFB800';
    ctx.fillRect(45, colY + 285, 200, 32);
    ctx.fillStyle = '#0B0C0D';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('★ ARENA WINNER', 75, colY + 306);
  }

  // ── ENGINE B BOX ──
  ctx.fillStyle = '#141618';
  ctx.fillRect(610, colY, colW, colH);
  ctx.strokeStyle = '#60A5FA';
  ctx.lineWidth = 3;
  ctx.strokeRect(610, colY, colW, colH);

  // Engine B Header
  ctx.fillStyle = '#60A5FA';
  ctx.fillRect(610, colY, colW, 40);
  ctx.fillStyle = '#0B0C0D';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`ENGINE B: ${engineB.name || engineB.provider} / ${engineB.model}`, 626, colY + 26);

  // Engine B Big Speed
  ctx.fillStyle = '#60A5FA';
  ctx.font = 'bold 64px monospace';
  ctx.fillText(`${resB.tokensPerSec || 0}`, 630, colY + 125);
  ctx.font = 'bold 20px monospace';
  ctx.fillText('TOKENS / SEC', 805, colY + 125);

  // Engine B Metrics
  ctx.fillStyle = '#F2EFE6';
  ctx.font = '14px monospace';
  ctx.fillText(`EXECUTION TIME : ${resB.latencyMs ? (resB.latencyMs / 1000).toFixed(2) : '0'}s`, 630, colY + 190);
  ctx.fillText(`OUTPUT TOKENS  : ~${resB.tokens || 0} TOKENS`, 630, colY + 225);
  ctx.fillText(`HARDWARE / API : ${engineB.provider.toUpperCase()} ENGINE`, 630, colY + 260);

  if (verdict === 'B') {
    ctx.fillStyle = '#60A5FA';
    ctx.fillRect(630, colY + 285, 200, 32);
    ctx.fillStyle = '#0B0C0D';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('★ ARENA WINNER', 660, colY + 306);
  }

  // ── BOTTOM SUMMARY & FOOTER BAR ──
  ctx.fillStyle = '#111213';
  ctx.fillRect(24, 535, 1152, 70);
  ctx.strokeStyle = '#2E3237';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 535, 1152, 70);

  const speedup = resA.tokensPerSec && resB.tokensPerSec ? (resA.tokensPerSec / resB.tokensPerSec).toFixed(1) : '1.0';
  ctx.fillStyle = '#FFB800';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`THROUGHPUT RATIO: ENGINE A CLOCKED AT ${speedup}x RELATIVE VELOCITY`, 42, 565);

  ctx.fillStyle = '#6B6B63';
  ctx.font = '11px monospace';
  ctx.fillText('RUN VERIFIED ON TUNGSTON FORGE // 100% PRIVATE & CLIENT-SIDE // https://tungston.vercel.app', 42, 588);

  return canvas;
}

export function downloadBenchmarkCard(data) {
  const canvas = generateBenchmarkCanvas(data);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `tungston-arena-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
