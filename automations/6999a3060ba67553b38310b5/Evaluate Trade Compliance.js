;(async () => {
  try {
    // Collect context from simulation steps
    const agents = getContext("agents") || []
    const marketState = getContext("marketState") || {}
    const periodTradePrices = getContext("periodTradePrices") || []
    // Simulate a proposed trade decision for every agent in the final period
    // In production, this decision would come from agent logic or user input
    const results = []
    const violatedRulesMap = {
      1: "The agent must not exceed maximum position size limits.",
      2: "The agent must maintain minimum liquidity requirements.",
      3: "High-risk trades are discouraged during high volatility periods.",
      4: "The agent's action must align with its declared strategy."
    }

    // Example compliance constraints
    const MAX_POSITION_SIZE = 50 // Holdings or contracts
    const MIN_LIQUIDITY = 5000 // Arbitrary soft threshold for available cash
    const VOLATILITY_THRESHOLD = 15 // If stddev above, counts as high volatility

    // We'll use last period's data for evaluation
    const lastPeriodIdx = periodTradePrices.length - 1
    const lastStats = periodTradePrices[lastPeriodIdx] || {}
    const volatility = typeof lastStats.sd === "number" ? lastStats.sd : 0
    agents.forEach(agent => {
      // In real workflow, decision would be dynamic. Here we make a sample decision per agent type
      let decision = {
        action: agent.type === "buyer" ? "buy" : "sell",
        quantity: 10,
        instrument: "XYZ"
      }
      // Rule evaluation
      let violatedRules = []
      let explanation = []
      // Rule 1: Position size
      const newHoldings = agent.type === "buyer" ? agent.portfolio.holdings + decision.quantity : agent.portfolio.holdings - decision.quantity
      if (Math.abs(newHoldings) > MAX_POSITION_SIZE) {
        violatedRules.push(1)
        explanation.push("Position size after trade would exceed limit.")
      }
      // Rule 2: Minimum liquidity (cash)
      const postTradeCash = agent.portfolio.cash - (agent.type === "buyer" ? lastStats.closePrice * decision.quantity : 0)
      if (postTradeCash < MIN_LIQUIDITY) {
        violatedRules.push(2)
        explanation.push("Post-trade liquidity below required minimum.")
      }
      // Rule 3: High-risk trade during volatility
      if (volatility > VOLATILITY_THRESHOLD && decision.action === "buy" && decision.quantity > 5) {
        violatedRules.push(3)
        explanation.push("Trade deemed high-risk due to market volatility.")
      }
      // Rule 4: Action aligns with strategy
      // (Here we just simulate ZIAgent always compliant, but non-ZI would be flagged)
      if (agent.strategy !== "ZIAgent") {
        violatedRules.push(4)
        explanation.push("Strategy mismatch for assigned trade action.")
      }
      // Assemble risk score and classification
      let riskScore = 0
      if (violatedRules.length === 0) riskScore = 10
      else if (violatedRules.length === 1) riskScore = 40
      else if (violatedRules.length === 2) riskScore = 65
      else riskScore = 85
      let complianceStatus = "PASS"
      if (violatedRules.length >= 2) complianceStatus = "FAIL"
      else if (violatedRules.length === 1) complianceStatus = "WARNING"
      // Build the exact output JSON for this agent/decision
      const result = {
        agentId: agent.id,
        complianceStatus,
        riskScore,
        violatedRules: violatedRules.map(r => violatedRulesMap[r]),
        explanation: explanation.join(" ")
      }
      results.push(result)
      console.log(`Evaluated compliance for agent ${agent.id}:`, result)
    })
    setContext("complianceResults", results)
    // For downstream: setContext('lastComplianceOutput', results[results.length-1] || {});
    console.log("Compliance results set in context.")
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
