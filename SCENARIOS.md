# 🧠 Inventory Engine: Stock Rebalancing Scenarios

This document explains the mathematical and visual behavior of the rebalancing engine under various real-world scenarios, including the "Hard Truth" edge cases.

## 📐 The Core Formula
The "Brain" calculates the stock available for sale using this hierarchy:
`Sales Stock (Available) = Physical Stock - Reserved Stock - Effective Buffer`

---

## 1. Normal Operation (The Happy Path)
*   **Condition**: Physical stock is high, Reserved is low.
*   **Behavior**: The engine maintains a full "Insurance Buffer" to protect against drift.
*   **Sync**: Stock is distributed across channels (Shopee, Lazada, etc.) based on weight distribution.
*   **Visual**: Blue liquid in the tank, clear dashed line for the Buffer.

## 2. Buffer Compression (The Warning)
*   **Condition**: `Reserved + Buffer > Physical`
*   **Behavior**: Orders are coming in faster than the safety net can handle. The engine "compresses" the buffer to prioritize actual orders over safety margins.
*   **Math**: `Effective Buffer = max(0, Physical - Reserved)`
*   **Visual**: The buffer zone turns into **Yellow/Black Caution Stripes**. The label changes to `⚠️ BUFFER COMPRESSED`.

## 3. Inventory Collapse (Overselling)
*   **Condition**: `Physical - Reserved < 0` (System is over-committed).
*   **Behavior**: Sales stock drops into the negative. The system is now in "Sales Debt."
*   **Marketplace Instruction**: The engine floors marketplace targets at **0**. It tells all channels to stop selling immediately.
*   **Visual**: 
    - Pulsing red **CRITICAL** banner at top.
    - Sales Stock numbers turn red.
    - Pulsing red ring around the Physical Tank.

## 4. Fulfillment Debt (Physical Stock Debt)
*   **Condition**: Merchant clicks `SHIP ALL` while `Physical < Reserved`.
*   **Behavior**: Physical stock drops into negative numbers. This simulates shipping items that weren't actually on the shelf (Omnichannel drift reality).
*   **Math**: `Physical Stock` becomes negative (e.g., -5).
*   **Visual**: A red **Debt Zone** grows from the bottom of the tank. The caution stripes stay visible at a minimum height to show the safety net is crushed.

## 5. Recovery (Restocking)
*   **Condition**: Merchant adds stock (e.g., +100 units).
*   **Behavior**: 
    - Physical stock returns to positive.
    - Effective Buffer "de-compresses" back to its full target.
    - Sales stock becomes positive.
*   **Visual**: Red cues (banners, rings, debt zones) vanish. The blue liquid returns. The engine begins syncing positive values back to marketplaces.

---

## 🚦 Alert Level Summary

| State | Sales Stock | Physical Stock | Visual Signal | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Stable** | Positive | Positive | Blue Liquid | Low |
| **Warning** | 0 to Low | Positive | Yellow Caution Stripes | Medium |
| **Critical** | Negative | Positive | Red Banner + Red Numbers | High |
| **Disaster** | Negative | Negative | Red Debt Zone in Tank | Emergency |
