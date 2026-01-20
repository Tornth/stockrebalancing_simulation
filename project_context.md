--- FILE: README.md ---
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



--- FILE: package.json ---
{
  "name": "rebalance_simulation",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "@vitejs/plugin-vue2": "^2.3.4",
    "autoprefixer": "^10.4.23",
    "gsap": "^3.14.2",
    "postcss": "^8.5.6",
    "tailwindcss": "3.4",
    "vite": "^7.3.1",
    "vue": "^2.7.16"
  }
}


--- FILE: vite.config.js ---
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});



--- FILE: tailwind.config.js ---
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f172a',
        'brand-card': '#1e293b',
        'drift-alert': '#f43f5e',
        'sync-pulse': '#10b981',
        'ghost-blue': '#60a5fa'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}



--- FILE: index.html ---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Omnichannel Inventory Engine Simulation</title>
  </head>
  <body class="bg-brand-dark text-slate-100 overflow-hidden">
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>



--- FILE: src/main.js ---
import Vue from 'vue';
import App from './App.vue';
import './assets/main.css';

Vue.config.productionTip = false;

new Vue({
    render: h => h(App),
}).$mount('#app');



--- FILE: src/App.vue ---
<template>
  <div id="app" class="min-h-screen p-8 relative flex flex-col" :class="{ 'system-in-flight': isSyncing }">
    <!-- In-Flight Overlay -->
    <div v-if="isSyncing" class="fixed inset-0 z-50 system-in-flight-overlay flex items-center justify-center">
      <div class="glass-card p-6 flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-sync-pulse border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-xl font-bold text-sync-pulse">SYSTEM IN-FLIGHT: SYNCING...</p>
        <p class="text-sm text-slate-400">Performing mission-critical operations</p>
      </div>
    </div>

    <!-- Header -->
    <header class="mb-8 flex justify-between items-end border-b border-slate-800 pb-6">
      <div>
        <h1 class="text-4xl font-extrabold tracking-tight text-white mb-2">
          Omnichannel <span class="text-blue-400">Inventory Engine</span>
        </h1>
        <div class="flex gap-4 items-center">
          <div class="bg-slate-800/80 p-1 rounded-lg flex gap-1 border border-slate-700">
            <button 
              v-for="s in ['weighted', 'equal', 'mirror']" :key="s"
              @click="setPreviewStrategy(s)"
              class="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all"
              :class="[
                selectedStrategy === s ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white',
                previewStrategy === s ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 bg-blue-900/50' : ''
              ]"
            >
              {{ s }}
            </button>
          </div>
          <span class="text-xs text-slate-500 font-medium">Distribution Strategy</span>
        </div>
      </div>

      <div class="flex flex-col items-end gap-3">
        <div class="flex gap-2">
          <button 
            v-for="sku in skuTypes" :key="sku.id"
            @click="selectedSku = sku.id"
            class="px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all"
            :class="selectedSku === sku.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'"
          >
            {{ sku.name }}
          </button>
        </div>
        
        <div class="flex gap-4">
          <button 
            @click="showTuning = !showTuning"
            class="px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all"
            :class="showTuning ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-900/40' : 'bg-slate-800 border-slate-700 text-slate-400'"
          >
            Engine Tuning
          </button>
          
          <button 
            @click="toggleBOM"
            class="px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all"
            :class="showBOM ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'"
          >
            BOM Visuals: {{ showBOM ? 'ON' : 'OFF' }}
          </button>
          
          <div v-if="previewStrategy" class="flex items-center gap-3 animate-pulse">
             <span class="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Unsaved Strategy Draft</span>
             <button 
               @click="applyStrategy"
               class="px-6 py-2 bg-sync-pulse hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all"
             >
               Confirm Master Sync
             </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Tuning Panel -->
    <transition name="slide-fade">
      <div v-if="showTuning" class="mb-8 glass-card border-amber-500/30 p-6 grid grid-cols-3 gap-8">
        <div class="space-y-4">
          <h3 class="text-xs font-black text-amber-500 uppercase flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            Safety Guardrails
          </h3>
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-mono">
              <span class="text-slate-400">Insurance Buffer</span>
              <span class="text-amber-400 font-bold">{{ bufferPercent }}%</span>
            </div>
            <input type="range" v-model.number="bufferPercent" min="0" max="30" step="1" class="w-full accent-amber-500">
          </div>
          <p class="text-[9px] text-slate-500 italic">Reduces total physical stock listed across all channels.</p>
        </div>

        <div class="space-y-4">
          <h3 class="text-xs font-black text-blue-400 uppercase flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
            Sync Sensitivity (Rel)
          </h3>
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-mono">
              <span class="text-slate-400">Drift Threshold</span>
              <span class="text-blue-400 font-bold">{{ pctThreshold }}%</span>
            </div>
            <input type="range" v-model.number="pctThreshold" min="1" max="15" step="1" class="w-full accent-blue-500">
          </div>
          <p class="text-[9px] text-slate-500 italic">Percentage difference before triggering a global sync.</p>
        </div>

        <div class="space-y-4">
          <h3 class="text-xs font-black text-pink-400 uppercase flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
            Sync Sensitivity (Abs)
          </h3>
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-mono">
              <span class="text-slate-400">Absolute Gap</span>
              <span class="text-pink-400 font-bold">{{ absThreshold }} units</span>
            </div>
            <input type="range" v-model.number="absThreshold" min="1" max="10" step="1" class="w-full accent-pink-500">
          </div>
          <p class="text-[9px] text-slate-500 italic">Unit difference threshold for instant reconciliation.</p>
        </div>
      </div>
    </transition>

    <main class="flex-grow grid grid-cols-12 gap-8">
      <!-- Left Panel: The Brain -->
      <section class="col-span-4 flex flex-col gap-8">
        <div class="glass-card p-6 h-full">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Inventory "Brain"
          </h2>
          
          <!-- Physical Tank Visualization -->
          <div class="relative h-64 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden mb-8 physical-tank-main">
            <div 
              class="absolute bottom-0 left-0 right-0 bg-blue-600/30 transition-all duration-500"
              :style="{ height: (physicalStock / 10) + '%' }"
            >
              <div class="absolute top-0 left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
            </div>
            <!-- Buffer Zone -->
            <div 
              class="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-drift-alert/50 bg-drift-alert/5"
              :style="{ height: (bufferStock / 10) + '%' }"
            >
              <span class="absolute -top-6 right-2 text-xs text-drift-alert font-mono">INSURANCE GAP ({{ bufferPercent }}%)</span>
            </div>
            
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-5xl font-black text-white rolling-number">{{ Math.round(displayPhysicalStock) }}</span>
              <span class="text-xs uppercase tracking-widest text-slate-400">Physical Units</span>
            </div>
          </div>

          <!-- Sales Stock display -->
          <div class="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div class="sales-stock-display">
              <p class="text-xs text-slate-400 uppercase font-bold tracking-tight">Sales Stock (Listed)</p>
              <p class="text-3xl font-black text-blue-400">{{ salesStock }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-400 uppercase font-bold tracking-tight">Buffer</p>
              <p class="text-2xl font-black text-drift-alert">{{ bufferStock }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Panel: Channels -->
      <section class="col-span-8 relative">
        <!-- Data Packet Layer -->
        <div class="absolute inset-0 pointer-events-none z-10 overflow-visible" id="packet-layer">
          <div 
            v-for="p in packetPool" 
            :key="p.id" 
            :id="'packet-' + p.id"
            class="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa] opacity-0"
          ></div>
          <!-- BOM Connection Lines -->
          <svg class="absolute inset-0 w-full h-full" id="bom-svg"></svg>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <channel-card 
            v-for="channel in channels" 
            :key="channel.id"
            :channel="channel"
            :sales-stock="salesStock"
            :sku-factor="activeSku.factor"
            :is-sliders-active="(previewStrategy || selectedStrategy) === 'weighted'"
            :pct-threshold="pctThreshold"
            :abs-threshold="absThreshold"
            :id="'card-' + channel.id"
            @weight-change="rebalanceWeights"
            @trigger-order="triggerOrder"
            @toggle-manual="toggleManual"
            @api-status-change="handleApiStatus"
            @manual-stock-change="handleManualStockChange"
          />
        </div>
      </section>
    </main>

    <!-- Log Feed -->
    <footer class="h-48 glass-card mt-8 p-4 overflow-hidden flex flex-col">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-500">Live Engine Log</h3>
        <span class="text-[10px] font-mono text-slate-600">v1.0.0-PRO</span>
      </div>
      <div class="flex-grow overflow-y-auto font-mono text-sm space-y-1" ref="logContainer">
        <div v-for="(log, index) in logs" :key="index" class="text-slate-400">
          <span class="text-slate-600">[{{ log.time }}]</span> {{ log.message }}
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import ChannelCard from './components/ChannelCard.vue';
import { gsap } from 'gsap';

export default {
  components: { ChannelCard },
  data() {
    return {
      physicalStock: 1000,
      displayPhysicalStock: 1000,
      bufferPercent: 5,
      pctThreshold: 5,
      absThreshold: 2,
      isSyncing: false,
      showBOM: false,
      showTuning: false,
      selectedStrategy: 'weighted',
      previewStrategy: null,
      logs: [],
      skuTypes: [
        { id: 'single', name: 'Master SKU (Single)', factor: 1 },
        { id: 'pack6', name: 'Pack of 6', factor: 6 },
        { id: 'pack12', name: 'Pack of 12', factor: 12 }
      ],
      selectedSku: 'single',
      channels: [
        { id: 'shopee', name: 'Shopee', weight: 40, internal: 380, ideal: 380, drift: 0, isManual: false, apiFailing: false },
        { id: 'lazada', name: 'Lazada', weight: 30, internal: 285, ideal: 285, drift: 0, isManual: false, apiFailing: false },
        { id: 'tiktok', name: 'TikTok', weight: 20, internal: 190, ideal: 190, drift: 0, isManual: false, apiFailing: false },
        { id: 'website', name: 'BentoWeb', weight: 10, internal: 95, ideal: 95, drift: 0, isManual: false, apiFailing: false }
      ],
      packetPool: []
    };
  },
  computed: {
    activeSku() {
      return this.skuTypes.find(s => s.id === this.selectedSku);
    },
    bufferStock() {
      return Math.ceil(this.physicalStock * (this.bufferPercent / 100));
    },
    salesStock() {
      return Math.max(0, this.physicalStock - this.bufferStock);
    },
    effectiveInternalStock() {
      // Returns total stock currently on marketplaces (as singles)
      return this.channels.reduce((acc, ch) => acc + ch.internal, 0);
    }
  },
  watch: {
    physicalStock(newVal) {
      gsap.to(this, { displayPhysicalStock: newVal, duration: 0.5 });
    },
    salesStock: {
      handler() {
        this.updateIdeals();
      }
    }
  },
  methods: {
    addLog(message) {
      const now = new Date();
      const time = now.toTimeString().split(' ')[0];
      this.logs.unshift({ time, message });
      if (this.logs.length > 50) this.logs.pop();
    },
    toggleBOM() {
      this.showBOM = !this.showBOM;
      this.addLog(`${this.showBOM ? 'Enabled' : 'Disabled'} BOM Relationship mapping.`);
    },
    updateIdeals() {
      const strategy = this.previewStrategy || this.selectedStrategy;
      
      this.channels.forEach(ch => {
        let baseIdeal = 0;
        if (strategy === 'weighted') {
          baseIdeal = Math.floor(this.salesStock * (ch.weight / 100));
        } else if (strategy === 'equal') {
          baseIdeal = Math.floor(this.salesStock / this.channels.length);
        } else if (strategy === 'mirror') {
          baseIdeal = this.salesStock; // Mirror listed stock to all channels
        }
        
        // Show as "singles" or adjusted by SKU factor? 
        // Requirements say: "When Pack of 12 is sold ... Pack of 6 and Single shrink simultaneously"
        // So ideal is always based on Physical Singles available.
        ch.ideal = baseIdeal;
        
        // Calculate ghost value if in preview
        if (this.previewStrategy) {
          ch.ghostValue = baseIdeal;
        } else {
          ch.ghostValue = null;
        }
      });
    },
    setPreviewStrategy(strategy) {
      if (this.selectedStrategy === strategy) {
        this.previewStrategy = null;
      } else {
        this.previewStrategy = strategy;
      }
      this.updateIdeals();
      this.addLog(`Ghost Preview: Visualizing '${strategy.toUpperCase()}' strategy moves.`);
    },
    async applyStrategy() {
      if (!this.previewStrategy) return;
      this.isSyncing = true;
      this.addLog(`Applying System-Wide '${this.previewStrategy.toUpperCase()}' Strategy...`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.selectedStrategy = this.previewStrategy;
      this.previewStrategy = null;
      this.isSyncing = false;
      this.performMasterSync();
    },
    rebalanceWeights({ id, value }) {
      const masterId = id;
      const newValue = parseFloat(value);
      const masterChannel = this.channels.find(c => c.id === masterId);
      const oldValue = masterChannel.weight;
      const delta = newValue - oldValue;
      
      const otherChannels = this.channels.filter(c => c.id !== masterId);
      const sumOthers = otherChannels.reduce((acc, c) => acc + c.weight, 0);

      if (sumOthers > 0) {
        otherChannels.forEach(c => {
          const reduction = delta * (c.weight / sumOthers);
          c.weight = Math.max(0, c.weight - reduction);
        });
      }

      masterChannel.weight = newValue;
      
      const total = this.channels.reduce((acc, c) => acc + c.weight, 0);
      const diff = 100 - total;
      if (Math.abs(diff) > 0.001) {
        const fallback = otherChannels.find(c => c.weight > 0) || otherChannels[0];
        if (fallback) fallback.weight += diff;
      }
      
      this.updateIdeals();
    },
    toggleManual(channelId) {
      const ch = this.channels.find(c => c.id === channelId);
      ch.isManual = !ch.isManual;
      this.addLog(`${ch.name}: ${ch.isManual ? 'Manual Override Enabled' : 'Global Sync Resumed'}.`);
    },
    handleApiStatus({ id, status }) {
      const ch = this.channels.find(c => c.id === id);
      ch.apiFailing = status;
      this.addLog(`${ch.name}: ${status ? 'API Connection Failed (Simulated)' : 'API Connection Restored'}.`);
    },
    handleManualStockChange({ id, value }) {
      const ch = this.channels.find(c => c.id === id);
      ch.internal = parseInt(value) || 0;
    },
    async triggerOrder(channelId) {
      const channel = this.channels.find(c => c.id === channelId);
      const factor = this.activeSku.factor;
      
      if (this.physicalStock < factor) {
        this.addLog(`ERROR: Physical stock exhausted! Cannot fulfill ${this.activeSku.name}.`);
        return;
      }

      // Stage 1: Physical Pulse (Instant)
      // This immediately recalculates 'Ideal Stock' for all channels
      this.addLog(`ORDER_IN: ${this.activeSku.name} sale on ${channel.name}. Mental Model: Brain subtracts ${factor} units first.`);
      gsap.to(".physical-tank-main", { x: 5, yoyo: true, repeat: 3, duration: 0.05 });
      this.physicalStock -= factor;

      // Stage 2: Data Packet (Visual Flow)
      this.showDataPacket(channelId);

      // Stage 2.5: BOM Visual Connection
      if (this.showBOM) {
         this.animateBOMLine(channelId);
         this.channels.forEach(ch => {
           if (ch.id !== channelId) {
             gsap.to(`#card-${ch.id}`, { scale: 1.03, backgroundColor: 'rgba(96, 165, 250, 0.15)', yoyo: true, repeat: 1, duration: 0.15 });
           }
         });
      }

      // Stage 3: Marketplace Drop (Delayed - simulate API travel time)
      // This creates the "Desync" period where Drift is visible
      await new Promise(resolve => setTimeout(resolve, 800));
      channel.internal = Math.max(0, channel.internal - factor);

      // Stage 4: Global Drift Gatekeeper (Omnichannel Scan)
      // We check ALL channels because a drop in physical stock affects everyone's Ideal
      let syncRequired = false;
      let triggerReason = "";

      for (const ch of this.channels) {
        if (ch.isManual) continue;

        const displayIdeal = Math.floor(ch.ideal / factor);
        const displayInternal = Math.floor(ch.internal / factor);
        const absDrift = Math.abs(displayIdeal - displayInternal);
        const pctDrift = displayIdeal > 0 ? (absDrift / displayIdeal) : 0;

        if (pctDrift > (this.pctThreshold / 100) || absDrift >= this.absThreshold) {
          syncRequired = true;
          triggerReason = `${ch.name} drift (${absDrift} units / ${Math.round(pctDrift * 100)}%) exceeded ${this.pctThreshold}% / ${this.absThreshold}u gatekeeper.`;
          break; 
        }
      }
      
      if (syncRequired) {
        this.addLog(`Sync Triggered: ${triggerReason}`);
        this.performMasterSync();
      } else {
        this.addLog(`Drift Ignored: System-wide drift is within safe parameters (Gatekeeper: ${this.pctThreshold}% / ${this.absThreshold}u).`);
      }
    },
    showDataPacket(targetId) {
      const packet = this.packetPool.find(p => !p.active);
      if (!packet) return;

      packet.active = true;
      const packetEl = document.getElementById(`packet-${packet.id}`);
      const brainEl = document.querySelector('.sales-stock-display');
      const targetEl = document.getElementById(`card-${targetId}`);
      const layerEl = document.getElementById('packet-layer');

      if (!packetEl || !brainEl || !targetEl || !layerEl) {
        packet.active = false;
        return;
      }

      const layerRect = layerEl.getBoundingClientRect();
      const brainRect = brainEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const startX = brainRect.left - layerRect.left + brainRect.width / 2;
      const startY = brainRect.top - layerRect.top + brainRect.height / 2;
      const endX = targetRect.left - layerRect.left + targetRect.width / 2;
      const endY = targetRect.top - layerRect.top + targetRect.height / 2;

      const ch = this.channels.find(c => c.id === targetId);

      gsap.set(packetEl, { x: startX, y: startY, opacity: 1, scale: 1, backgroundColor: '#60a5fa' });
      
      const tl = gsap.timeline({
        onComplete: () => {
          packet.active = false;
          gsap.set(packetEl, { opacity: 0 });
        }
      });

      if (ch.apiFailing) {
        // Fail sequence
        tl.to(packetEl, {
          x: (startX + endX) / 2,
          y: (startY + endY) / 2,
          duration: 0.4,
          ease: "power2.out"
        })
        .to(packetEl, {
          scale: 3,
          opacity: 0,
          backgroundColor: "#f43f5e",
          duration: 0.3
        });
        this.addLog(`Sync Failed for ${ch.name} (Timeout). Retrying in 2s...`);
      } else {
        tl.to(packetEl, {
          x: endX,
          y: endY,
          duration: 0.8,
          ease: "power2.inOut"
        })
        .to(packetEl, {
          scale: 2,
          opacity: 0,
          duration: 0.2
        });
      }
    },
    animateBOMLine(targetId) {
      const svg = document.getElementById('bom-svg');
      const targetEl = document.getElementById(`card-${targetId}`);
      const tankEl = document.querySelector('.physical-tank-main');
      const layerEl = document.getElementById('packet-layer');

      if (!svg || !targetEl || !tankEl || !layerEl) return;

      const layerRect = layerEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const tankRect = tankEl.getBoundingClientRect();

      const x1 = targetRect.left - layerRect.left + targetRect.width / 2;
      const y1 = targetRect.top - layerRect.top + targetRect.height / 2;
      const x2 = tankRect.left - layerRect.left + tankRect.width / 2;
      const y2 = tankRect.top - layerRect.top + tankRect.height / 2;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
      path.setAttribute("stroke", "#818cf8");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-dasharray", "10,5");
      path.setAttribute("fill", "none");
      path.style.filter = "drop-shadow(0 0 5px #818cf8)";
      
      svg.appendChild(path);

      gsap.fromTo(path, 
        { strokeDashoffset: 50, opacity: 0 }, 
        { strokeDashoffset: 0, opacity: 1, duration: 0.3, ease: "power1.out" }
      );

      gsap.to(path, {
        opacity: 0,
        duration: 0.5,
        delay: 0.5,
        onComplete: () => path.remove()
      });
    },
    async performMasterSync() {
      if (this.isSyncing) return;
      this.isSyncing = true;
      
      this.channels.forEach(ch => {
        if (!ch.isManual && !ch.apiFailing) {
           // Visual pulse on cards during sync
           gsap.to(`#card-${ch.id}`, { scale: 1.02, yoyo: true, repeat: 1, duration: 0.1 });
        }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.channels.forEach(ch => {
        if (!ch.isManual && !ch.apiFailing) {
          ch.internal = ch.ideal;
        }
      });
      
      this.isSyncing = false;
      this.addLog("Master Sync Complete: All healthy channels reconciled to Ideal Stock.");
    }
  },
  mounted() {
    // Initialize Packet Pool
    for (let i = 0; i < 10; i++) {
      this.packetPool.push({ id: i, active: false });
    }
    
    this.addLog("Inventory Engine Initialized. Monitoring physical stock [1,000 units].");
    this.updateIdeals();
  }
};
</script>



--- FILE: src/components/ChannelCard.vue ---
<template>
  <div 
    class="glass-card p-5 relative transition-all duration-300"
    :class="[
      channel.isManual ? 'bg-amber-900/20 border-amber-500/50' : '',
      apiFailing ? 'bg-red-900/20 border-red-500/50' : ''
    ]"
  >
    <!-- Desync Warning -->
    <div v-if="isDesynced" class="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce uppercase">
      Desync Warning
    </div>

    <!-- Card Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="font-bold text-xl text-white">{{ channel.name }}</h3>
        <button 
          @click="$emit('toggle-manual', channel.id)"
          class="flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider transition-colors"
          :class="channel.isManual ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'"
        >
          <template v-if="channel.isManual">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            Manual Lock Active
          </template>
          <template v-else>
            <svg class="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
            Unlock Global Sync
          </template>
        </button>
      </div>
      <div class="text-right">
        <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Stock Drift</p>
        <div 
          class="text-xl font-mono font-bold"
          :class="driftSeverityClass"
        >
          {{ driftPercent }}%
        </div>
        <!-- Ghost Preview Delta -->
        <div v-if="channel.ghostValue !== null" class="text-[10px] text-blue-400 italic mt-1 font-bold">
          Target: {{ Math.floor(channel.ghostValue / skuFactor) }}
          <span :class="ghostDelta >= 0 ? 'text-sync-pulse' : 'text-drift-alert'">
            ({{ ghostDelta >= 0 ? '+' : '' }}{{ ghostDelta }})
          </span>
        </div>
      </div>
    </div>

    <!-- Stock Metrics Container -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
        <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">Ideal ({{ unitLabel }})</p>
        <p class="text-2xl font-black text-blue-400 font-mono">{{ displayIdeal }}</p>
      </div>
      <div 
        class="p-3 rounded-lg border transition-all"
        :class="[
          driftSeverity > 5 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900/50 border-slate-700/50',
          isOverCapacity ? 'border-red-500 ring-1 ring-red-500' : ''
        ]"
      >
        <div class="flex justify-between items-center mb-1">
          <p class="text-[10px] text-slate-500 uppercase font-bold">Marketplace ({{ unitLabel }})</p>
          <span v-if="isOverCapacity" class="text-[8px] text-red-500 font-black animate-pulse">EXCEEDS PHYSICAL</span>
        </div>
        <input 
          v-if="channel.isManual"
          type="number"
          :value="displayInternal"
          @input="$emit('manual-stock-change', { id: channel.id, value: Math.max(0, parseInt($event.target.value) || 0) * skuFactor })"
          class="bg-transparent text-2xl font-black font-mono w-full text-amber-400 outline-none"
        >
        <p v-else class="text-2xl font-black font-mono" :class="driftSeverity > 5 ? 'text-red-400' : 'text-slate-100'">
          {{ displayInternal }}
        </p>
      </div>
    </div>

    <!-- Controls -->
    <div class="space-y-4">
      <!-- Weight Slider -->
      <div class="space-y-1" :class="{ 'opacity-30 grayscale cursor-not-allowed': !isSlidersActive }">
        <div class="flex justify-between text-[11px] font-bold text-slate-400">
          <span>WEIGHT DISTRIBUTION</span>
          <span class="text-blue-400">{{ channel.weight.toFixed(1) }}%</span>
        </div>
        <input 
          type="range" 
          :value="channel.weight"
          :disabled="!isSlidersActive"
          min="0" 
          max="100"
          step="0.1"
          @input="$emit('weight-change', { id: channel.id, value: $event.target.value })"
          class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        >
        <p v-if="!isSlidersActive" class="text-[9px] text-slate-600 italic font-medium">Locked: System-calculated strategy in effect</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button 
          @click="$emit('trigger-order', channel.id)"
          class="flex-grow bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-widest transition-all active:scale-95"
        >
          Sell unit
        </button>
        <button 
          @click="toggleApiFailure"
          class="px-3 py-2 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-tighter"
          :class="apiFailing ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'"
        >
          {{ apiFailing ? 'Fix API' : 'Simulate API Fail' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    channel: {
      type: Object,
      required: true
    },
    salesStock: {
      type: Number,
      required: true
    },
    skuFactor: {
      type: Number,
      default: 1
    },
    isSlidersActive: {
      type: Boolean,
      default: true
    },
    pctThreshold: {
      type: Number,
      default: 5
    },
    absThreshold: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      apiFailing: false,
      isDesynced: false
    };
  },
  computed: {
    displayIdeal() {
      return Math.floor(this.channel.ideal / this.skuFactor);
    },
    displayInternal() {
      // If manual, they might be typing, so we handle the displayed value carefully
      return Math.floor(this.channel.internal / this.skuFactor);
    },
    isOverCapacity() {
      // BOM Hardening: Physical After as absolute truth
      // A channel's singles cannot exceed the available singles in the tank
      return this.channel.internal > this.salesStock;
    },
    driftSeverity() {
      return Math.abs(this.displayIdeal - this.displayInternal);
    },
    driftPercent() {
      if (this.displayIdeal === 0) return 0;
      return Math.round((this.driftSeverity / this.displayIdeal) * 100);
    },
    ghostDelta() {
      if (this.channel.ghostValue === null) return 0;
      const displayGhost = Math.floor(this.channel.ghostValue / this.skuFactor);
      return displayGhost - this.displayIdeal;
    },
    unitLabel() {
      if (this.skuFactor === 1) return 'Units';
      if (this.skuFactor === 6) return 'Pack-of-6';
      if (this.skuFactor === 12) return 'Pack-of-12';
      return 'Sets';
    },
    driftSeverityClass() {
      const pct = this.driftPercent;
      const abs = this.driftSeverity;
      // Hardening logic: Uses user-defined thresholds
      if (pct > this.pctThreshold || abs >= this.absThreshold) return 'text-drift-alert animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]';
      if (pct > 0) return 'text-amber-400';
      return 'text-sync-pulse';
    }
  },
  methods: {
    toggleApiFailure() {
      this.apiFailing = !this.apiFailing;
      this.$emit('api-status-change', { id: this.channel.id, status: this.apiFailing });
    }
  }
};
</script>



--- FILE: src/assets/main.css ---
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --brand-gradient: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #f1f5f9;
}

.glass-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.system-in-flight {
  pointer-events: none;
}

.system-in-flight-overlay {
  backdrop-filter: blur(4px);
  transition: all 0.5s ease;
}

/* Custom Slider Styles */
input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
}

input[type=range]:focus {
  outline: none;
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #334155;
  border-radius: 3px;
}

input[type=range]::-webkit-slider-thumb {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #60a5fa;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -6px;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}

/* Rolling Numbers */
.rolling-number {
  font-variant-numeric: tabular-nums;
  display: inline-block;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}



