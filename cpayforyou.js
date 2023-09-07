var subscriptionContract;
var tokenContract;
var provider;
var signer;
var totalPlans = [];
var totalSubscriptions = [];
var isConnectedWallet = false;
var account;
var merchantAdd;

const contractAddress = "0x8349AEcFB2561e76e2C1d51b7005a312c927bDFe";
const TIMEUNITS = 24 * 60 * 60;

const subscriptionABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      }
    ],
    "name": "PaymentSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      }
    ],
    "name": "PlanCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "subscriber",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      }
    ],
    "name": "SubscriptionCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "subscriber",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      }
    ],
    "name": "SubscriptionCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "TokensWithdraw",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      }
    ],
    "name": "blackListPlan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "commission",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "frequency",
        "type": "uint256"
      }
    ],
    "name": "createPlan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "frequency",
        "type": "uint256"
      }
    ],
    "name": "createPlanSuperAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "noOfEpochs",
        "type": "uint256"
      }
    ],
    "name": "getDiscountedPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "discountedPrice",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getLockedBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_merchant",
        "type": "address"
      }
    ],
    "name": "getPlansByMerchant",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "merchant",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "frequency",
            "type": "uint256"
          }
        ],
        "internalType": "struct SubscriptionPayment.Plan[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "subscriber",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      }
    ],
    "name": "getSubscription",
    "outputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "subscriber",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "start",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "nextPayment",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "nextPayAmount",
                "type": "uint256"
              }
            ],
            "internalType": "struct SubscriptionPayment.Subscription",
            "name": "subscription",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "merchant",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "frequency",
                "type": "uint256"
              }
            ],
            "internalType": "struct SubscriptionPayment.Plan",
            "name": "plan",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct SubscriptionPayment.SubscriptionResponse",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_merchant",
        "type": "address"
      }
    ],
    "name": "getSubscriptionsForMerchant",
    "outputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "subscriber",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "start",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "nextPayment",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "nextPayAmount",
                "type": "uint256"
              }
            ],
            "internalType": "struct SubscriptionPayment.Subscription",
            "name": "subscription",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "merchant",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "frequency",
                "type": "uint256"
              }
            ],
            "internalType": "struct SubscriptionPayment.Plan",
            "name": "plan",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct SubscriptionPayment.SubscriptionResponse[][]",
        "name": "",
        "type": "tuple[][]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "merchantPlans",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "merchantToSubscribers",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextPlanId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "subscriber",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      }
    ],
    "name": "pay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "plans",
    "outputs": [
      {
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "frequency",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_commission",
        "type": "uint256"
      }
    ],
    "name": "setCommission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      }
    ],
    "name": "subscribe",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "noOfEpochs",
        "type": "uint256"
      }
    ],
    "name": "subscribeInAdvance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "subscriptions",
    "outputs": [
      {
        "internalType": "address",
        "name": "subscriber",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "start",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nextPayment",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nextPayAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      }
    ],
    "name": "unsubscribe",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
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

function init() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();

  subscriptionContract = new ethers.Contract(contractAddress, subscriptionABI, signer);

  tokenContract = new ethers.Contract("0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814", tokenABI, signer);
}

function getSelectedToken() {
  var e = document.getElementById("create-plan-tokens");
  var value = e.value;
  var text = e.options[e.selectedIndex].text;
  if (text == "BUSD") return "0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814";
  return "0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814";
}

async function isMetaMaskConnected() {
  const { ethereum } = window;
  const accounts = await ethereum.request({ method: "eth_accounts" });
  return accounts && accounts.length > 0;
}

async function getPlans() {
  let tablePlanHTML = "";
  let tableSubscriptionPlanHTML = "";
  const plans = await subscriptionContract.getPlansByMerchant(merchantAdd);

  for (let i = 0; i < plans.length; i++) {
    totalPlans.push(plans[i]);
    tablePlanHTML +=
      "<tr id=" +
      i +
      "><td id='table-planid' class='ID'>" +
      i +
      "</td><td id='table-merchant' class='ID'>" +
      plans[i].merchant.slice(0, 5) +
      "..." +
      plans[i].merchant.slice(-3) +
      "</td><td id='table-token' class='ID'>BUSD</td>" +
      "<td id='table-amount' class='ID'>" +
      ethers.utils.formatEther(plans[i].amount) +
      "</td><td id='table-frequency' class='ID'>" +
      parseInt(plans[i].frequency / TIMEUNITS) +
      "</td></tr>";

    tableSubscriptionPlanHTML += "<option value=" + i + ">" + i + "</option>";
  }
  document.getElementById("table-plans").innerHTML += tablePlanHTML;
  document.getElementById("create-subscription-planid").innerHTML += tableSubscriptionPlanHTML;
  // console.log(totalPlans);
}

async function getSelfSubscriptions() {
  let tableSubscriptionsHTML = "";
  let id = 0;
  const nextPlanID = await subscriptionContract.nextPlanId();

  // get subscriptions when you are subscriber
  for (let i = 0; i < nextPlanID; i++) {
    const subscription = await subscriptionContract.subscriptions(account, i);
    if (subscription.nextPayment <= 0) continue;
    const plan = await subscriptionContract.plans(i);
    totalSubscriptions.push({ planId: i, ...subscription });
    const disbleBtn = new Date().getTime() > subscription.nextPayment * 1000 ? "" : "disabled";
    tableSubscriptionsHTML +=
      "<tr id=" +
      id +
      "><td id='table-subscription-id' class='ID'>" +
      id +
      "</td><td id='table-subscriber' class='ID'>" +
      subscription.subscriber.slice(0, 5) +
      "..." +
      subscription.subscriber.slice(-3) +
      "</td><td id='table-subscription-planid' class='ID'>" +
      i +
      "</td><td id='table-merchant' class='ID'>" +
      plan.merchant.slice(0, 5) +
      "..." +
      plan.merchant.slice(-3) +
      "</td><td id='table-token' class='ID'>" +
      new Date(subscription.start * 1000).toLocaleDateString("en-US") +
      "</td><td id='table-amount' class='ID'>" +
      new Date(subscription.nextPayment * 1000).toLocaleDateString("en-US") +
      "</td><td id='table-frequency' class='ID'>" +
      ethers.utils.formatEther(subscription.nextPayAmount) +
      "</td><td id='table-control' class='d-flex justify-content-around align-items-center gap-2'>" +
      "<button id='subscription-pay-btn' name=" +
      i +
      " class='btn btn-sm btn-light btn-outline-success'" +
      disbleBtn +
      ">Pay</button><button id='subscription-unsubscribe-btn'name=" +
      i +
      " class='btn btn-sm btn-light btn-outline-danger'>" +
      "Unsubscribe" +
      "</button></td></tr>";
    id++;
  }
  document.getElementById("table-subscriptions").innerHTML += tableSubscriptionsHTML;
  console.log(totalSubscriptions);
}

async function getTotalSubscriptions() {
  let tableSubscriptionsHTML = "";
  let id = 0;
  const totalSubscriptions = await subscriptionContract.getSubscriptionsForMerchant(merchantAdd);
  
  for (let l = 0; l < totalSubscriptions.length; l++) {
    const subscriptions = totalSubscriptions[l];
    for (let i = 0; i < subscriptions.length; i++) {
      const badge = subscriptions[i].isActive ? "<span class='badge text-bg-info'>Active</span>" : "<span class='badge text-bg-secondary'>Silent</span>";
      console.log(subscriptions[i]);
      tableSubscriptionsHTML +=
        "<tr id=" +
        id +
        "><td id='table-subscription-id' class='ID'>" +
        id +
        "</td><td id='table-subscriber' class='ID'>" +
        subscriptions[i].subscription.subscriber.slice(0, 5) +
        "..." +
        subscriptions[i].subscription.subscriber.slice(-3) +
        "</td><td id='table-subscription-planid' class='ID'>" +
        i +
        "</td><td id='table-merchant' class='ID'>" +
        subscriptions[i].plan.merchant.slice(0, 5) +
        "..." +
        subscriptions[i].plan.merchant.slice(-3) +
        "</td><td id='table-token' class='ID'>" +
        new Date(subscriptions[i].subscription.start * 1000).toLocaleDateString("en-US") +
        "</td><td id='table-amount' class='ID'>" +
        new Date(subscriptions[i].subscription.nextPayment * 1000).toLocaleDateString("en-US") +
        "</td><td id='table-frequency' class='ID'>" +
        ethers.utils.formatEther(subscriptions[i].subscription.nextPayAmount) +
        "</td><td id='table-control' class='d-flex justify-content-around align-items-center gap-2'>" +
        badge +
        "</td></tr>";
      id++;
    }  
  }
  document.getElementById("table-subscriptions").innerHTML += tableSubscriptionsHTML;
}

async function connectWallet(accounts) {
  account = accounts[0];
  isConnectedWallet = true;
  merchantAdd = document.getElementById("merchant-address").value;
  document.getElementById("connect-btn").innerText = accounts[0].slice(0, 5) + "..." + accounts[0].slice(-3);
  let balance = await provider.getBalance(account);
  balance = ethers.utils.formatEther(balance);
  document.getElementById("balance").innerText = parseFloat(balance).toFixed(2) + " BNB";
  $.notify("Wallet connect successfuly!", {
    position: "Top Right",
    className: "info",
  });

  // when you are owner...
  if (account.toLowerCase() == (await subscriptionContract.owner()).toLowerCase()) {
    document.getElementById("create-plan-panel").innerHTML += `<div class="create-plan-panel row mb-3">
    <div class="col input-group input-group-sm flex-nowrap">
      <select id="create-plan-tokens" class="form-control w-100" name="tokens">
        <option value="BUSD">BUSD</option>
      </select>
    </div>
    <div class="col input-group input-group-sm flex-nowrap"><input id="create-plan-amount" class="form-control w-100" name="amount" type="text" placeholder="0.00" /> <span class="input-group-text">BUSD</span></div>
    <div class="col input-group input-group-sm flex-nowrap"><input id="create-plan-frequency" class="form-control w-100" min="0" name="frequency" type="number" placeholder="0" /> <span class="input-group-text">Day</span></div>
    <div class="col input-group input-group-sm flex-nowrap"><button id="create-plan-btn" class="btn btn-light btn-outline-primary w-100">Create Plan</button></div>
    </div>`;
    document.getElementById("admin-panel").innerHTML += `<div id="admin-panel">
      <h4>Admin functionality</h4>
      <div class="row my-3">
        <div class="col input-group input-group-sm flex-nowrap">
          <select id="super-plan-tokens" class="form-control w-100" name="tokens">
            <option value="BUSD">BUSD</option>
          </select>
        </div>
        <div class="col input-group input-group-sm flex-nowrap">
          <input id="super-plan-merchant" class="form-control w-100" name="merchant" type="text" placeholder="0x92823..." />
          <span class="input-group-text">Merchant</span>
        </div>
        <div class="col input-group input-group-sm flex-nowrap">
          <input id="super-plan-amount" class="form-control w-100" name="amount" type="text" placeholder="0.00" />
          <span class="input-group-text">BUSD</span>
        </div>
        <div class="col input-group input-group-sm flex-nowrap">
          <input id="super-plan-frequency" class="form-control w-100" name="frequency" type="text" placeholder="0" />
          <span class="input-group-text">Day</span>
        </div>
        <div class="col input-group input-group-sm flex-nowrap">
          <button id='create-plan-advance-btn' class='btn btn-light btn-outline-primary w-100'>Create Advanced Plan</button>
        </div>
      </div>

      <div class="row">
        <div class="col d-flex justify-content-between input-group-sm align-items-center gap-3">
          <div class="col input-group input-group-sm flex-nowrap">
            <input id="super-admin-transfer" class="form-control w-100" name="transfer" type="text" placeholder="New owner address: 0x3928..." />
            <span class="input-group-text">New owner</span>
          </div>
          <button id="transferowner-btn" class="btn btn-light btn-outline-primary">
            Transfer Ownership
          </button>
        </div>
        <div class="col d-flex justify-content-between input-group-sm align-items-center gap-3">
          <div class="col input-group input-group-sm flex-nowrap">
            <input id="super-admin-blacklist" class="form-control w-100" name="blacklist" min="0" type="number" placeholder="Blacklist Plan: 0" />
            <span class="input-group-text">Blacklist</span>
          </div>
          <button id="blacklist-btn" class="btn btn-light btn-outline-primary">
            Blacklist Plan
          </button>
        </div>
        <div class="col d-flex justify-content-between input-group-sm align-items-center gap-3">
          <div class="col input-group input-group-sm flex-nowrap">
            <input id="super-admin-commission" class="form-control w-100" name="commission" min="0" type="number" placeholder="Commission: 0" />
            <span class="input-group-text">%</span>
          </div>
          <button id="commission-btn" class="btn btn-light btn-outline-primary">
            Set Commission
          </button>
        </div>
      </div>

      <div class="super-admin-panel row my-3">
        <div class="col input-group input-group-sm flex-nowrap">
          <select id="super-admin-tokens" class="form-control w-100" name="tokens">
            <option value="BUSD">BUSD</option>
          </select>
        </div>
        <div class="col input-group input-group-sm flex-nowrap">
          <input id="super-admin-to" class="form-control w-100" name="to" type="text" placeholder="0x92823..." />
          <span class="input-group-text">To</span>
        </div>
        <div class="col input-group input-group-sm flex-nowrap">
          <input id="super-admin-amount" class="form-control w-100" name="amount" type="text" placeholder="Amount" />
          <span class="input-group-text">BUSD</span>
        </div>
        <div class="col input-group input-group-sm flex-nowrap">
          <button id="withdrawtoken-btn" class="btn btn-light btn-outline-primary w-100">
            Withdraw Tokens
          </button>
        </div>
      </div>
      
      <button id="renounce-owner-btn" class="btn btn-light btn-outline-primary btn-sm mb-5">
        renounceOwnership
      </button>
    </div>`;

    document.getElementById("create-subscription-list").style.display = "none";
    document.getElementById("create-subscription-panel").style.display = "none";
    getTotalSubscriptions();
  } else if (account.toLowerCase() == merchantAdd.toLowerCase()) {
    document.getElementById("create-plan-panel").innerHTML += `<div class="create-plan-panel row mb-3">
      <div class="col input-group input-group-sm flex-nowrap">
        <select id="create-plan-tokens" class="form-control w-100" name="tokens">
          <option value="BUSD">BUSD</option>
        </select>
      </div>
      <div class="col input-group input-group-sm flex-nowrap"><input id="create-plan-amount" class="form-control w-100" name="amount" type="text" placeholder="0.00" /> <span class="input-group-text">BUSD</span></div>
      <div class="col input-group input-group-sm flex-nowrap"><input id="create-plan-frequency" class="form-control w-100" min="0" name="frequency" type="number" placeholder="0" /> <span class="input-group-text">Day</span></div>
      <div class="col input-group input-group-sm flex-nowrap"><button id="create-plan-btn" class="btn btn-light btn-outline-primary w-100">Create Plan</button></div>
    </div>`;

    document.getElementById("create-subscription-list").style.display = "block";
    document.getElementById("create-subscription-panel").style.display = "none";
    getTotalSubscriptions();
  } else {
    // document.getElementById("get-plans-panel").innerHTML += `<div class="col input-group input-group-sm flex-nowrap">
    //   <input id="subscription-merchant" class="form-control w-100" min="0" name="subscription-merchant" type="text" placeholder="0x9282..." /> <span class="input-group-text">Merchant</span></div>
    //   <div class="col-4 input-group-sm flex-nowrap">
    //     <button id="get-plans-merchant" class="btn btn-light btn-outline-primary w-100"> Get Plans</button>
    //   </div>`;
    document.getElementById("create-subscription-list").style.display = "block";
    await getSelfSubscriptions();
  }

  await getPlans();
}

function disconnectWallet() {
  isConnectedWallet = false;
  account = "";
  provider = null;
  signer = null;
  subscriptionContract = null;
  tokenContract = null;
  totalPlans = [];
  totalSubscriptions = [];
  document.getElementById("create-plan-panel").innerHTML = "";
  document.getElementById("admin-panel").innerHTML = "";
  document.getElementById("connect-btn").innerText = "Connect wallet";
  document.getElementById("balance").innerText = "0.00 BNB";
  document.getElementById("table-plans").innerHTML = "";
  document.getElementById("create-subscription-planid").innerHTML = "";
  document.getElementById("table-subscriptions").innerHTML = "";
  document.getElementById("get-plans-panel").innerHTML = "";
}

window.onload = async function () {
  if (!window.ethereum) {
    alert("Install metamask wallet!");
    return;
  }
  init();
  if (await isMetaMaskConnected()) {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    // console.log(accounts, await isMetaMaskConnected())
    connectWallet(accounts);
  }
};

window.onclick = async function (event) {
  // wallet connect and disconnect ✔
  if (event.target.matches("#connect-btn")) {
    // when metamask is connected
    if (isConnectedWallet == true) {
      disconnectWallet();
    } else {
      // when metamask is disconnected
      init();
      await provider.send("eth_requestAccounts", []);
      const accounts = await provider.listAccounts();
      account = accounts[0];
      connectWallet(accounts);
    }
  }

  // approveToken button ✔
  if (event.target.matches("#approve-btn")) {
    const tx = await tokenContract.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935");
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });
  }

  // createPlan button ✔
  if (event.target.matches("#create-plan-btn")) {
    const selectedToken = getSelectedToken();
    let amount = document.getElementById("create-plan-amount").value;
    let frequency = document.getElementById("create-plan-frequency").value;

    amount = ethers.utils.parseUnits(amount.toString(), "ether");
    frequency = ethers.utils.parseUnits(parseInt(frequency * TIMEUNITS).toString(), "wei");

    const tx = await subscriptionContract.createPlan(selectedToken, amount, frequency);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });

    const plans = await subscriptionContract.getPlansByMerchant(account);
    const id = plans.length - 1;
    totalPlans.push(plans[id]);

    const tablePlanHTML =
      "<tr id=" +
      id +
      "><td id='table-planid' class='ID'>" +
      id +
      "</td><td id='table-merchant' class='ID'>" +
      plans[id].merchant.slice(0, 5) +
      "..." +
      plans[id].merchant.slice(-3) +
      "</td><td id='table-token' class='ID'>BUSD</td>" +
      "<td id='table-amount' class='ID'>" +
      ethers.utils.formatEther(plans[id].amount) +
      "</td><td id='table-frequency' class='ID'>" +
      parseInt(plans[id].frequency / TIMEUNITS) +
      "</td></tr>";

    // const tableSubscriptionPlanHTML = "<option value=" + id + ">" + id + "</option>";
    document.getElementById("table-plans").innerHTML += tablePlanHTML;
    // document.getElementById("create-subscription-planid").innerHTML += tableSubscriptionPlanHTML;
  }

  // getPlansByMerchant button ✔
  if (event.target.matches("#get-plans-merchant")) {
    let merchant = document.getElementById("subscription-merchant").value;

    const plans = await subscriptionContract.getPlansByMerchant(merchant);

    let tablePlanHTML = "";
    let tableSubscriptionPlanHTML = "";
    document.getElementById("table-plans").innerHTML = "";
    document.getElementById("create-subscription-planid").innerHTML = "";
    for (let i = 0; i < plans.length; i++) {
      totalPlans.push(plans[i]);
      tablePlanHTML +=
        "<tr id=" +
        i +
        "><td id='table-planid' class='ID'>" +
        i +
        "</td><td id='table-merchant' class='ID'>" +
        plans[i].merchant.slice(0, 5) +
        "..." +
        plans[i].merchant.slice(-3) +
        "</td><td id='table-token' class='ID'>BUSD</td>" +
        "<td id='table-amount' class='ID'>" +
        ethers.utils.formatEther(plans[i].amount) +
        "</td><td id='table-frequency' class='ID'>" +
        parseInt(plans[i].frequency / TIMEUNITS) +
        "</td></tr>";

      const planid = await subscriptionContract.merchantPlans(merchant, i);
      tableSubscriptionPlanHTML += "<option value=" + planid + ">" + planid + "</option>";
    }
    document.getElementById("table-plans").innerHTML += tablePlanHTML;
    document.getElementById("create-subscription-planid").innerHTML += tableSubscriptionPlanHTML;
  }

  // subscribe button ✔
  if (event.target.matches("#create-subscription-btn")) {
    let merchantPlanid = document.getElementById("create-subscription-planid").value;
    const planid = await subscriptionContract.merchantPlans(merchantAdd, merchantPlanid);
    const tx = await subscriptionContract.subscribe(planid);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });

    const plan = await subscriptionContract.plans(planid);
    const subscription = await subscriptionContract.subscriptions(account, planid);
    const subscriptionId = totalSubscriptions.length;
    totalSubscriptions.push({ planId: planid, ...subscription });
    const disbleBtn = new Date().getTime() > subscription.nextPayment * 1000 ? "" : "disabled";

    const tableSubscriptionsHTML =
      "<tr id=" +
      subscriptionId +
      "><td id='table-subscription-id' class='ID'>" +
      subscriptionId +
      "</td><td id='table-merchant' class='ID'>" +
      subscription.subscriber.slice(0, 5) +
      "..." +
      subscription.subscriber.slice(-3) +
      "</td><td id='table-subscription-planid' class='ID'>" +
      planid +
      "</td><td id='table-merchant' class='ID'>" +
      plan.merchant.slice(0, 5) +
      "..." +
      plan.merchant.slice(-3) +
      "</td><td id='table-token' class='ID'>" +
      new Date(subscription.start * 1000).toLocaleDateString("en-US") +
      "</td><td id='table-amount' class='ID'>" +
      new Date(subscription.nextPayment * 1000).toLocaleDateString("en-US") +
      "</td><td id='table-frequency' class='ID'>" +
      ethers.utils.formatEther(subscription.nextPayAmount) +
      "</td><td id='table-control' class='d-flex justify-content-around align-items-center gap-2'>" +
      "<button id='subscription-pay-btn' name=" +
      planid +
      " class='btn btn-sm btn-light btn-outline-success'" +
      disbleBtn +
      ">Pay</button><button id='subscription-unsubscribe-btn'name=" +
      planid +
      " class='btn btn-sm btn-light btn-outline-danger'>" +
      "Unsubscribe" +
      "</button></td></tr>";
    document.getElementById("table-subscriptions").innerHTML += tableSubscriptionsHTML;
  }

  // subscribeInAdvance button ✔
  if (event.target.matches("#create-subscription-advance-btn")) {
    let merchantPlanid = document.getElementById("create-subscription-planid").value;
    const planid = await subscriptionContract.merchantPlans(merchantAdd, merchantPlanid);
    let epoch = document.getElementById("create-subscription-epoch").value;

    const tx = await subscriptionContract.subscribeInAdvance(planid, epoch);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });

    const plan = await subscriptionContract.plans(planid);
    const subscription = await subscriptionContract.subscriptions(account, planid);
    const subscriptionId = totalSubscriptions.length;
    totalSubscriptions.push({ planId: planid, ...subscription });
    const disbleBtn = new Date().getTime() > subscription.nextPayment * 1000 ? "" : "disabled";

    const tableSubscriptionsHTML =
      "<tr id=" +
      subscriptionId +
      "><td id='table-subscription-id' class='ID'>" +
      subscriptionId +
      "</td><td id='table-merchant' class='ID'>" +
      subscription.subscriber.slice(0, 5) +
      "..." +
      subscription.subscriber.slice(-3) +
      "</td><td id='table-subscription-planid' class='ID'>" +
      planid +
      "</td><td id='table-merchant' class='ID'>" +
      plan.merchant.slice(0, 5) +
      "..." +
      plan.merchant.slice(-3) +
      "</td><td id='table-token' class='ID'>" +
      new Date(subscription.start * 1000).toLocaleDateString("en-US") +
      "</td><td id='table-amount' class='ID'>" +
      new Date(subscription.nextPayment * 1000).toLocaleDateString("en-US") +
      "</td><td id='table-frequency' class='ID'>" +
      ethers.utils.formatEther(subscription.nextPayAmount) +
      "</td><td id='table-control' class='d-flex justify-content-around align-items-center gap-2'>" +
      "<button id='subscription-pay-btn' name=" +
      planid +
      " class='btn btn-sm btn-light btn-outline-success'" +
      disbleBtn +
      ">Pay</button><button id='subscription-unsubscribe-btn'name=" +
      planid +
      " class='btn btn-sm btn-light btn-outline-danger'>" +
      "Unsubscribe" +
      "</button></td></tr>";
    document.getElementById("table-subscriptions").innerHTML += tableSubscriptionsHTML;
  }

  // pay button ✔
  if (event.target.matches("#subscription-pay-btn")) {
    const planId = event.target.getAttribute("name");
    const subscription = await subscriptionContract.subscriptions(account, planId);
    console.log(planId, subscription);
    const tx = await subscriptionContract.pay(subscription.subscriber, planId);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });
  }

  // unsubscribe button: ✔
  if (event.target.matches("#subscription-unsubscribe-btn")) {
    const planId = event.target.getAttribute("name");
    const tx = await subscriptionContract.unsubscribe(planId);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });
  }

  // createPlanSuperAdmin button: ✔
  if (event.target.matches("#create-plan-advance-btn")) {
    const selectedToken = getSelectedToken();
    const merchant = document.getElementById("super-plan-merchant").value;
    let amount = document.getElementById("super-plan-amount").value;
    let frequency = document.getElementById("super-plan-frequency").value;

    amount = ethers.utils.parseUnits(amount.toString(), "ether");
    frequency = ethers.utils.parseUnits(parseInt(frequency * TIMEUNITS).toString(), "wei");

    const tx = await subscriptionContract.createPlanSuperAdmin(merchant, selectedToken, amount, frequency);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });

    const plans = await subscriptionContract.getPlansByMerchant(account);
    const id = plans.length - 1;
    totalPlans.push(plans[id]);

    const tablePlanHTML =
      "<tr id=" +
      id +
      "><td id='table-planid' class='ID'>" +
      id +
      "</td><td id='table-merchant' class='ID'>" +
      plans[id].merchant.slice(0, 5) +
      "..." +
      plans[id].merchant.slice(-3) +
      "</td><td id='table-token' class='ID'>BUSD</td>" +
      "<td id='table-amount' class='ID'>" +
      ethers.utils.formatEther(plans[id].amount) +
      "</td><td id='table-frequency' class='ID'>" +
      parseInt(plans[id].frequency / TIMEUNITS) +
      "</td></tr>";

    // const tableSubscriptionPlanHTML = "<option value=" + id + ">" + id + "</option>";
    document.getElementById("table-plans").innerHTML += tablePlanHTML;
    // document.getElementById("create-subscription-planid").innerHTML += tableSubscriptionPlanHTML;
  }

  // renounceOwnership button ✔
  if (event.target.matches("#renounce-owner-btn")) {
    const tx = await subscriptionContract.renounceOwnership();
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });
  }

  // blackListPlan button ✔
  if (event.target.matches("#blacklist-btn")) {
    let planid = document.getElementById("super-admin-blacklist").value;

    const tx = await subscriptionContract.blackListPlan(planid);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });
  }

  // setCommission button ✔
  if (event.target.matches("#commission-btn")) {
    let commission = document.getElementById("super-admin-commission").value;

    const tx = await subscriptionContract.setCommission(commission);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });
  }

  // transferOwnership button ✔
  if (event.target.matches("#transferowner-btn")) {
    let newOwner = document.getElementById("super-admin-transfer").value;

    const tx = await subscriptionContract.transferOwnership(newOwner);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });
  }

  // withdrawTokens button  ✔
  if (event.target.matches("#withdrawtoken-btn")) {
    const selectedToken = getSelectedToken();
    let amount = document.getElementById("super-admin-amount").value;
    let withdrawAddress = document.getElementById("super-admin-to").value;
    amount = ethers.utils.parseUnits(amount.toString(), "ether");

    const tx = await subscriptionContract.withdrawTokens(selectedToken, withdrawAddress, amount);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });
  }
};
