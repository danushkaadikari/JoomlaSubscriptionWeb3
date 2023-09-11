let web3Modal;
var subscriptionContract;
var tokenContract;
var provider;
var signer;
var totalPlans = [];
var totalSubscriptions = [];
var isConnectedWallet = false;
var account;
var merchantAdd;
var chainID;

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

function getSelectedToken() {
  var e = document.getElementById("network-select");
  var value = e.value;
  if (value == 1) return tokenAddress["ETH"];
  else if (value == 5) return tokenAddress["goerli"];
  else if (value == 56) return tokenAddress["BSC"];
  else if (value == 97) return tokenAddress["TBSC"];
}

async function isMetaMaskConnected() {
  const { ethereum } = window;
  const accounts = await ethereum.request({ method: "eth_accounts" });
  return accounts && accounts.length > 0;
}

async function getPlans() {
  let tablePlanHTML = "";
  let tableSubscriptionPlanHTML = "";
  const decimals = await tokenContract.decimals();
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
      ethers.utils.formatUnits(plans[i].amount, decimals) +
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
  const decimals = await tokenContract.decimals();
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
      ethers.utils.formatUnits(subscription.nextPayAmount, decimals) +
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
  const decimals = await tokenContract.decimals();
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
        ethers.utils.formatUnits(subscriptions[i].subscription.nextPayAmount, decimals) +
        "</td><td id='table-control' class='d-flex justify-content-around align-items-center gap-2'>" +
        badge +
        "</td></tr>";
      id++;
    }
  }
  document.getElementById("table-subscriptions").innerHTML += tableSubscriptionsHTML;
}

function selectToken(network) {
  if (network.chainId == chain["ETH"]) {
    document.getElementById("create-plan-tokens").innerHTML = "<option value='ETH'>ETH</option>";
  } else if (network.chainId == chain["goerli"]) {
    document.getElementById("create-plan-tokens").innerHTML = "<option value='ETH'>ETH</option>";
  } else if (network.chainId == chain["BSC"]) {
    document.getElementById("create-plan-tokens").innerHTML = "<option value='BSC'>BSC</option>";
  } else if (network.chainId == chain["TBSC"]) {
    document.getElementById("create-plan-tokens").innerHTML = "<option value='BSC'>BSC</option>";
  }
}

async function connectWallet() {
  try {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          // Mikko's test key - don't copy as your mileage may vary
          infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
        },
      },
    };

    web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      providerOptions, // required
    });

    provider = await web3Modal.connect();
    const library = new ethers.providers.Web3Provider(provider);
    signer = library.getSigner();

    const accounts = await library.listAccounts();
    const network = await library.getNetwork();
    chainID = network.chainId;
    account = accounts[0];

    isConnectedWallet = true;
    document.getElementById("connect-btn").innerText = accounts[0].slice(0, 6) + "..." + accounts[0].slice(-4);
    let balance = await library.getBalance(account);
    balance = ethers.utils.formatEther(balance);
    if (chainID == chain["ETH"] || chainID == chain["goerli"]) document.getElementById("balance").innerText = parseFloat(balance).toFixed(2) + " ETH";
    else if (chainID == chain["BSC"] || chainID == chain["TBSC"]) document.getElementById("balance").innerText = parseFloat(balance).toFixed(2) + " BNB";
    $.notify("Wallet connect successfuly!", {
      position: "Top Right",
      className: "info",
    });

    let contractAddr;
    let tokenAddr;

    if (network.chainId == chain["ETH"]) {
      contractAddr = contractAddress["ETH"];
      tokenAddr = tokenAddress["ETH"];
      document.getElementById("network-select").options[1].selected = "selected";
      document.getElementById("bsc-merchant-address").style.display = "none";
      merchantAdd = document.getElementById("eth-merchant-address").value;
    } else if (network.chainId == chain["goerli"]) {
      contractAddr = contractAddress["goerli"];
      tokenAddr = tokenAddress["goerli"];
      document.getElementById("network-select").options[2].selected = "selected";
      document.getElementById("bsc-merchant-address").style.display = "none";
      merchantAdd = document.getElementById("eth-merchant-address").value;
    } else if (network.chainId == chain["BSC"]) {
      contractAddr = contractAddress["BSC"];
      tokenAddr = tokenAddress["BSC"];
      document.getElementById("network-select").options[3].selected = "selected";
      document.getElementById("eth-merchant-address").style.display = "none";
      merchantAdd = document.getElementById("bsc-merchant-address").value;
    } else if (network.chainId == chain["TBSC"]) {
      contractAddr = contractAddress["TBSC"];
      tokenAddr = tokenAddress["TBSC"];
      document.getElementById("network-select").options[4].selected = "selected";
      document.getElementById("eth-merchant-address").style.display = "none";
      merchantAdd = document.getElementById("bsc-merchant-address").value;
    } else {
      document.getElementById("network-select").options[0].selected = "selected";
    }
    // console.log(contractAddr, tokenAddr);

    subscriptionContract = new ethers.Contract(contractAddr, paymentABI, signer);
    tokenContract = new ethers.Contract(tokenAddr, tokenABI, signer);
    // console.log(subscriptionContract, tokenContract);

    // when you are owner...
    const owner = await subscriptionContract.owner();
    if (account.toLowerCase() == owner.toLowerCase()) {
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
      selectToken(network);
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
      selectToken(network);
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
  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return;
  }
}

async function disconnectWallet() {
  await web3Modal.clearCachedProvider();
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
  // if (await isMetaMaskConnected()) {
  //   connectWallet();
  // }

  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });

  // window.ethereum.on("accountsChanged", () => {
  //   window.location.reload();
  // });
};

window.onclick = async function (event) {
  // wallet connect and disconnect ✔
  if (event.target.matches("#connect-btn")) {
    // when metamask is connected
    if (web3Modal?.cachedProvider) {
      await disconnectWallet();
    } else {
      await connectWallet();
    }
  }

  // approveToken button ✔
  if (event.target.matches("#approve-btn")) {
    let tx;
    if (chainID == chain["ETH"]) {
      tx = await tokenContract.approve(contractAddress["ETH"], "115792089237316195423570985008687907853269984665640564039457584007913129639935");
    } else if (chainID == chain["goerli"]) {
      tx = await tokenContract.approve(contractAddress["goerli"], "115792089237316195423570985008687907853269984665640564039457584007913129639935");
    } else if (chainID == chain["BSC"]) {
      tx = await tokenContract.approve(contractAddress["BSC"], "115792089237316195423570985008687907853269984665640564039457584007913129639935");
    } else if (chainID == chain["TBSC"]) {
      tx = await tokenContract.approve(contractAddress["TBSC"], "115792089237316195423570985008687907853269984665640564039457584007913129639935");
    }
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

    const decimals = await tokenContract.decimals();
    amount = ethers.utils.parseUnits(amount.toString(), decimals);
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
      ethers.utils.formatUnits(plans[id].amount, decimals) +
      "</td><td id='table-frequency' class='ID'>" +
      parseInt(plans[id].frequency / TIMEUNITS) +
      "</td></tr>";

    // const tableSubscriptionPlanHTML = "<option value=" + id + ">" + id + "</option>";
    document.getElementById("table-plans").innerHTML += tablePlanHTML;
    // document.getElementById("create-subscription-planid").innerHTML += tableSubscriptionPlanHTML;
  }

  // subscribe button ✔
  if (event.target.matches("#create-subscription-btn")) {
    let merchantPlanid = document.getElementById("create-subscription-planid").value;
    const planid = await subscriptionContract.merchantPlans(merchantAdd, merchantPlanid);
    const tx = await subscriptionContract.subscribe(planid, { gasLimit: 1500000 });
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });

    const decimals = await tokenContract.decimals();
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
      ethers.utils.formatUnits(subscription.nextPayAmount, decimals) +
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
      ethers.utils.formatUnits(subscription.nextPayAmount, decimals) +
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

    const decimals = await tokenContract.decimals();
    amount = ethers.utils.parseUnits(amount.toString(), decimals);
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
      ethers.utils.formatUnits(plans[id].amount, decimals) +
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
    const decimals = await tokenContract.decimals();
    amount = ethers.utils.parseUnits(amount.toString(), decimals);

    const tx = await subscriptionContract.withdrawTokens(selectedToken, withdrawAddress, amount);
    await tx.wait();
    $.notify("Transaction confirmed!", {
      position: "top right",
      className: "success",
    });
  }
};

window.onchange = async function (event) {
  if (event.target.matches("#network-select")) {
    const network = document.getElementById("network-select").value;

    try {
      if (network == chain["ETH"]) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }], // chainId must be in hexadecimal numbers
        });
      } else if (network == chain["goerli"]) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x5" }], // chainId must be in hexadecimal numbers
        });
      } else if (network == chain["BSC"]) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }], // chainId must be in hexadecimal numbers
        });
      } else if (network == chain["TBSC"]) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x61" }], // chainId must be in hexadecimal numbers
        });
      }
    } catch (e) {
      console.log(e);
      if (network == chain["BSC"]) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [networkMap.BSC_MAINNET], // chainId must be in hexadecimal numbers
        });
      } else if (network == chain["TBSC"]) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [networkMap.BSC_TESTNET], // chainId must be in hexadecimal numbers
        });
      }
    }
  }
};
