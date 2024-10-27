let cocaineCount = 0;
let money = 0;
let conversionRate = 1; // 1:1 cocaine to money conversion rate

// Upgrade definitions
const upgrades = {
  betterCocaine: {
    originalPrice: 100,
    price: 100,
    cocaineMultiplier: 1.5,
    priceIncrease: 1.5,
    purchased: 0
  },
  lab: {
    originalPrice: 500,
    price: 500,
    cocaineMultiplier: 2,
    priceIncrease: 2,
    purchased: 0
  },
  fasterProduction: {
    originalPrice: 1000,
    price: 1000,
    productionRate: 1,
    priceIncrease: 2,
    purchased: 0
  },
  dealer: {
    originalPrice: 2000,
    price: 2000,
    passiveIncome: 10,
    priceIncrease: 2,
    purchased: 0
  },
  valueIncrease: {
    originalPrice: 300,
    price: 300,
    moneyMultiplier: 1.5,
    priceIncrease: 1.5,
    purchased: 0
  },
  betterConversion: {
    originalPrice: 400,
    price: 400,
    conversionMultiplier: 1.1,  // Improves conversion rate by 10%
    priceIncrease: 1.5,
    purchased: 0
  },
  increasedLabEfficiency: { // New upgrade
    originalPrice: 750,
    price: 750,
    productionRate: 1, // Increases production by 1 cocaine per second
    priceIncrease: 1.5,
    purchased: 0
  },
  marketingCampaign: { // New upgrade
    originalPrice: 600,
    price: 600,
    conversionMultiplier: 1.15, // Improves conversion rate by 15%
    priceIncrease: 1.5,
    purchased: 0
  },
  bulkDealer: { // New upgrade
    originalPrice: 3000,
    price: 3000,
    passiveIncome: 15, // Earns $15 per second
    priceIncrease: 2,
    purchased: 0
  },
  qualityControl: { // New upgrade
    originalPrice: 2000,
    price: 2000,
    moneyMultiplier: 1.2, // Improves money from selling cocaine by 20%
    priceIncrease: 1.5,
    purchased: 0
  },
  globalExpansion: { // New upgrade
    originalPrice: 5000,
    price: 5000,
    conversionIncrease: 0.2, // Improves conversion rate by 0.2
    priceIncrease: 1.5,
    purchased: 0
  }
};

let autoProductionInterval = null;  // Interval for faster production
let dealerIncomeInterval = null;    // Interval for dealer income

// Load game progress from localStorage
function loadGame() {
  const savedCocaineCount = localStorage.getItem('cocaineCount');
  const savedMoney = localStorage.getItem('money');
  const savedUpgrades = JSON.parse(localStorage.getItem('upgrades'));

  if (savedCocaineCount !== null) cocaineCount = parseInt(savedCocaineCount);
  if (savedMoney !== null) money = parseInt(savedMoney);
  if (savedUpgrades !== null) Object.assign(upgrades, savedUpgrades);

  updateUI();
}

// Save game progress to localStorage
function saveGame() {
    localStorage.setItem('cocaineCount', cocaineCount);
    localStorage.setItem('money', money);
    localStorage.setItem('upgrades', JSON.stringify(upgrades));
}

// Function to collect cocaine by clicking
function collectCocaine() {
  let increment = 1;

  // Apply multipliers from purchased upgrades
  if (upgrades.betterCocaine.purchased) {
    increment *= Math.pow(upgrades.betterCocaine.cocaineMultiplier, upgrades.betterCocaine.purchased);
  }
  if (upgrades.lab.purchased) {
    increment *= Math.pow(upgrades.lab.cocaineMultiplier, upgrades.lab.purchased);
  }

  // Apply efficiency upgrades
  if (upgrades.increasedLabEfficiency.purchased) {
    increment += upgrades.increasedLabEfficiency.productionRate * upgrades.increasedLabEfficiency.purchased;
  }

  cocaineCount += increment;

  // Update UI
  document.getElementById('cocaineCount').innerText = Math.floor(cocaineCount);
  saveGame();
}

// Function to sell cocaine
function sellCocaine() {
  if (cocaineCount > 0) {
    let earnings = cocaineCount * conversionRate;

    // Apply any money multiplier upgrade
    if (upgrades.valueIncrease.purchased) {
      earnings *= Math.pow(upgrades.valueIncrease.moneyMultiplier, upgrades.valueIncrease.purchased);
    }
    if (upgrades.qualityControl.purchased) {
      earnings *= Math.pow(upgrades.qualityControl.moneyMultiplier, upgrades.qualityControl.purchased);
    }

    money += earnings;
    cocaineCount = 0;  // Reset cocaine after selling

    // Prevent negative values
    if (money < 0) money = 0;

    // Update UI
    document.getElementById('money').innerText = Math.floor(money);
    document.getElementById('cocaineCount').innerText = Math.floor(cocaineCount);
  }
  saveGame();
}

// Buy an upgrade
function buyUpgrade(upgradeName) {
  const upgrade = upgrades[upgradeName];

  // Check if player can afford upgrade
  if (money >= upgrade.price) {
    console.log(`Buying upgrade: ${upgradeName}, Price: ${upgrade.price}`);

    money -= upgrade.price;
    upgrade.purchased += 1;
    upgrade.price *= upgrade.priceIncrease;

    // Prevent negative values
    if (money < 0) money = 0;

    // Update UI for the upgrade price
    document.getElementById('money').innerText = Math.floor(money);
    document.getElementById(upgradeName + 'Price').innerText = Math.floor(upgrade.price);

    // Handle production-based upgrades
    if (upgradeName === 'fasterProduction' && upgrade.purchased === 1) {
      startAutoProduction();
    }

    if (upgradeName === 'dealer' && upgrade.purchased === 1) {
      startDealerIncome();
    }

    // If it's a conversion upgrade, improve the conversion rate
    if (upgradeName === 'betterConversion') {
      conversionRate *= upgrade.conversionMultiplier;
    }

    if (upgradeName === 'marketingCampaign') {
      conversionRate *= upgrade.conversionMultiplier; // Improve conversion rate
    }

    if (upgradeName === 'bulkDealer') {
      // Increase dealer income based on bulk dealer
      upgrades.dealer.passiveIncome += upgrade.passiveIncome;
    }

    if (upgradeName === 'globalExpansion') {
      conversionRate += upgrade.conversionIncrease; // Increase conversion rate
    }

    console.log(`${upgradeName} upgrade purchased! Total purchased: ${upgrade.purchased}`);
  } else {
    console.log(`Not enough money to buy ${upgradeName}. Current money: ${money}`);
  }
  saveGame();
}

// Start automatic cocaine production from the "Faster Production" upgrade
function startAutoProduction() {
  if (autoProductionInterval) {
    clearInterval(autoProductionInterval);  // Clear any existing intervals
  }
  autoProductionInterval = setInterval(() => {
    collectCocaine();
  }, 1000);  // Produces cocaine every second
}

// Start earning passive income from dealers
function startDealerIncome() {
  if (dealerIncomeInterval) {
    clearInterval(dealerIncomeInterval);  // Clear existing interval
  }
  dealerIncomeInterval = setInterval(() => {
    money += upgrades.dealer.passiveIncome * upgrades.dealer.purchased;
    // Prevent negative money
    if (money < 0) money = 0;
    document.getElementById('money').innerText = Math.floor(money);
  }, 1000);  // Earn money every second
}

document.getElementById('resetButton').addEventListener('click', function() {
  // Show a confirmation dialog
  const confirmReset = confirm("Are you sure you want to reset the game? This action cannot be undone.");

  // If the user confirmed, reset the game
  if (confirmReset) {
      resetProgress();
      
      // Show a message indicating the reset occurred
      const messageDiv = document.getElementById('message');
      messageDiv.innerText = "Game has been reset!";
      
      setTimeout(() => {
          messageDiv.innerText = '';
      }, 3000); // Message disappears after 3 seconds
  }
});

function resetProgress() {
  cocaineCount = 0;
  money = 0;
  conversionRate = 1;

  Object.keys(upgrades).forEach(upgrade => {
      upgrades[upgrade].purchased = 0;
      upgrades[upgrade].price = upgrades[upgrade].originalPrice;
  });

  // Clear localStorage
  localStorage.removeItem('cocaineCount');
  localStorage.removeItem('money');
  localStorage.removeItem('upgrades');

  // Update the UI
  updateUI();

  console.log('Progress has been reset.');
}

function updateUI() {
  document.getElementById('cocaineCount').textContent = cocaineCount;
  document.getElementById('money').textContent = money;
  Object.keys(upgrades).forEach(upgrade => {
      document.getElementById(`${upgrade}Price`).textContent = upgrades[upgrade].price.toFixed(0);
  });
}

function changeLabName() {
  const newName = document.getElementById('labNameInput').value.trim();
  if (newName) {
      document.getElementById('labName').textContent = newName;
  }
}

function openCredits() {
  document.getElementById('creditsModal').style.display = 'flex';
}

function closeCredits() {
  document.getElementById('creditsModal').style.display = 'none';
}

window.onload = function () {
  loadGame();
};
