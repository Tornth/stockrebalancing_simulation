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
          Stock <span class="text-blue-400">Rebalancing Engine</span>
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
            <!-- Reserved Zone (above buffer) -->
            <div 
              v-if="reservedStock > 0"
              class="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-amber-500/70 bg-amber-500/20 transition-all duration-300"
              :style="{ height: ((effectiveBuffer + reservedStock) / 10) + '%' }"
            >
              <span class="absolute -top-6 left-2 text-xs text-amber-400 font-mono">RESERVED ({{ reservedStock }})</span>
            </div>
            <!-- Buffer Zone -->
            <div 
              class="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-drift-alert/50 bg-drift-alert/5"
              :style="{ height: (effectiveBuffer / 10) + '%' }"
            >
              <span class="absolute -top-6 right-2 text-xs text-drift-alert font-mono">BUFFER ({{ effectiveBuffer }})</span>
            </div>
            
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-5xl font-black text-white rolling-number">{{ Math.round(displayPhysicalStock) }}</span>
              <span class="text-xs uppercase tracking-widest text-slate-400">Physical Units</span>
            </div>
          </div>

          <!-- Stock Breakdown -->
          <div class="space-y-3">
            <!-- Sales Stock -->
            <div class="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div class="sales-stock-display">
                <p class="text-xs text-slate-400 uppercase font-bold tracking-tight">Sales Stock (Available)</p>
                <p class="text-3xl font-black text-blue-400">{{ salesStock }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-400 uppercase font-bold tracking-tight">Buffer</p>
                <p class="text-2xl font-black text-drift-alert">{{ effectiveBuffer }}</p>
                <p v-if="effectiveBuffer < bufferStock" class="text-[9px] text-amber-500 italic">Capped (was {{ bufferStock }})</p>
              </div>
            </div>
            
            <!-- Reserved Stock + Ship All -->
            <div 
              class="flex justify-between items-center p-4 rounded-xl border transition-all"
              :class="reservedStock > 0 ? 'bg-amber-900/30 border-amber-500/50' : 'bg-slate-800/30 border-slate-700/50'"
            >
              <div>
                <p class="text-xs text-amber-400 uppercase font-bold tracking-tight flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="reservedStock > 0 ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'"></span>
                  Reserved (Pending RTS)
                </p>
                <p class="text-2xl font-black" :class="reservedStock > 0 ? 'text-amber-400' : 'text-slate-600'">
                  {{ reservedStock }}
                </p>
              </div>
              <button 
                @click="shipAll"
                :disabled="reservedStock === 0"
                class="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                :class="reservedStock > 0 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'"
              >
                Ship All ({{ reservedStock }})
              </button>
            </div>
            
            <!-- Stock Adjustment -->
            <div class="p-4 bg-slate-900/50 rounded-xl border border-slate-600">
              <p class="text-xs text-slate-400 uppercase font-bold tracking-tight mb-3 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                Admin Stock Adjustment
              </p>
              <div class="flex gap-2 items-center">
                <input 
                  v-model.number="stockAdjustmentInput"
                  type="number"
                  placeholder="New stock..."
                  class="flex-grow bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                >
                <button 
                  @click="adjustStock(stockAdjustmentInput)"
                  :disabled="!stockAdjustmentInput || stockAdjustmentInput < 0"
                  class="px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
                  :class="stockAdjustmentInput && stockAdjustmentInput >= 0 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'"
                >
                  Apply
                </button>
              </div>
              <div class="flex gap-2 mt-2">
                <button 
                  @click="adjustStock(physicalStock + 100)"
                  class="flex-1 px-2 py-1.5 rounded bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 text-[10px] font-bold hover:bg-emerald-800/50 transition-all"
                >
                  +100
                </button>
                <button 
                  @click="adjustStock(physicalStock + 500)"
                  class="flex-1 px-2 py-1.5 rounded bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 text-[10px] font-bold hover:bg-emerald-800/50 transition-all"
                >
                  +500
                </button>
                <button 
                  @click="adjustStock(Math.max(0, physicalStock - 100))"
                  class="flex-1 px-2 py-1.5 rounded bg-red-900/50 border border-red-700/50 text-red-400 text-[10px] font-bold hover:bg-red-800/50 transition-all"
                >
                  -100
                </button>
                <button 
                  @click="adjustStock(1000)"
                  class="flex-1 px-2 py-1.5 rounded bg-slate-700/50 border border-slate-600/50 text-slate-400 text-[10px] font-bold hover:bg-slate-600/50 transition-all"
                >
                  Reset
                </button>
              </div>
              <p v-if="stockAdjustmentInput && stockAdjustmentInput !== physicalStock" class="text-[10px] text-blue-400 mt-2 font-mono">
                Preview: Buffer will become {{ Math.ceil(stockAdjustmentInput * (bufferPercent / 100)) }} ({{ bufferPercent }}% of {{ stockAdjustmentInput }})
              </p>
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
      bufferStock: 50, // Fixed buffer: recalculates only on slider change or admin adjustment
      reservedStock: 0, // Units held for pending orders (waiting for RTS)
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
      packetPool: [],
      stockAdjustmentInput: null
    };
  },
  computed: {
    activeSku() {
      return this.skuTypes.find(s => s.id === this.selectedSku);
    },
    // Effective buffer: capped at physical stock for safety (Option B)
    effectiveBuffer() {
      return Math.min(this.bufferStock, this.physicalStock);
    },
    salesStock() {
      // Formula: Physical - Buffer - Reserved
      return Math.max(0, this.physicalStock - this.effectiveBuffer - this.reservedStock);
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
    bufferPercent: {
      handler(newVal) {
        // Recalculate fixed buffer when slider changes
        this.bufferStock = Math.ceil(this.physicalStock * (newVal / 100));
        this.addLog(`Buffer recalculated: ${this.bufferStock} units (${newVal}% of ${this.physicalStock})`);
      }
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
    adjustStock(newStock) {
      if (newStock === null || newStock === undefined || newStock < 0) return;
      
      const oldStock = this.physicalStock;
      const diff = newStock - oldStock;
      const direction = diff > 0 ? 'RECEIVING' : diff < 0 ? 'ADJUSTMENT' : 'NO CHANGE';
      
      if (diff === 0) {
        this.addLog(`Stock adjustment: No change (already at ${newStock})`);
        this.stockAdjustmentInput = null;
        return;
      }
      
      // Update physical stock
      this.physicalStock = newStock;
      
      // Always recalculate buffer on admin adjustment
      const oldBuffer = this.bufferStock;
      this.bufferStock = Math.ceil(newStock * (this.bufferPercent / 100));
      
      this.addLog(`ADMIN ${direction}: Physical ${oldStock} → ${newStock} (${diff > 0 ? '+' : ''}${diff}). Buffer: ${oldBuffer} → ${this.bufferStock}`);
      
      // Clear input
      this.stockAdjustmentInput = null;
      
      // Trigger sync to update ideals
      this.performMasterSync();
    },
    updateIdeals() {
      const strategy = this.previewStrategy || this.selectedStrategy;
      
      if (strategy === 'mirror') {
        // Mirror: All channels get full salesStock
        this.channels.forEach(ch => {
          ch.ideal = this.salesStock;
          ch.ghostValue = this.previewStrategy ? this.salesStock : null;
        });
        return;
      }
      
      // Calculate base ideals (use floor for safe under-allocation)
      let totalAllocated = 0;
      this.channels.forEach(ch => {
        let baseIdeal = 0;
        if (strategy === 'weighted') {
          baseIdeal = Math.floor(this.salesStock * (ch.weight / 100));
        } else if (strategy === 'equal') {
          baseIdeal = Math.floor(this.salesStock / this.channels.length);
        }
        ch.ideal = baseIdeal;
        totalAllocated += baseIdeal;
        
        // Ghost value for preview
        ch.ghostValue = this.previewStrategy ? baseIdeal : null;
      });

      // Remainder Capture: Distribute remaining units proportionally
      let remainder = this.salesStock - totalAllocated;
      if (remainder > 0 && this.salesStock > 0) {
        // Sort by weight descending for weighted, or alphabetically for equal
        const sortedChannels = [...this.channels].sort((a, b) => {
          if (strategy === 'weighted') return b.weight - a.weight;
          return a.id.localeCompare(b.id);
        });
        
        // Distribute remainder one unit at a time to highest priority channels
        let i = 0;
        while (remainder > 0) {
          sortedChannels[i % sortedChannels.length].ideal += 1;
          if (this.previewStrategy) {
            sortedChannels[i % sortedChannels.length].ghostValue += 1;
          }
          remainder--;
          i++;
        }
      }
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
      
      // Check if enough available stock (physical - buffer - reserved)
      if (this.salesStock < factor) {
        this.addLog(`ERROR: No available stock! Sales Stock: ${this.salesStock}, Required: ${factor}`);
        return;
      }

      // Stage 1: Reserve units (don't touch physical yet)
      this.reservedStock += factor;
      this.addLog(`ORDER_IN: ${this.activeSku.name} sale on ${channel.name}. Reserved: +${factor} → Total Reserved: ${this.reservedStock}`);
      gsap.to(".physical-tank-main", { x: 5, yoyo: true, repeat: 3, duration: 0.05 });

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
      // We check raw SINGLES because drift in sets is just a derivative of single-unit movement.
      let syncRequired = false;
      let triggerReason = "";

      for (const ch of this.channels) {
        if (ch.isManual) continue;

        // Use raw singles for logic consistency
        const absDrift = Math.abs(ch.ideal - ch.internal);
        const pctDrift = ch.ideal > 0 ? (absDrift / ch.ideal) : 0;

        if (pctDrift > (this.pctThreshold / 100) || absDrift >= this.absThreshold) {
          syncRequired = true;
          triggerReason = `${ch.name} singles drift (${absDrift}u / ${Math.round(pctDrift * 100)}%) exceeded ${this.pctThreshold}% / ${this.absThreshold}u gatekeeper.`;
          break; 
        }
      }
      
      if (syncRequired) {
        this.addLog(`Sync Triggered: ${triggerReason}`);
        this.performMasterSync();
      } else {
        this.addLog(`Drift Ignored: Overall Singles drift is within safe bounds.`);
      }
    },
    async shipAll() {
      if (this.reservedStock === 0) {
        this.addLog(`No pending orders to ship.`);
        return;
      }
      
      const toShip = this.reservedStock;
      
      // Safety check: can't ship more than physical stock
      if (toShip > this.physicalStock) {
        this.addLog(`ERROR: Cannot ship ${toShip} units. Only ${this.physicalStock} physical units available!`);
        return;
      }
      
      this.isSyncing = true;
      this.addLog(`READY TO SHIP: Processing ${toShip} units...`);
      
      // Visual pulse
      gsap.to(".physical-tank-main", { scale: 0.98, yoyo: true, repeat: 1, duration: 0.2 });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fulfill orders: Physical decreases, Reserved clears
      this.physicalStock -= toShip;
      this.reservedStock = 0;
      
      this.isSyncing = false;
      this.addLog(`SHIPPED: ${toShip} units left warehouse. Physical: ${this.physicalStock}, Reserved: ${this.reservedStock}`);
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
    
    // Calculate ideals and sync internals on load
    this.updateIdeals();
    this.channels.forEach(ch => {
      ch.internal = ch.ideal;
    });
    
    this.addLog("Inventory Engine Initialized. Monitoring physical stock [1,000 units].");
  }
};
</script>
