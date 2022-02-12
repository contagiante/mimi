var JSON_RPC_ENDPOINT = "https://api.avax.network/ext/bc/C/rpc";

var oracleURL = "https://opendefi.app/stor/stor_data/objects/mimiverse_oracle65_stats.txt"
const distributorAddress = "0xc3940a6a418b6858431185356cbb45d6a99655cd".toLowerCase();

const myAddr = "0x33B72E6dA2a30277e9c6AF2376a7B2e56a6F057a"



async function getData(provider) {

    const oracleResponse = await fetch(oracleURL);
    const oracle = await oracleResponse.json();

    console.log(oracle)

    const UNIVPRICE = oracle.bnb_price

    const marketCapUniv = (oracle.market_cap / UNIVPRICE).toFixed(12) + " AVAX"
    const marketCapUSD = (oracle.market_cap).toFixed(12) + " $"
    const totalDividendsUniv = oracle.total_dividends_dispensed.toFixed(12) + " UNIV"


    document.querySelector("#mimiverse-price-univ").textContent = oracle.token_price.toFixed(12) + " AVAX"
    document.querySelector("#mimiverse-price-usd").textContent = (oracle.token_price * UNIVPRICE).toFixed(12) + " $"
    document.querySelector("#mimiverse-market-cap-univ").textContent = marketCapUniv
    document.querySelector("#mimiverse-market-cap-usd").textContent = marketCapUSD
    document.querySelector("#mimiverse-dividends-univ").textContent = totalDividendsUniv
}




async function accountInfo() {


    document.querySelector("#address-result-loading").style.display = "block";

    let account = document.getElementById("addressSearchField").value;

    const oracleResponse = await fetch(oracleURL);
    oracle = await oracleResponse.json();

    console.log(oracle)

    const web3 = new Web3('https://api.avax.network/ext/bc/C/rpc');

    const abiResponse = await fetch('./assets/js/contracts/DividentDistributor.json');
    const abi = await abiResponse.json();
    var dividentDistributorContract = new web3.eth.Contract(abi, distributorAddress);

    const earnings = await dividentDistributorContract.methods.getUnpaidEarnings(account).call()

    const intEarning = parseInt(earnings) / 10 ** 18

    const pendingRewardsUniv = intEarning.toFixed(12) + " UNIV"

    const dailyShareEstimateNumerUniv = intEarning / oracle.total_dividends_dispensed * oracle.total_dispensed_24;

    const dailyShareEstimateUniv = dailyShareEstimateNumerUniv.toFixed(12) + " UNIV"
    const weeklyShareEstimateUniv = (7 * dailyShareEstimateNumerUniv).toFixed(12) + " UNIV"
    const monthlyShareEstimateUniv = (30 * dailyShareEstimateNumerUniv).toFixed(12) + " UNIV"

    document.querySelector("#mimiverse-pending-rewards-univ").textContent = pendingRewardsUniv
    document.querySelector("#mimiverse-daily-share-univ").textContent = dailyShareEstimateUniv
    document.querySelector("#mimiverse-weekly-projection-univ").textContent = weeklyShareEstimateUniv
    document.querySelector("#mimiverse-monthly-projection-univ").textContent = monthlyShareEstimateUniv

    document.querySelector("#address-result").style.display = "block";

    document.querySelector("#address-result-loading").style.display = "none";

}

window.addEventListener('load', async () => {
    getData();
});