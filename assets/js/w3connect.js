"use strict";

const mimiTokenContract = "0x284748b6C0c1Ec75C73285f4557fE8F51F800480".toLowerCase();


const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const evmChains = window.evmChains;

let abi = ""

let web3Modal
let provider;
let selectedAccount;

async function init() {


    // Provider options for the web3 modal
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                infuraId: "3ceea3007f194113aaad505cde3620a4",
            }
        },
    };

    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    const abiResponse = await fetch('./assets/js/contracts/tokenAbi.json');
    abi = await abiResponse.json();


    // console.log("Web3Modal instance is", web3Modal);
}

async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    const web3 = new Web3(provider);

    // console.log("Web3 instance is", web3);

    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    // Load chain information over an HTTP API
    document.querySelector("#network-name").textContent = "Avalanche C-Chain";

    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    // console.log("Got accounts", accounts);
    selectedAccount = accounts[0];

    document.querySelector("#selected-account").textContent = selectedAccount;

    // Get a handl
    const template = document.querySelector("#template-balance");
    const accountContainer = document.querySelector("#accounts");

    // Get account balance
    const primaryAccount = accounts[0];

    var MimiContract = new web3.eth.Contract(abi, mimiTokenContract);

    const balance = await MimiContract.methods.balanceOf(primaryAccount).call({ from: web3.eth.accounts[0] })

    document.querySelector("#your-balance").textContent = balance;



    // Display fully loaded UI for wallet data
    document.querySelector("#prepare").style.display = "none";
    document.querySelector("#connected").style.display = "block";
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

    // If any current data is displayed when
    // the user is switching acounts in the wallet
    // immediate hide this data
    document.querySelector("#connected").style.display = "none";
    document.querySelector("#prepare").style.display = "block";

    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.
    document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    await fetchAccountData(provider);
    document.querySelector("#btn-connect").removeAttribute("disabled")
}

/**
 * Connect wallet button pressed.
 */
async function onConnect() {

    // console.log("Opening a dialog", web3Modal);
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        // console.log("Could not get a wallet connection", e);
        return;
    }

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

    // console.log("Killing the wallet connection", provider);

    // TODO: Which providers have close method?
    if (provider.close) {
        await provider.close();

        // If the cached provider is not cleared,
        // WalletConnect will default to the existing session
        // and does not allow to re-scan the QR code with a new wallet.
        // Depending on your use case you may want or want not his behavir.
        await web3Modal.clearCachedProvider();
        provider = null;
    }

    selectedAccount = null;

    // Set the UI back to the initial state
    document.querySelector("#prepare").style.display = "block";
    document.querySelector("#connected").style.display = "none";
}



async function claim(provider) {

    // console.log("Loading content... ")
    // Get a Web3 instance for the wallet
    await window.web3.currentProvider.enable();
    web3 = new Web3(window.web3.currentProvider);

    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();


    const abiResponse = await fetch('./assets/js/contracts/tokenAbi.json');
    const abi = await abiResponse.json();

    const primaryAccount = accounts[0];

    var MimiContract = new web3.eth.Contract(abi, mimiTokenContract);

    const transferMimi = await MimiContract.methods.transfer(primaryAccount, 1).send({ from: primaryAccount })

    console.log(transferMimi)
}

window.addEventListener('load', async () => {
    init();
    document.querySelector("#btn-connect").addEventListener("click", onConnect);
    document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
    document.querySelector("#btn-claim").addEventListener("click", claim);
});