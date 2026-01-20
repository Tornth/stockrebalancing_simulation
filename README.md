# Omnichannel Inventory Engine Simulation

A high-interaction simulation designed to visualize how modern e-commerce systems keep stock in sync across many places at once.

## 🤔 What is Stock Rebalancing? (The Simple Explanation)

Imagine you have **100 apples** in one physical box in your warehouse. You are selling these apples in 4 different markets: **Shopee, Lazada, TikTok, and your own website.**

*   **The Problem**: If you tell all 4 markets you have 100 apples, and someone buys 100 on Shopee, the other 3 markets still think they have 100 apples. You have now "sold" 400 apples but only have 1 Box. This leads to **Overselling**.
*   **The Solution (Rebalancing)**: Our system acts as the "Grand Referee." It decides how to "split" your 100 apples across the markets. If 1 apple sells on Shopee, the system instantly "shouts" to Lazada and TikTok to lower their numbers too.

### Key Concepts in this Simulation:

1.  **The Brain (Physical Tank)**: This is your warehouse shelf. It is the "Single Source of Truth."
2.  **The Ripple Effect**: How one sale on a tiny marketplace causes a "wave" that updates every other marketplace in the world.
3.  **The Safety Buffer**: Keeping a few apples "hidden" under the table just in case two people buy at the exact same millisecond. 
4.  **Stock Drift**: The short moment when a marketplace hasn't heard the "Master Brain" yet. It's like a "lag" in the real world.

---

## 🚀 Interactive Features

### 1. The "Brain" (Core Engine)
- **Reactive Physical Tank**: Tracks 1,000 physical singles as the "Absolute Truth."
- **Zero-Sum Weighting**: Adjusting weights across channels automatically rebalances the remaining channels to maintain 100%.
- **Insurance Buffer**: A configurable safety gap (0-30%) that reduces sellable stock to prevent overselling.

## 🕹️ How to "Play" the Simulation

To understand the core concepts, try these three scenarios:

1.  **The "Safety First" Scenario**: Open the **Engine Tuning** panel and set the **Insurance Buffer** to 20%. Watch 200 units disappear from the "Listed" numbers. This is how you protect yourself during a massive sales event.
2.  **The "High Velocity" Scenario**: Click **Sell Unit** on Shopee 5 times quickly. Notice the **Stock Drift** percentage spike and turn red. This shows the "Desync" that happens in the real world before the system can catch up.
3.  **The "Strategy Switch"**: Toggle between **Equal** and **Weighted**. Notice the blue **Target** numbers. One strategy treats every store as equal; the other favors your "Best Seller" stores.

## ⚙️ Logic Breakdown (The "Rules")

- **Zero-Sum Weighting**: If you want to give more stock to Shopee, you must take it from somewhere else. The system ensures you never "invent" stock that doesn't exist.
- **BOM Layer (Sets/Packs)**: Selling a "Pack of 12" is like selling 12 items at once. The system automatically does the math for you, so you don't have to count manually.
- **The Gatekeeper**: The system is smart. If the difference is only 1 unit, it might wait. If the difference is big, it triggers an "Emergency Sync" (Pulse).

---

## 🛠 Technical Stack
- **Frontend**: Vue 2.7 (Options API)
- **Animation**: GSAP 3.x (with Object Pooling for performance)
- **Styling**: Tailwind CSS (Glassmorphism aesthetics)
- **Build Tool**: Vite

## ⚙️ Logic breakdown

### Zero-Sum Weight Algorithm
When a slider is moved, the delta is subtracted/added to all other **active** channels proportionally based on their current weights. This ensures the total always equals 1,000 (represented as 100.0%).

### Drift Calculation
$$\text{Drift} = \frac{|\text{Ideal Stock} - \text{Marketplace Stock}|}{\text{Ideal Stock}}$$
The simulation introduces **800ms latency** on sales to allow the "Stock Drift" percentage to spike visually before the sync resolves.

## 🚦 Getting Started
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. View at: `http://localhost:5173`

---
*Created for the BentoWeb Omnichannel Engine Demonstration.*
