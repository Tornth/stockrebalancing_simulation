<template>
  <div id="app" class="min-h-screen p-8 pb-16 relative font-thai" :class="{ 'system-in-flight': isSyncing }">
    <!-- In-Flight Overlay -->
    <div v-if="isSyncing" class="fixed inset-0 z-50 system-in-flight-overlay flex items-center justify-center">
      <div class="glass-card p-8 flex flex-col items-center">
        <div class="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-6"></div>
        <p class="text-3xl font-bold text-brand-blue mb-2">กำลัง Sync สต็อก...</p>
        <p class="text-lg text-gray-500">ระบบกำลังปรับ Sales Stock ให้ตรงตามเป้าหมาย</p>
      </div>
    </div>

    <!-- Header -->
    <header class="mb-8 flex justify-between items-end border-b border-gray-200 pb-6">
      <div>
        <h1 class="text-4xl font-extrabold tracking-tight text-brand-text mb-2">
          Rebalancing<span class="text-brand-blue">Simulator</span>
        </h1>
        <div class="flex gap-4 items-center">
          <div class="bg-gray-100 p-1 rounded-lg flex gap-1 border border-gray-200">
            <button 
              v-for="s in ['weighted', 'equal', 'mirror']" :key="s"
              @click="setPreviewStrategy(s)"
              class="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all"
              :class="[
                selectedStrategy === s ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-500 hover:text-brand-text',
                previewStrategy === s ? 'ring-2 ring-brand-blue ring-offset-2 ring-offset-white bg-blue-50' : ''
              ]"
            >
              {{ s }}
            </button>
          </div>
          <span class="text-xs text-gray-500 font-medium">Distribution Strategy</span>
        </div>
      </div>

      <div class="flex flex-col items-end gap-3">
        <div class="flex gap-2">
          <button 
            v-for="sku in skuTypes" :key="sku.id"
            @click="selectedSku = sku.id"
            class="px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all"
            :class="selectedSku === sku.id ? 'bg-brand-blue border-brand-blue text-white shadow-lg' : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'"
          >
            {{ sku.name }}
          </button>
        </div>
        
        <div class="flex gap-4">
          <button 
            @click="showTuning = !showTuning"
            class="px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all"
            :class="showTuning ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-200/40' : 'bg-white border-gray-300 text-gray-500'"
          >
            Engine Tuning
          </button>
          
<div v-if="previewStrategy" class="flex items-center gap-3 animate-pulse">
             <span class="text-[10px] font-black text-brand-blue uppercase tracking-tighter">Unsaved Strategy Draft</span>
             <button 
               @click="applyStrategy"
               class="px-6 py-2 bg-sync-pulse hover:bg-emerald-400 text-white font-black text-xs uppercase rounded-lg shadow-lg transition-all"
             >
               Confirm Master Sync
             </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Tuning Panel -->
    <transition name="slide-fade">
      <div v-if="showTuning" class="mb-8 glass-card border-amber-300 p-6 grid grid-cols-4 gap-6">
        <div class="space-y-4">
          <h3 class="text-xs font-black text-amber-600 uppercase flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            Safety Guardrails
          </h3>
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-mono">
              <span class="text-gray-500">Insurance Buffer</span>
              <span class="text-amber-600 font-bold">{{ bufferPercent }}%</span>
            </div>
            <input type="range" v-model.number="bufferPercent" min="0" max="30" step="1" class="w-full accent-amber-500">
          </div>
          <p class="text-[9px] text-gray-400 italic">Reduces total physical stock listed across all channels.</p>
        </div>

        <div class="space-y-4">
          <h3 class="text-xs font-black text-brand-blue uppercase flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-brand-blue rounded-full"></span>
            Sync Sensitivity (Rel)
          </h3>
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-mono">
              <span class="text-gray-500">Drift Threshold</span>
              <span class="text-brand-blue font-bold">{{ pctThreshold }}%</span>
            </div>
            <input type="range" v-model.number="pctThreshold" min="1" max="45" step="1" class="w-full accent-blue-500">
          </div>
          <p class="text-[9px] text-gray-400 italic">Percentage difference before triggering a global sync.</p>
        </div>

        <div class="space-y-4">
          <h3 class="text-xs font-black text-pink-500 uppercase flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="absThresholdEnabled" class="w-4 h-4 accent-pink-500 rounded">
              <span class="w-1.5 h-1.5 bg-pink-500 rounded-full" :class="{ 'opacity-30': !absThresholdEnabled }"></span>
              <span :class="{ 'opacity-50': !absThresholdEnabled }">Sync Sensitivity (Abs)</span>
            </label>
          </h3>
          <div class="space-y-1" :class="{ 'opacity-30': !absThresholdEnabled }">
            <div class="flex justify-between text-[11px] font-mono">
              <span class="text-gray-500">Absolute Gap</span>
              <span class="text-pink-500 font-bold">{{ absThreshold }} units</span>
            </div>
            <input type="range" v-model.number="absThreshold" min="1" max="10" step="1" class="w-full accent-pink-500" :disabled="!absThresholdEnabled" :style="{ filter: absThresholdEnabled ? 'none' : 'grayscale(100%)' }">
          </div>
          <p class="text-[9px] text-gray-400 italic" :class="{ 'opacity-30': !absThresholdEnabled }">Unit difference threshold for instant reconciliation.</p>
        </div>

        <!-- Cutoff Mode -->
        <div class="space-y-4">
          <h3 class="text-xs font-black text-emerald-600 uppercase flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="cutoffEnabled" class="w-4 h-4 accent-emerald-500 rounded">
              <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full" :class="{ 'opacity-30': !cutoffEnabled }"></span>
              <span :class="{ 'opacity-50': !cutoffEnabled }">Low Stock Cutoff</span>
            </label>
          </h3>
          <div class="space-y-2" :class="{ 'opacity-30': !cutoffEnabled }">
            <div class="flex justify-between text-[11px] font-mono">
              <span class="text-gray-500">Cutoff Threshold</span>
              <span class="text-emerald-600 font-bold">{{ cutoffThreshold }} units</span>
            </div>
            <input type="range" v-model.number="cutoffThreshold" min="5" max="100" step="5" class="w-full accent-emerald-500" :disabled="!cutoffEnabled" :style="{ filter: cutoffEnabled ? 'none' : 'grayscale(100%)' }">
            <div class="flex justify-between text-[11px] font-mono mt-2">
              <span class="text-gray-500">Priority Channel</span>
            </div>
            <select v-model="cutoffPriorityChannel" class="w-full text-xs bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-emerald-600 font-bold focus:border-emerald-500 focus:outline-none" :disabled="!cutoffEnabled">
              <option v-for="ch in channels" :key="ch.id" :value="ch.id">{{ ch.name }}</option>
            </select>
          </div>
          <p class="text-[9px] text-gray-400 italic" :class="{ 'opacity-30': !cutoffEnabled }">When stock falls below threshold, consolidate to one channel.</p>
        </div>
      </div>
    </transition>

    <!-- Guide/Explainer Section (moved from footer) -->
    <div class="mb-6 glass-card p-4 overflow-hidden">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm font-bold text-brand-text flex items-center gap-2">
          <span class="text-lg">📋</span>
          คำอธิบายการทำงาน
        </h3>
        <span class="text-[10px] font-mono text-gray-400">Live Log</span>
      </div>
      <div class="h-20 overflow-y-auto text-sm space-y-1" ref="logContainer">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          class="flex gap-2"
          :class="getLogClass(log.type)"
        >
          <span class="text-gray-400 flex-shrink-0">[{{ log.time }}]</span>
          <span>{{ log.message }}</span>
        </div>
      </div>
    </div>


    <main class="grid grid-cols-12 gap-8 relative">
      <!-- Data Packet Layer (spans entire main grid) -->
      <div class="absolute inset-0 pointer-events-none z-10 overflow-visible" id="packet-layer">
        <div 
          v-for="p in packetPool" 
          :key="p.id" 
          :id="'packet-' + p.id"
          class="absolute w-12 h-12 bg-brand-blue rounded-full shadow-[0_0_20px_rgba(0,136,255,0.7)] opacity-0 flex items-center justify-center"
        >
          <span class="text-white font-bold text-lg"></span>
        </div>
      </div>

      <!-- Left Panel: The Brain -->
      <section class="col-span-4 flex flex-col gap-8">
        <div class="glass-card p-6 h-full">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-brand-text">
            <span class="w-2 h-2 bg-brand-blue rounded-full animate-pulse"></span>
            Inventory "Brain"
          </h2>
          
          <!-- Physical Tank Visualization -->
          <div class="relative h-64 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden mb-8 physical-tank-main">
            <div 
              class="absolute bottom-0 left-0 right-0 bg-brand-blue/20 transition-all duration-500"
              :style="{ height: (physicalStock / 10) + '%' }"
            >
              <div class="absolute top-0 left-0 right-0 h-1 bg-brand-blue shadow-[0_0_10px_rgba(0,136,255,0.5)]"></div>
            </div>
            <!-- Reserved Zone (above buffer) -->
            <div 
              v-if="reservedStock > 0"
              class="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-amber-500/70 bg-amber-500/20 transition-all duration-300"
              :style="{ height: ((effectiveBuffer + reservedStock) / 10) + '%' }"
            >
              <span class="absolute -top-6 left-2 text-xs text-amber-600 font-mono">RESERVED ({{ reservedStock }})</span>
            </div>
            <!-- Buffer Zone -->
            <div 
              class="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-drift-alert/50 bg-drift-alert/10"
              :style="{ height: (effectiveBuffer / 10) + '%' }"
            >
              <span class="absolute -top-6 right-2 text-xs text-drift-alert font-mono">BUFFER ({{ effectiveBuffer }})</span>
            </div>
            
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-5xl font-black text-brand-text rolling-number">{{ Math.round(displayPhysicalStock) }}</span>
              <span class="text-xs uppercase tracking-widest text-gray-500">Physical Units</span>
            </div>
          </div>

          <!-- Stock Breakdown -->
          <div class="space-y-3">
            <!-- Sales Stock -->
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div class="sales-stock-display">
                <p class="text-xs text-gray-500 uppercase font-bold tracking-tight">Sales Stock (Available)</p>
                <p class="text-3xl font-black text-brand-blue">{{ salesStock }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500 uppercase font-bold tracking-tight">Buffer</p>
                <p class="text-2xl font-black text-drift-alert">{{ effectiveBuffer }}</p>
                <p v-if="effectiveBuffer < bufferStock" class="text-[9px] text-amber-500 italic">Capped (was {{ bufferStock }})</p>
              </div>
            </div>
            
            <!-- Reserved Stock + Ship All -->
            <div 
              class="reserved-stock-display flex justify-between items-center p-4 rounded-xl border transition-all"
              :class="reservedStock > 0 ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'"
            >
              <div>
                <p class="text-xs text-amber-600 uppercase font-bold tracking-tight flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="reservedStock > 0 ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'"></span>
                  Reserved (Pending RTS)
                </p>
                <p class="text-2xl font-black" :class="reservedStock > 0 ? 'text-amber-600' : 'text-gray-400'">
                  {{ reservedStock }}
                </p>
              </div>
              <button 
                @click="shipAll"
                :disabled="reservedStock === 0"
                class="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                :class="reservedStock > 0 
                  ? 'bg-sync-pulse hover:bg-emerald-400 text-white shadow-lg shadow-emerald-200/50' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              >
                Ship All ({{ reservedStock }})
              </button>
            </div>
            
            <!-- Stock Adjustment -->
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-300">
              <p class="text-xs text-gray-500 uppercase font-bold tracking-tight mb-3 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                Admin Stock Adjustment
              </p>
              <div class="flex gap-2 items-center">
                <input 
                  v-model.number="stockAdjustmentInput"
                  type="number"
                  placeholder="New stock..."
                  class="flex-grow bg-white border border-gray-300 rounded-lg px-3 py-2 text-brand-text font-mono text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                >
                <button 
                  @click="adjustStock(stockAdjustmentInput)"
                  :disabled="!stockAdjustmentInput || stockAdjustmentInput < 0"
                  class="px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
                  :class="stockAdjustmentInput && stockAdjustmentInput >= 0 
                    ? 'bg-brand-blue hover:bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                >
                  Apply
                </button>
              </div>
              <div class="flex gap-2 mt-2">
                <button 
                  @click="adjustStock(physicalStock + 100)"
                  class="flex-1 px-2 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold hover:bg-emerald-100 transition-all"
                >
                  +100
                </button>
                <button 
                  @click="adjustStock(physicalStock + 500)"
                  class="flex-1 px-2 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold hover:bg-emerald-100 transition-all"
                >
                  +500
                </button>
                <button 
                  @click="adjustStock(Math.max(0, physicalStock - 100))"
                  class="flex-1 px-2 py-1.5 rounded bg-red-50 border border-red-200 text-red-500 text-[10px] font-bold hover:bg-red-100 transition-all"
                >
                  -100
                </button>
                <button 
                  @click="adjustStock(1000)"
                  class="flex-1 px-2 py-1.5 rounded bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-bold hover:bg-gray-200 transition-all"
                >
                  Reset
                </button>
              </div>
              <p v-if="stockAdjustmentInput && stockAdjustmentInput !== physicalStock" class="text-[10px] text-brand-blue mt-2 font-mono">
                Preview: Buffer will become {{ Math.ceil(stockAdjustmentInput * (bufferPercent / 100)) }} ({{ bufferPercent }}% of {{ stockAdjustmentInput }})
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Panel: Channels -->
      <section class="col-span-8">
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
  </div>
</template>

<script>
import ChannelCard from './components/ChannelCard.vue';
import { gsap } from 'gsap';

export default {
  components: { ChannelCard },
  data() {
    return {
      physicalStock: 100,
      displayPhysicalStock: 100,
      bufferPercent: 5,
      bufferStock: 5, // Fixed buffer: recalculates only on slider change or admin adjustment
      reservedStock: 0, // Units held for pending orders (waiting for RTS)
      pctThreshold: 15,
      absThreshold: 2,
      absThresholdEnabled: false,
      cutoffEnabled: true,
      cutoffThreshold: 20,
      cutoffPriorityChannel: 'shopee',
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
        this.addLog(`คำนวณ Buffer ใหม่: ${this.bufferStock} หน่วย (${newVal}% ของ ${this.physicalStock})`);
      }
    },
    salesStock: {
      handler() {
        this.updateIdeals();
      }
    }
  },
  methods: {
    addLog(message, type = 'info') {
      const now = new Date();
      const time = now.toTimeString().split(' ')[0];
      this.logs.unshift({ time, message, type });
      if (this.logs.length > 50) this.logs.pop();
    },
    getLogClass(type) {
      switch (type) {
        case 'success': return 'text-sync-pulse';
        case 'warning': return 'text-amber-500';
        case 'hint': return 'text-gray-500 italic';
        case 'info':
        default: return 'text-brand-blue';
      }
    },
    adjustStock(newStock) {
      if (newStock === null || newStock === undefined || newStock < 0) return;
      
      const oldStock = this.physicalStock;
      const diff = newStock - oldStock;
      const direction = diff > 0 ? 'รับสินค้าเข้า' : diff < 0 ? 'ปรับลดสต็อก' : 'ไม่เปลี่ยนแปลง';
      
      if (diff === 0) {
        this.addLog(`ปรับสต็อก: ไม่มีการเปลี่ยนแปลง (อยู่ที่ ${newStock} อยู่แล้ว)`);
        this.stockAdjustmentInput = null;
        return;
      }
      
      // Update physical stock
      this.physicalStock = newStock;
      
      // Always recalculate buffer on admin adjustment
      const oldBuffer = this.bufferStock;
      this.bufferStock = Math.ceil(newStock * (this.bufferPercent / 100));
      
      this.addLog(`แอดมินปรับสต็อก (${direction}): Physical Stock ${oldStock} → ${newStock} (${diff > 0 ? '+' : ''}${diff}). Buffer: ${oldBuffer} → ${this.bufferStock}`);
      
      // Clear input
      this.stockAdjustmentInput = null;
      
      // IMPORTANT: Force recalculate ideals BEFORE syncing
      // (Watcher is async, but we need ideals updated now)
      this.updateIdeals();
      
      // Trigger sync to update channel internals to new ideals
      this.performMasterSync();
    },
    updateIdeals() {
      const strategy = this.previewStrategy || this.selectedStrategy;
      
      // CUTOFF MODE: When enabled and stock is below threshold, consolidate all to priority channel
      const inCutoffMode = this.cutoffEnabled && this.salesStock > 0 && this.salesStock <= this.cutoffThreshold;
      if (inCutoffMode) {
        const priorityChannel = this.channels.find(ch => ch.id === this.cutoffPriorityChannel);
        const wasInCutoffMode = this._wasInCutoffMode;
        this._wasInCutoffMode = true;
        
        this.channels.forEach(ch => {
          if (ch.id === this.cutoffPriorityChannel) {
            ch.ideal = this.salesStock;
            ch.ghostValue = this.previewStrategy ? this.salesStock : null;
          } else {
            ch.ideal = 0;
            ch.ghostValue = this.previewStrategy ? 0 : null;
          }
        });
        
        // Only log once when entering cutoff mode
        if (!wasInCutoffMode) {
          this.addLog(`โหมด Cutoff: สต็อกต่ำ (${this.salesStock} ≤ ${this.cutoffThreshold}) รวมสต็อกทั้งหมดไว้ที่ ${priorityChannel?.name || 'Unknown'}`, 'warning');
        }
        return;
      } else {
        this._wasInCutoffMode = false;
      }
      
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
      this.addLog(`ดูตัวอย่าง: กำลังแสดงผลกลยุทธ์ '${strategy.toUpperCase()}'`);
    },
    async applyStrategy() {
      if (!this.previewStrategy) return;
      this.isSyncing = true;
      this.addLog(`กำลังใช้กลยุทธ์ '${this.previewStrategy.toUpperCase()}' ทั้งระบบ...`);
      
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
      this.addLog(`${ch.name}: ${ch.isManual ? 'เปิดโหมดควบคุมเอง' : 'กลับสู่การซิงค์อัตโนมัติ'}`);
    },
    handleApiStatus({ id, status }) {
      const ch = this.channels.find(c => c.id === id);
      ch.apiFailing = status;
      this.addLog(`${ch.name}: ${status ? 'การเชื่อมต่อ API ล้มเหลว (จำลอง)' : 'การเชื่อมต่อ API กลับมาปกติ'}`);
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
        this.addLog(`ข้อผิดพลาด: สต็อกไม่พอ! สต็อกพร้อมขาย: ${this.salesStock}, ต้องการ: ${factor}`, 'warning');
        return;
      }
      
      // Check if THIS channel has enough stock to sell
      if (channel.internal < factor) {
        this.addLog(`ข้อผิดพลาด: ${channel.name} ไม่มีสต็อกพอขาย! มี: ${channel.internal}, ต้องการ: ${factor}`, 'warning');
        return;
      }

      // Stage 1: Reserve units (don't touch physical yet)
      this.reservedStock += factor;
      this.addLog(`ออเดอร์เข้า: ขาย ${this.activeSku.name} ผ่าน ${channel.name} จอง: +${factor} → รวมจอง: ${this.reservedStock}`);
      gsap.to(".sales-stock-display", { x: 5, yoyo: true, repeat: 3, duration: 0.05 });

      // Stage 2: Data Packet (Visual Flow)
      this.showDataPacket(channelId);

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

        if (pctDrift > (this.pctThreshold / 100) || (this.absThresholdEnabled && absDrift >= this.absThreshold)) {
          syncRequired = true;
          triggerReason = `${ch.name} ค่าเบี่ยงเบน (${absDrift} หน่วย / ${Math.round(pctDrift * 100)}%) เกินเกณฑ์ ${this.pctThreshold}% / ${this.absThreshold} หน่วย`;
          break; 
        }
      }
      
      if (syncRequired) {
        this.addLog(`เริ่มซิงค์: ${triggerReason}`);
        this.performMasterSync();
      } else {
        this.addLog(`ไม่ต้องซิงค์: ค่าเบี่ยงเบนอยู่ในเกณฑ์ปลอดภัย`);
      }
    },
    async shipAll() {
      if (this.reservedStock === 0) {
        this.addLog(`ไม่มีออเดอร์ที่รอจัดส่ง`);
        return;
      }
      
      const toShip = this.reservedStock;
      
      // Safety check: can't ship more than physical stock
      if (toShip > this.physicalStock) {
        this.addLog(`ข้อผิดพลาด: ไม่สามารถจัดส่ง ${toShip} หน่วย มี Physical Stock เพียง ${this.physicalStock} หน่วย!`, 'warning');
        return;
      }
      
      this.isSyncing = true;
      this.addLog(`พร้อมจัดส่ง: กำลังดำเนินการ ${toShip} หน่วย...`);
      
      // Visual shake on physical tank and reserved stock
      gsap.to(".physical-tank-main", { x: 5, yoyo: true, repeat: 3, duration: 0.05 });
      gsap.to(".reserved-stock-display", { x: 5, yoyo: true, repeat: 3, duration: 0.05 });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fulfill orders: Physical decreases, Reserved clears
      this.physicalStock -= toShip;
      this.reservedStock = 0;
      
      this.isSyncing = false;
      this.addLog(`จัดส่งแล้ว: ${toShip} หน่วย ออกจากคลัง Physical Stock: ${this.physicalStock}, จอง: ${this.reservedStock}`, 'success');
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
      const factor = this.activeSku.factor;

      // Set the quantity text inside the packet
      const spanEl = packetEl.querySelector('span');
      if (spanEl) spanEl.textContent = factor;

      // Scale packet size based on SKU factor: 1 = 1x, 6 = 1.5x, 12 = 2x
      const packetScale = factor === 1 ? 1 : (factor === 6 ? 1.5 : 2);
      const offset = 24 * packetScale; // Center offset based on scaled size
      gsap.set(packetEl, { x: startX - offset, y: startY - offset, opacity: 1, scale: packetScale, backgroundColor: '#0088FF' });
      
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
        this.addLog(`ซิงค์ล้มเหลว: ${ch.name} (หมดเวลา) กำลังลองใหม่...`, 'warning');
      } else {
        tl.to(packetEl, {
          x: endX - 16,
          y: endY - 16,
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
      this.addLog("ซิงค์สำเร็จ: ทุกช่องทางที่พร้อมใช้งานได้ปรับสต็อกตามเป้าหมายแล้ว", 'success');
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
    
    // Welcome hints (added in reverse order so first appears at top)
    this.addLog("💡 ลอง: กด 'Simulate API Fail' แล้วดูว่าระบบจัดการอย่างไร", 'hint');
    this.addLog("💡 ลอง: เปิด Engine Tuning ปรับ Buffer % แล้วดูการเปลี่ยนแปลง", 'hint');
    this.addLog("💡 ลอง: กดเลือก Strategy แล้วกด Confirm เพื่อเปลี่ยนวิธีกระจายสต็อก", 'hint');
    this.addLog("💡 ลอง: กด 'Sell unit' จากนั้นกด 'Ship All' เพื่อจำลองการขายและจัดส่ง", 'hint');
    this.addLog("ระบบพร้อมทำงาน กำลังติดตาม Physical Stock [1,000 หน่วย]", 'success');
  }
};
</script>
