import type {
  RiskLevel,
  Transaction,
  TransactionCategory,
  TransactionStatus,
} from "@/types";

function randomHex(length: number): string {
  const chars = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < length; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

export const COUNTRY_COORDS: Record<
  string,
  { lat: number; lng: number; city: string }
> = {
  US: { lat: 39.8283, lng: -98.5795, city: "Springfield" },
  UK: { lat: 51.5074, lng: -0.1278, city: "London" },
  DE: { lat: 52.52, lng: 13.405, city: "Berlin" },
  MT: { lat: 35.9375, lng: 14.3754, city: "Valletta" },
  SG: { lat: 1.3521, lng: 103.8198, city: "Singapore" },
  NG: { lat: 6.5244, lng: 3.3792, city: "Lagos" },
  PH: { lat: 14.5995, lng: 120.9842, city: "Manila" },
  IN: { lat: 19.076, lng: 72.8777, city: "Mumbai" },
  ES: { lat: 40.4168, lng: -3.7038, city: "Madrid" },
  FR: { lat: 48.8566, lng: 2.3522, city: "Paris" },
  RU: { lat: 55.7558, lng: 37.6173, city: "Moscow" },
  UA: { lat: 50.4501, lng: 30.5234, city: "Kyiv" },
  GH: { lat: 5.6037, lng: -0.187, city: "Accra" },
  RO: { lat: 44.4268, lng: 26.1025, city: "Bucharest" },
  JP: { lat: 35.6762, lng: 139.6503, city: "Tokyo" },
  BR: { lat: -23.5505, lng: -46.6333, city: "São Paulo" },
  CA: { lat: 43.6532, lng: -79.3832, city: "Toronto" },
  AU: { lat: -33.8688, lng: 151.2093, city: "Sydney" },
  MX: { lat: 19.4326, lng: -99.1332, city: "Mexico City" },
  ZA: { lat: -26.2041, lng: 28.0473, city: "Johannesburg" },
  AE: { lat: 25.2048, lng: 55.2708, city: "Dubai" },
  CN: { lat: 31.2304, lng: 121.4737, city: "Shanghai" },
  IT: { lat: 45.4642, lng: 9.19, city: "Milan" },
  IE: { lat: 53.3498, lng: -6.2603, city: "Dublin" },
};

export interface MerchantDef {
  name: string;
  category: TransactionCategory;
  countries: string[];
}

export const merchants: MerchantDef[] = [
  {
    name: "Amazon.com",
    category: "ONLINE_PURCHASE",
    countries: ["US", "UK", "DE"],
  },
  {
    name: "Walmart Supercenter",
    category: "POINT_OF_SALE",
    countries: ["US"],
  },
  {
    name: "Chase ATM #4892",
    category: "ATM_WITHDRAWAL",
    countries: ["US"],
  },
  {
    name: "Binance Exchange",
    category: "CRYPTO_EXCHANGE",
    countries: ["MT", "SG"],
  },
  {
    name: "Western Union",
    category: "WIRE_TRANSFER",
    countries: ["NG", "PH", "IN"],
  },
  {
    name: "Shell Gas Station",
    category: "POINT_OF_SALE",
    countries: ["US", "UK"],
  },
  {
    name: "Zara Online Store",
    category: "ONLINE_PURCHASE",
    countries: ["ES", "FR"],
  },
  {
    name: "International Wire #8821",
    category: "WIRE_TRANSFER",
    countries: ["RU", "UA"],
  },
  {
    name: "Coinbase Pro",
    category: "CRYPTO_EXCHANGE",
    countries: ["US"],
  },
  {
    name: "Unknown POS Terminal",
    category: "POINT_OF_SALE",
    countries: ["NG", "GH"],
  },
  {
    name: "Starbucks Reserve",
    category: "POINT_OF_SALE",
    countries: ["US", "JP", "UK"],
  },
  {
    name: "Netflix Subscription",
    category: "BILL_PAYMENT",
    countries: ["US", "BR", "DE"],
  },
  {
    name: "Venmo P2P",
    category: "PEER_TO_PEER",
    countries: ["US"],
  },
  {
    name: "PayPal Transfer",
    category: "PEER_TO_PEER",
    countries: ["US", "UK", "DE"],
  },
  {
    name: "Target Store",
    category: "POINT_OF_SALE",
    countries: ["US"],
  },
  {
    name: "Best Buy Electronics",
    category: "ONLINE_PURCHASE",
    countries: ["US", "CA"],
  },
  {
    name: "Uber Eats",
    category: "ONLINE_PURCHASE",
    countries: ["US", "MX", "BR"],
  },
  {
    name: "HSBC Wire Desk",
    category: "WIRE_TRANSFER",
    countries: ["UK", "IN", "AE"],
  },
  {
    name: "Kraken Exchange",
    category: "CRYPTO_EXCHANGE",
    countries: ["US", "UK"],
  },
  {
    name: "Local Grocery Co-op",
    category: "POINT_OF_SALE",
    countries: ["US", "CA"],
  },
  {
    name: "Electric Company AutoPay",
    category: "BILL_PAYMENT",
    countries: ["US", "UK"],
  },
  {
    name: "International POS RO-991",
    category: "INTERNATIONAL",
    countries: ["RO", "DE"],
  },
  {
    name: "Alipay Merchant",
    category: "ONLINE_PURCHASE",
    countries: ["CN", "SG"],
  },
  {
    name: "Goldman Sachs Wire",
    category: "WIRE_TRANSFER",
    countries: ["US", "UK"],
  },
  {
    name: "ATM Network ZA",
    category: "ATM_WITHDRAWAL",
    countries: ["ZA"],
  },
  {
    name: "Spotify Premium",
    category: "BILL_PAYMENT",
    countries: ["US", "DE", "BR"],
  },
  {
    name: "Cash App Send",
    category: "PEER_TO_PEER",
    countries: ["US"],
  },
  {
    name: "DoorDash",
    category: "ONLINE_PURCHASE",
    countries: ["US", "CA", "AU"],
  },
  {
    name: "Revolut Top-up",
    category: "INTERNATIONAL",
    countries: ["UK", "DE", "FR"],
  },
  {
    name: "Stripe Test Merchant",
    category: "ONLINE_PURCHASE",
    countries: ["US", "IE"],
  },
];

export type UserProfile = {
  userId: string;
  userName: string;
  userEmail: string;
  homeCountry: string;
  homeCity: string;
  typicalMin: number;
  typicalMax: number;
  categories: TransactionCategory[];
  riskProfile: "low" | "medium" | "high";
};

export const userProfiles: UserProfile[] = [
  {
    userId: "USR-001",
    userName: "Priya Sharma",
    userEmail: "priya.s@email.com",
    homeCountry: "IN",
    homeCity: "Mumbai",
    typicalMin: 20,
    typicalMax: 200,
    categories: ["ONLINE_PURCHASE", "BILL_PAYMENT", "POINT_OF_SALE"],
    riskProfile: "low",
  },
  {
    userId: "USR-002",
    userName: "James Wilson",
    userEmail: "jwilson@email.com",
    homeCountry: "US",
    homeCity: "Austin",
    typicalMin: 15,
    typicalMax: 350,
    categories: ["POINT_OF_SALE", "ONLINE_PURCHASE", "PEER_TO_PEER"],
    riskProfile: "medium",
  },
  {
    userId: "USR-003",
    userName: "Elena Popescu",
    userEmail: "elena.p@email.com",
    homeCountry: "RO",
    homeCity: "Bucharest",
    typicalMin: 30,
    typicalMax: 400,
    categories: ["ONLINE_PURCHASE", "WIRE_TRANSFER"],
    riskProfile: "medium",
  },
  {
    userId: "USR-004",
    userName: "Kenji Tanaka",
    userEmail: "k.tanaka@email.com",
    homeCountry: "JP",
    homeCity: "Tokyo",
    typicalMin: 50,
    typicalMax: 500,
    categories: ["POINT_OF_SALE", "BILL_PAYMENT"],
    riskProfile: "low",
  },
  {
    userId: "USR-005",
    userName: "Amara Okafor",
    userEmail: "amara.o@email.com",
    homeCountry: "NG",
    homeCity: "Lagos",
    typicalMin: 10,
    typicalMax: 150,
    categories: ["PEER_TO_PEER", "POINT_OF_SALE"],
    riskProfile: "high",
  },
  {
    userId: "USR-006",
    userName: "Oliver Smith",
    userEmail: "oliver.s@email.com",
    homeCountry: "UK",
    homeCity: "Manchester",
    typicalMin: 25,
    typicalMax: 280,
    categories: ["ONLINE_PURCHASE", "BILL_PAYMENT"],
    riskProfile: "low",
  },
  {
    userId: "USR-007",
    userName: "Sofia Rossi",
    userEmail: "s.rossi@email.com",
    homeCountry: "IT",
    homeCity: "Milan",
    typicalMin: 40,
    typicalMax: 600,
    categories: ["ONLINE_PURCHASE", "INTERNATIONAL"],
    riskProfile: "medium",
  },
  {
    userId: "USR-008",
    userName: "Marcus Johnson",
    userEmail: "mjohnson@email.com",
    homeCountry: "US",
    homeCity: "Chicago",
    typicalMin: 20,
    typicalMax: 220,
    categories: ["ATM_WITHDRAWAL", "POINT_OF_SALE"],
    riskProfile: "low",
  },
  {
    userId: "USR-009",
    userName: "Yuki Sato",
    userEmail: "y.sato@email.com",
    homeCountry: "JP",
    homeCity: "Osaka",
    typicalMin: 30,
    typicalMax: 300,
    categories: ["CRYPTO_EXCHANGE", "ONLINE_PURCHASE"],
    riskProfile: "high",
  },
  {
    userId: "USR-010",
    userName: "Diego Fernández",
    userEmail: "d.fernandez@email.com",
    homeCountry: "MX",
    homeCity: "Monterrey",
    typicalMin: 15,
    typicalMax: 180,
    categories: ["POINT_OF_SALE", "BILL_PAYMENT"],
    riskProfile: "medium",
  },
  {
    userId: "USR-011",
    userName: "Fatima Al-Farsi",
    userEmail: "fatima.af@email.com",
    homeCountry: "AE",
    homeCity: "Dubai",
    typicalMin: 100,
    typicalMax: 2000,
    categories: ["WIRE_TRANSFER", "INTERNATIONAL"],
    riskProfile: "medium",
  },
  {
    userId: "USR-012",
    userName: "Liam O'Brien",
    userEmail: "liam.ob@email.com",
    homeCountry: "IE",
    homeCity: "Dublin",
    typicalMin: 20,
    typicalMax: 250,
    categories: ["ONLINE_PURCHASE", "PEER_TO_PEER"],
    riskProfile: "low",
  },
  {
    userId: "USR-013",
    userName: "Chen Wei",
    userEmail: "c.wei@email.com",
    homeCountry: "CN",
    homeCity: "Shanghai",
    typicalMin: 50,
    typicalMax: 800,
    categories: ["ONLINE_PURCHASE", "BILL_PAYMENT"],
    riskProfile: "medium",
  },
  {
    userId: "USR-014",
    userName: "Naledi Mokoena",
    userEmail: "n.mokoena@email.com",
    homeCountry: "ZA",
    homeCity: "Johannesburg",
    typicalMin: 25,
    typicalMax: 320,
    categories: ["POINT_OF_SALE", "ATM_WITHDRAWAL"],
    riskProfile: "medium",
  },
  {
    userId: "USR-015",
    userName: "Hannah Müller",
    userEmail: "h.mueller@email.com",
    homeCountry: "DE",
    homeCity: "Berlin",
    typicalMin: 35,
    typicalMax: 450,
    categories: ["ONLINE_PURCHASE", "BILL_PAYMENT"],
    riskProfile: "low",
  },
  {
    userId: "USR-016",
    userName: "Ryan Cooper",
    userEmail: "rcooper@email.com",
    homeCountry: "US",
    homeCity: "Seattle",
    typicalMin: 10,
    typicalMax: 120,
    categories: ["CRYPTO_EXCHANGE", "ONLINE_PURCHASE"],
    riskProfile: "high",
  },
  {
    userId: "USR-017",
    userName: "Isabelle Martin",
    userEmail: "i.martin@email.com",
    homeCountry: "FR",
    homeCity: "Lyon",
    typicalMin: 30,
    typicalMax: 350,
    categories: ["POINT_OF_SALE", "ONLINE_PURCHASE"],
    riskProfile: "low",
  },
  {
    userId: "USR-018",
    userName: "Vikram Patel",
    userEmail: "vikram.p@email.com",
    homeCountry: "IN",
    homeCity: "Bengaluru",
    typicalMin: 20,
    typicalMax: 400,
    categories: ["BILL_PAYMENT", "ONLINE_PURCHASE"],
    riskProfile: "medium",
  },
  {
    userId: "USR-019",
    userName: "Emma Thompson",
    userEmail: "emma.t@email.com",
    homeCountry: "AU",
    homeCity: "Melbourne",
    typicalMin: 25,
    typicalMax: 500,
    categories: ["ONLINE_PURCHASE", "PEER_TO_PEER"],
    riskProfile: "low",
  },
  {
    userId: "USR-020",
    userName: "Alex Rivera",
    userEmail: "arivera@email.com",
    homeCountry: "US",
    homeCity: "Miami",
    typicalMin: 15,
    typicalMax: 900,
    categories: ["WIRE_TRANSFER", "CRYPTO_EXCHANGE"],
    riskProfile: "high",
  },
];

function countryCoords(code: string): { lat: number; lng: number; city: string } {
  const c = COUNTRY_COORDS[code];
  if (c) {
    return {
      lat: c.lat + randomBetween(-2, 2),
      lng: c.lng + randomBetween(-2, 2),
      city: c.city,
    };
  }
  return {
    lat: randomBetween(-40, 55),
    lng: randomBetween(-120, 120),
    city: "Unknown",
  };
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 81) return "CRITICAL";
  if (score >= 61) return "HIGH";
  if (score >= 41) return "MEDIUM";
  if (score >= 21) return "LOW";
  return "SAFE";
}

export interface GeneratorContext {
  fraudRateBias: number;
  transactions: Transaction[];
  patternVelocity: boolean;
  patternGeo: boolean;
  patternAmount: boolean;
  patternVpn: boolean;
  patternNewDevice: boolean;
  patternCardTesting: boolean;
  amountMin: number;
  amountMax: number;
}

const defaultCtx: GeneratorContext = {
  fraudRateBias: 30,
  transactions: [],
  patternVelocity: true,
  patternGeo: true,
  patternAmount: true,
  patternVpn: true,
  patternNewDevice: true,
  patternCardTesting: true,
  amountMin: 5,
  amountMax: 15000,
};

function countRecentTxnsForUser(
  transactions: Transaction[],
  userId: string,
  withinMs: number
): number {
  const cutoff = Date.now() - withinMs;
  return transactions.filter(
    (t) => t.userId === userId && new Date(t.timestamp).getTime() >= cutoff
  ).length;
}

export function generateTransaction(
  ctx: Partial<GeneratorContext> = {}
): Transaction {
  const c = { ...defaultCtx, ...ctx };
  const user = pick(userProfiles);
  const home = COUNTRY_COORDS[user.homeCountry] ?? COUNTRY_COORDS.US!;
  const userLocation = `${user.homeCity}, ${user.homeCountry}`;

  const fraudRoll =
    Math.random() * 100 < Math.min(95, 30 + c.fraudRateBias * 0.5);
  const togglesOk =
    c.patternVelocity ||
    c.patternGeo ||
    c.patternAmount ||
    c.patternVpn ||
    c.patternNewDevice ||
    c.patternCardTesting;

  const isSuspicious = fraudRoll && togglesOk;

  let merchant = pick(
    merchants.filter((m) => m.countries.includes(user.homeCountry))
  );
  if (!merchant) merchant = pick(merchants);

  let merchantCountry = pick(merchant.countries);
  let amount = randomBetween(user.typicalMin, user.typicalMax);
  const flagReasons: string[] = [];
  let isNewDevice = Math.random() < 0.08;
  let isVPN = false;
  let velocityCount = countRecentTxnsForUser(c.transactions, user.userId, 3600000);

  if (isSuspicious) {
    const patterns: string[] = [];
    if (c.patternGeo) patterns.push("GEO");
    if (c.patternVelocity) patterns.push("VEL");
    if (c.patternAmount) patterns.push("AMT");
    if (c.patternVpn) patterns.push("VPN");
    if (c.patternNewDevice) patterns.push("DEV");
    if (c.patternCardTesting) patterns.push("CARD");

    const chosen = patterns.length
      ? pick(patterns)
      : "GEO";

    if (chosen === "GEO" && c.patternGeo) {
      const risky = ["NG", "RU", "GH", "UA"].filter(
        (x) => x !== user.homeCountry
      );
      merchantCountry = pick(risky.length ? risky : ["NG", "RU"]);
      merchant =
        pick(merchants.filter((m) => m.countries.includes(merchantCountry))) ??
        merchant;
      isNewDevice = true;
      flagReasons.push("GEO_ANOMALY");
    } else if (chosen === "VEL" && c.patternVelocity) {
      velocityCount = randomInt(8, 15);
      amount = randomBetween(5, 50);
      flagReasons.push("VELOCITY_EXCEEDED", "CARD_TESTING_SUSPECTED");
    } else if (chosen === "AMT" && c.patternAmount) {
      merchant =
        pick(
          merchants.filter(
            (m) =>
              m.category === "WIRE_TRANSFER" || m.category === "CRYPTO_EXCHANGE"
          )
        ) ?? merchant;
      merchantCountry = pick(merchant.countries);
      amount = randomBetween(3000, 15000);
      flagReasons.push("AMOUNT_3X_AVERAGE", "UNUSUAL_CATEGORY");
    } else if (chosen === "VPN" && c.patternVpn) {
      isVPN = true;
      flagReasons.push("VPN_DETECTED", "PROXY_IP");
    } else if (chosen === "DEV" && c.patternNewDevice) {
      isNewDevice = true;
      const hour = new Date().getUTCHours();
      if (hour >= 2 && hour <= 5) {
        flagReasons.push("NEW_DEVICE", "OFF_HOURS_ACTIVITY");
      } else {
        flagReasons.push("NEW_DEVICE");
      }
    } else if (chosen === "CARD" && c.patternCardTesting) {
      amount = randomBetween(3, 9.99);
      velocityCount = randomInt(5, 10);
      flagReasons.push("CARD_TESTING_PATTERN", "VELOCITY_EXCEEDED");
    }
  }

  amount = Math.max(c.amountMin, Math.min(c.amountMax, amount));
  const mc = countryCoords(merchantCountry);
  const ipBase = isVPN ? "185.220." : "192.168.";
  const ipAddress = `${ipBase}${randomInt(1, 223)}.${randomInt(1, 254)}`;

  const id = `TXN-${randomHex(6).toUpperCase()}`;
  const status: TransactionStatus = "PENDING";
  const preliminaryScore = Math.min(
    100,
    flagReasons.length * 22 + velocityCount * 3 + (isVPN ? 15 : 0)
  );

  return {
    id,
    timestamp: new Date(),
    amount: Math.round(amount * 100) / 100,
    currency: "USD",
    merchantName: merchant.name,
    merchantCategory: merchant.category,
    merchantCountry,
    merchantCity: mc.city,
    cardLast4: String(randomInt(1000, 9999)),
    userId: user.userId,
    userName: user.userName,
    userEmail: user.userEmail,
    userLocation,
    ipAddress,
    deviceFingerprint: `fp_${randomHex(12)}`,
    isNewDevice,
    isVPN,
    velocityCount,
    riskScore: preliminaryScore,
    riskLevel: riskLevelFromScore(preliminaryScore),
    status,
    flagReasons,
    aiExplanation: "",
    isAnalyzed: false,
    lat: mc.lat,
    lng: mc.lng,
  };
}

export function deriveRiskLevel(score: number): RiskLevel {
  return riskLevelFromScore(score);
}

/** Scenario: card skimming — rapid small txns same card */
export function generateCardSkimmingBurst(
  ctx: Partial<GeneratorContext>
): Transaction[] {
  const user = pick(userProfiles);
  const card = "4892";
  const out: Transaction[] = [];
  const merchantsSubset = merchants.filter((m) => m.category === "POINT_OF_SALE");
  for (let i = 0; i < 8; i++) {
    const m = pick(merchantsSubset.length ? merchantsSubset : merchants);
    const country = pick(m.countries);
    const mc = countryCoords(country);
    out.push({
      id: `TXN-${randomHex(6).toUpperCase()}`,
      timestamp: new Date(Date.now() - i * 11000),
      amount: Math.round(randomBetween(4, 11.5) * 100) / 100,
      currency: "USD",
      merchantName: m.name,
      merchantCategory: m.category,
      merchantCountry: country,
      merchantCity: mc.city,
      cardLast4: card,
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      userLocation: `${user.homeCity}, ${user.homeCountry}`,
      ipAddress: `203.0.113.${randomInt(10, 99)}`,
      deviceFingerprint: `fp_skim_${randomHex(8)}`,
      isNewDevice: false,
      isVPN: false,
      velocityCount: 8 - i,
      riskScore: 88,
      riskLevel: "CRITICAL",
      status: "PENDING",
      flagReasons: ["VELOCITY_EXCEEDED", "CARD_TESTING_PATTERN"],
      aiExplanation: "",
      isAnalyzed: false,
      lat: mc.lat,
      lng: mc.lng,
    });
  }
  return out;
}

export function generateAccountTakeoverSequence(
  ctx: Partial<GeneratorContext>
): Transaction[] {
  const user = userProfiles.find((u) => u.userId === "USR-001") ?? userProfiles[0]!;
  const txs: Transaction[] = [];
  const m1 = merchants.find((x) => x.name.includes("Starbucks")) ?? merchants[0]!;
  const c1 = pick(m1.countries);
  const mc1 = countryCoords(c1);
  txs.push({
    id: `TXN-${randomHex(6).toUpperCase()}`,
    timestamp: new Date(Date.now() - 5000),
    amount: 25,
    currency: "USD",
    merchantName: m1.name,
    merchantCategory: m1.category,
    merchantCountry: c1,
    merchantCity: mc1.city,
    cardLast4: "1022",
    userId: user.userId,
    userName: user.userName,
    userEmail: user.userEmail,
    userLocation: `${user.homeCity}, ${user.homeCountry}`,
    ipAddress: "10.0.0.12",
    deviceFingerprint: `fp_${randomHex(10)}`,
    isNewDevice: false,
    isVPN: false,
    velocityCount: 1,
    riskScore: 12,
    riskLevel: "SAFE",
    status: "PENDING",
    flagReasons: [],
    aiExplanation: "",
    isAnalyzed: false,
    lat: mc1.lat,
    lng: mc1.lng,
  });

  const wu = merchants.find((x) => x.name === "Western Union")!;
  const mcN = countryCoords("NG");
  txs.push({
    id: `TXN-${randomHex(6).toUpperCase()}`,
    timestamp: new Date(Date.now() - 3000),
    amount: 4500,
    currency: "USD",
    merchantName: wu.name,
    merchantCategory: wu.category,
    merchantCountry: "NG",
    merchantCity: mcN.city,
    cardLast4: "1022",
    userId: user.userId,
    userName: user.userName,
    userEmail: user.userEmail,
    userLocation: `${user.homeCity}, ${user.homeCountry}`,
    ipAddress: "45.33.32.11",
    deviceFingerprint: `fp_${randomHex(10)}`,
    isNewDevice: true,
    isVPN: false,
    velocityCount: 2,
    riskScore: 85,
    riskLevel: "CRITICAL",
    status: "PENDING",
    flagReasons: ["GEO_ANOMALY", "AMOUNT_3X_AVERAGE"],
    aiExplanation: "",
    isAnalyzed: false,
    lat: mcN.lat,
    lng: mcN.lng,
  });

  const bin = merchants.find((x) => x.name.includes("Binance"))!;
  const mcS = countryCoords("SG");
  txs.push({
    id: `TXN-${randomHex(6).toUpperCase()}`,
    timestamp: new Date(),
    amount: 8200,
    currency: "USD",
    merchantName: bin.name,
    merchantCategory: bin.category,
    merchantCountry: "SG",
    merchantCity: mcS.city,
    cardLast4: "1022",
    userId: user.userId,
    userName: user.userName,
    userEmail: user.userEmail,
    userLocation: `${user.homeCity}, ${user.homeCountry}`,
    ipAddress: "185.220.101.4",
    deviceFingerprint: `fp_new_${randomHex(10)}`,
    isNewDevice: true,
    isVPN: true,
    velocityCount: 3,
    riskScore: 95,
    riskLevel: "CRITICAL",
    status: "PENDING",
    flagReasons: ["NEW_DEVICE", "VPN_DETECTED", "AMOUNT_3X_AVERAGE"],
    aiExplanation: "",
    isAnalyzed: false,
    lat: mcS.lat,
    lng: mcS.lng,
  });
  return txs;
}

export function generateFraudRingScenario(
  ctx: Partial<GeneratorContext>
): Transaction[] {
  const target = merchants.find((x) => x.name.includes("International POS RO"))!;
  const out: Transaction[] = [];
  for (let i = 0; i < 5; i++) {
    const u = userProfiles[i]!;
    const country = pick(target.countries);
    const mc = countryCoords(country);
    out.push({
      id: `TXN-${randomHex(6).toUpperCase()}`,
      timestamp: new Date(Date.now() - i * 800),
      amount: Math.round(randomBetween(500, 2000) * 100) / 100,
      currency: "USD",
      merchantName: target.name,
      merchantCategory: target.category,
      merchantCountry: country,
      merchantCity: mc.city,
      cardLast4: String(4000 + i),
      userId: u.userId,
      userName: u.userName,
      userEmail: u.userEmail,
      userLocation: `${u.homeCity}, ${u.homeCountry}`,
      ipAddress: `198.51.100.${10 + i}`,
      deviceFingerprint: `fp_ring_${i}`,
      isNewDevice: false,
      isVPN: false,
      velocityCount: 1,
      riskScore: 78,
      riskLevel: "HIGH",
      status: "PENDING",
      flagReasons: ["PATTERN_MATCH"],
      aiExplanation: "",
      isAnalyzed: false,
      lat: mc.lat,
      lng: mc.lng,
    });
  }
  return out;
}

export function generateFalsePositiveTravelScenario(): Transaction[] {
  const user =
    userProfiles.find((u) => u.homeCountry === "US") ?? userProfiles[0]!;
  const sequence: { country: string; amount: number }[] = [
    { country: "US", amount: 120 },
    { country: "UK", amount: 85 },
    { country: "JP", amount: 200 },
  ];
  return sequence.map((s, i) => {
    const m = pick(merchants.filter((x) => x.countries.includes(s.country)));
    const mc = countryCoords(s.country);
    return {
      id: `TXN-${randomHex(6).toUpperCase()}`,
      timestamp: new Date(Date.now() - (3 - i) * 60000),
      amount: s.amount,
      currency: "USD",
      merchantName: m.name,
      merchantCategory: m.category,
      merchantCountry: s.country,
      merchantCity: mc.city,
      cardLast4: "7781",
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      userLocation: `${user.homeCity}, ${user.homeCountry}`,
      ipAddress: `10.1.${i}.44`,
      deviceFingerprint: `fp_travel_${user.userId}`,
      isNewDevice: i > 0,
      isVPN: false,
      velocityCount: i + 1,
      riskScore: i === 0 ? 25 : 55,
      riskLevel: i === 0 ? "LOW" : "MEDIUM",
      status: "PENDING" as TransactionStatus,
      flagReasons: i > 0 ? ["GEO_ANOMALY"] : [],
      aiExplanation: "",
      isAnalyzed: false,
      lat: mc.lat,
      lng: mc.lng,
    };
  });
}
