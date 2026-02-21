// Import required modules
const { v4: uuidv4 } = require("uuid")
const SMRS = require("single-market-robot-simulator")

;(async () => {
  try {
    // Define market configuration (tickers, prices, liquidity, volatility)
    const marketConfig = {
      buyerValues: [100, 95, 90, 85, 80], // Initial values for buyers
      sellerCosts: [10, 20, 30, 40, 50], // Initial costs for sellers
      numberOfBuyers: 3,
      numberOfSellers: 3,
      buyerAgentType: ["ZIAgent"],
      sellerAgentType: ["ZIAgent"],
      periods: 5,
      periodDuration: 1000,
      buyerRate: 0.2,
      sellerRate: 0.2,
      L: 1,
      H: 200,
      integer: true,
      keepPreviousOrders: false,
      ignoreBudgetConstraint: false,
      xMarket: { buySellBookLimit: 0, resetAfterEachTrade: true }
    }

    // Create agent profiles with unique IDs, portfolio, and strategy name
    const agents = []
    for (let i = 0; i < marketConfig.numberOfBuyers; i++) {
      agents.push({
        id: uuidv4(),
        type: "buyer",
        strategy: "ZIAgent",
        portfolio: { cash: 10000, holdings: 0 },
        riskExposure: 0
      })
    }
    for (let i = 0; i < marketConfig.numberOfSellers; i++) {
      agents.push({
        id: uuidv4(),
        type: "seller",
        strategy: "ZIAgent",
        portfolio: { cash: 10000, holdings: 10 },
        riskExposure: 0
      })
    }

    // Share initial market and agent data for next step
    setContext("marketConfig", marketConfig)
    setContext("agents", agents)
    console.log("Initialized market and agents. Context set for simulation.")
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
