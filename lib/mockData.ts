export type Office = {
  id: string;
  name: string;
  region: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  accountCount: number;
  agentCount: number;
};

export type Agent = {
  id: string;
  name: string;
  phone: string;
  region: string;
  email: string;
  office: string;
  account: string;
  status: string;
};

export type Account = {
  id: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  currency: string;
  type: string;
  office: string;
  status: string;
};

export type InventoryItem = {
  id: string;
  itemName: string;
  category: string;
  location: string;
  stock: number;
  status: string;
  lastUpdated: string;
  assignedOffice: string;
};

export const offices: Office[] = [
  {
    id: "office_001",
    name: "Jade Beach HQ",
    region: "MENA",
    email: "mena@flashpay.com",
    phone: "+971 4 123 4567",
    address: "Dubai Media City, Dubai, UAE",
    isActive: true,
    accountCount: 9,
    agentCount: 31,
  },
  {
    id: "office_002",
    name: "Cairo Hub",
    region: "North Africa",
    email: "cairo@flashpay.com",
    phone: "+20 2 2790 0000",
    address: "Garden City, Cairo, Egypt",
    isActive: true,
    accountCount: 6,
    agentCount: 19,
  },
  {
    id: "office_003",
    name: "Istanbul Office",
    region: "Eurasia",
    email: "istanbul@flashpay.com",
    phone: "+90 212 555 1234",
    address: "Levent, Istanbul, Turkey",
    isActive: false,
    accountCount: 3,
    agentCount: 8,
  },
];

export const agents: Agent[] = [
  {
    id: "agent_001",
    name: "Amira Khalid",
    phone: "+971 55 123 4567",
    region: "Gulf",
    email: "amira.k@flashpay.com",
    office: "Jade Beach HQ",
    account: "600-112-980",
    status: "Active",
  },
  {
    id: "agent_002",
    name: "Samir Hassan",
    phone: "+20 100 555 8420",
    region: "North Africa",
    email: "samir.h@flashpay.com",
    office: "Cairo Hub",
    account: "402-331-210",
    status: "Pending",
  },
  {
    id: "agent_003",
    name: "Derya Aksoy",
    phone: "+90 532 998 7412",
    region: "Eurasia",
    email: "derya.a@flashpay.com",
    office: "Istanbul Office",
    account: "556-780-331",
    status: "Restricted",
  },
];

export const accounts: Account[] = [
  {
    id: "account_001",
    bankName: "Flash Trust Bank",
    accountNumber: "600-112-980",
    iban: "AE070331234567890123456",
    currency: "USD",
    type: "Private",
    office: "Jade Beach HQ",
    status: "Active",
  },
  {
    id: "account_002",
    bankName: "SilverLine Bank",
    accountNumber: "402-331-210",
    iban: "EG320111000987654321000",
    currency: "EUR",
    type: "Shared",
    office: "Cairo Hub",
    status: "Review",
  },
  {
    id: "account_003",
    bankName: "Aegean Capital",
    accountNumber: "556-780-331",
    iban: "TR330006100519786457841326",
    currency: "TRY",
    type: "Private",
    office: "Istanbul Office",
    status: "Frozen",
  },
];

export const inventory: InventoryItem[] = [
  {
    id: "inv_001",
    itemName: "Secure Ledger Tablet",
    category: "Hardware",
    location: "Jade Beach HQ",
    stock: 12,
    status: "In stock",
    lastUpdated: "2026-04-05",
    assignedOffice: "Jade Beach HQ",
  },
  {
    id: "inv_002",
    itemName: "MFA Token Batch",
    category: "Security",
    location: "Cairo Hub",
    stock: 34,
    status: "Low stock",
    lastUpdated: "2026-04-07",
    assignedOffice: "Cairo Hub",
  },
  {
    id: "inv_003",
    itemName: "SIM Card Bundle",
    category: "Telecom",
    location: "Istanbul Office",
    stock: 18,
    status: "In stock",
    lastUpdated: "2026-04-06",
    assignedOffice: "Istanbul Office",
  },
  {
    id: "inv_004",
    itemName: "Portable POS Unit",
    category: "Hardware",
    location: "Jade Beach HQ",
    stock: 8,
    status: "In stock",
    lastUpdated: "2026-04-04",
    assignedOffice: "Jade Beach HQ",
  },
  {
    id: "inv_005",
    itemName: "Compliance Kit",
    category: "Documentation",
    location: "Cairo Hub",
    stock: 5,
    status: "Review",
    lastUpdated: "2026-04-03",
    assignedOffice: "Cairo Hub",
  },
  {
    id: "inv_006",
    itemName: "Encrypted USB Set",
    category: "Security",
    location: "Istanbul Office",
    stock: 22,
    status: "In stock",
    lastUpdated: "2026-04-01",
    assignedOffice: "Istanbul Office",
  },
];
