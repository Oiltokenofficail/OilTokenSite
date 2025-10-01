// WatchPayment.js
// Simple script to calculate TON for Oil Tokens and show owner's address

// Owner's Tonkeeper wallet address
const ownerWallet = "UQCQ0A_nGICwBavJs9FbGclF7NYAv_cEkScvpU1XeppmyEqZ";

// Default price of 1 OIL in TON
let oilPriceTON = 0.01;

// Function to calculate total TON based on number of OIL tokens
function calculatePayment() {
    const tokenAmount = parseFloat(document.getElementById("tokenAmount").value);
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
        alert("Please enter a valid token amount");
        return;
    }
    const totalTON = tokenAmount * oilPriceTON;
    document.getElementById("totalTON").innerText = totalTON.toFixed(4) + " TON";
}

// Function to show withdrawal info (manual step)
function showWithdrawalInfo() {
    const tokenAmount = parseFloat(document.getElementById("tokenAmount").value);
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
        alert("Please enter a valid token amount");
        return;
    }
    const totalTON = tokenAmount * oilPriceTON;
    document.getElementById("withdrawalInfo").innerHTML =
        `<p>Payment Amount: <b>${totalTON.toFixed(4)} TON</b></p>
         <p>Owner Wallet Address: <b>${ownerWallet}</b></p>`;
}

// Optional: Function to update price dynamically
function updatePrice(newPrice) {
    oilPriceTON = parseFloat(newPrice);
    document.getElementById("currentPrice").innerText = oilPriceTON + " TON / OIL";
}
