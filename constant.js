const TIMEUNITS = 24 * 60 * 60;

const chain = {
  ETH: 1, // mainnet: 1, goerli: 5
  goerli: 5,
  BSC: 56, // bnb: 56, bnb test: 97
  TBSC: 97,
};

const contractAddress = {
  ETH: "",
  goerli: "0x160c89ba26b4D84b3E96D4C0b4b8B5b4C70027A6",
  BSC: "",
  TBSC: "0x8349AEcFB2561e76e2C1d51b7005a312c927bDFe",
};

const tokenAddress = {
  ETH: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // usdt address
  goerli: "0x7A203Ad2432Ea8a2A97BAc74BA2fa87d3963f13b", // usdt address
  BSC: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // busd address
  TBSC: "0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814", // busd address
};

const networkMap = {
  BSC_MAINNET: {
    chainId: '0x38', // '0x89'
    chainName: "Binance Smart Chain", 
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com/"],
  },
  BSC_TESTNET: {
    chainId: '0x61', // '0x13881'
    chainName: "Binance Smart Chain Testnet",
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
    rpcUrls: ["https://bsc-testnet.publicnode.com"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
  },
};
const paymentABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
    ],
    name: "PaymentSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
    ],
    name: "PlanCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "subscriber",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
    ],
    name: "SubscriptionCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "subscriber",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
    ],
    name: "SubscriptionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "TokensWithdraw",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
    ],
    name: "blackListPlan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "commission",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "frequency",
        type: "uint256",
      },
    ],
    name: "createPlan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "frequency",
        type: "uint256",
      },
    ],
    name: "createPlanSuperAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "noOfEpochs",
        type: "uint256",
      },
    ],
    name: "getDiscountedPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "discountedPrice",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getLockedBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_merchant",
        type: "address",
      },
    ],
    name: "getPlansByMerchant",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "merchant",
            type: "address",
          },
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "frequency",
            type: "uint256",
          },
        ],
        internalType: "struct SubscriptionPayment.Plan[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "subscriber",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
    ],
    name: "getSubscription",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "subscriber",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "start",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "nextPayment",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "nextPayAmount",
                type: "uint256",
              },
            ],
            internalType: "struct SubscriptionPayment.Subscription",
            name: "subscription",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "merchant",
                type: "address",
              },
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "frequency",
                type: "uint256",
              },
            ],
            internalType: "struct SubscriptionPayment.Plan",
            name: "plan",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
        ],
        internalType: "struct SubscriptionPayment.SubscriptionResponse",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_merchant",
        type: "address",
      },
    ],
    name: "getSubscriptionsForMerchant",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "subscriber",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "start",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "nextPayment",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "nextPayAmount",
                type: "uint256",
              },
            ],
            internalType: "struct SubscriptionPayment.Subscription",
            name: "subscription",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "merchant",
                type: "address",
              },
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "frequency",
                type: "uint256",
              },
            ],
            internalType: "struct SubscriptionPayment.Plan",
            name: "plan",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
        ],
        internalType: "struct SubscriptionPayment.SubscriptionResponse[][]",
        name: "",
        type: "tuple[][]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "merchantPlans",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "merchantToSubscribers",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextPlanId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "subscriber",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
    ],
    name: "pay",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "plans",
    outputs: [
      {
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "frequency",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_commission",
        type: "uint256",
      },
    ],
    name: "setCommission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
    ],
    name: "subscribe",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "noOfEpochs",
        type: "uint256",
      },
    ],
    name: "subscribeInAdvance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "subscriptions",
    outputs: [
      {
        internalType: "address",
        name: "subscriber",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nextPayment",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nextPayAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
    ],
    name: "unsubscribe",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const tokenABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function symbol() external view returns (string memory)",
  "function name() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];
