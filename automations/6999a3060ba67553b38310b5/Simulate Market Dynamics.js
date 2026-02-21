const SMRS = require("single-market-robot-simulator")

;(async () => {
  try {
    const marketConfig = getContext("marketConfig")
    const agents = getContext("agents")

    const simulation = new SMRS.Simulation(marketConfig)

    const marketState = {
      priceHistory: [],
      liquidity: [],
      volatilitySpikes: [],
      tradeHistory: []
    }

    // Optional: log available methods for visibility
    console.log("Simulation object methods:", Object.keys(simulation))

    // Simulate each trading period
    for (let period = 0; period < marketConfig.periods; period++) {
      simulation.runPeriod()
      // Extract stats from simulation.periodTradePrices[period]
      const stats = simulation.periodTradePrices[period]
      if (!stats) {
        console.warn(`No stats found for period ${period}`)
        continue
      }
      marketState.priceHistory.push({
        open: stats.openPrice,
        high: stats.highPrice,
        low: stats.lowPrice,
        close: stats.closePrice
      })
      marketState.liquidity.push(stats.volume)
      marketState.tradeHistory.push(stats)
      // Volatility detection
      if (typeof stats.sd === "number" && stats.sd > 20) {
        marketState.volatilitySpikes.push({ period, sd: stats.sd })
      }
      // Log progress after each period/tick
      console.log(`Finished period ${period + 1}/${marketConfig.periods}`)
    }

    // Additional feedback loop modelling (optional)
    // -- for now, leave as placeholder for agent trading feedback

    setContext("marketState", marketState)
    // Only pass serializable stats! Remove simulation object from context
    setContext("periodTradePrices", simulation.periodTradePrices)

    // Ensure reasoningLog key exists for downstream compliance checks
    setContext("reasoningLog", [])
    // Ensure complianceResults context exists for reporting step
    setContext("complianceResults", [])
    console.log("Compliance results set as empty array for reporting.")

    console.log("Simulated market dynamics. Context updated with marketState and periodTradePrices.")
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
