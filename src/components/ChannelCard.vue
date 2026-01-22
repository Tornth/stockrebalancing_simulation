<template>
  <div 
    class="glass-card p-5 relative transition-all duration-300"
    :class="[
      channel.isManual ? 'bg-amber-50 border-amber-300' : '',
      apiFailing ? 'bg-red-50 border-red-300' : ''
    ]"
  >
    <!-- Desync Warning -->
    <div v-if="isDesynced" class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce uppercase">
      Desync Warning
    </div>

    <!-- Card Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="font-bold text-xl text-brand-text">{{ channel.name }}</h3>
        <button 
          @click="$emit('toggle-manual', channel.id)"
          class="flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider transition-colors"
          :class="channel.isManual ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'"
        >
          <template v-if="channel.isManual">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
            Manual Lock Active
          </template>
          <template v-else>
            <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
            Unlock Global Sync
          </template>
        </button>
      </div>
      <div class="text-right">
        <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Stock Drift</p>
        <div 
          class="text-xl font-mono font-bold"
          :class="driftSeverityClass"
        >
          {{ driftPercent }}%
        </div>
        <!-- Ghost Preview Delta -->
        <div v-if="channel.ghostValue !== null" class="text-[10px] text-brand-blue italic mt-1 font-bold">
          Target: {{ Math.floor(channel.ghostValue / skuFactor) }}
          <span :class="ghostDelta >= 0 ? 'text-sync-pulse' : 'text-drift-alert'">
            ({{ ghostDelta >= 0 ? '+' : '' }}{{ ghostDelta }})
          </span>
        </div>
      </div>
    </div>

    <!-- Stock Metrics Container -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Ideal ({{ unitLabel }})</p>
        <p class="text-2xl font-black text-brand-blue font-mono">{{ displayIdeal }}</p>
      </div>
      <div 
        class="p-3 rounded-lg border transition-all"
        :class="[
          driftSeverity > 5 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200',
          isOverCapacity ? 'border-red-500 ring-1 ring-red-500' : ''
        ]"
      >
        <div class="flex justify-between items-center mb-1">
          <p class="text-[10px] text-gray-500 uppercase font-bold">Marketplace ({{ unitLabel }})</p>
          <span v-if="isOverCapacity" class="text-[8px] text-red-500 font-black animate-pulse">
            OVER IDEAL: +{{ channel.internal - channel.ideal }} SINGLES
          </span>
        </div>
        <input 
          v-if="channel.isManual"
          type="number"
          :value="displayInternal"
          @input="$emit('manual-stock-change', { id: channel.id, value: Math.max(0, parseInt($event.target.value) || 0) * skuFactor })"
          class="bg-transparent text-2xl font-black font-mono w-full text-amber-600 outline-none"
        >
        <p v-else class="text-2xl font-black font-mono" :class="driftSeverity > 5 ? 'text-red-500' : 'text-brand-text'">
          {{ displayInternal }}
        </p>
      </div>
    </div>

    <!-- Controls -->
    <div class="space-y-4">
      <!-- Weight Slider -->
      <div class="space-y-1" :class="{ 'opacity-30 grayscale cursor-not-allowed': !isSlidersActive }">
        <div class="flex justify-between text-[11px] font-bold text-gray-500">
          <span>WEIGHT DISTRIBUTION</span>
          <span class="text-brand-blue">{{ channel.weight.toFixed(0) }}%</span>
        </div>
        <input 
          type="range" 
          :value="channel.weight"
          :disabled="!isSlidersActive"
          min="0" 
          max="100"
          step="1"
          @input="$emit('weight-change', { id: channel.id, value: $event.target.value })"
          class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        >
        <p v-if="!isSlidersActive" class="text-[9px] text-gray-400 italic font-medium">Locked: System-calculated strategy in effect</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button 
          @click="$emit('trigger-order', channel.id)"
          class="flex-grow bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-widest transition-all active:scale-95"
        >
          Sell unit
        </button>
        <button 
          @click="toggleApiFailure"
          class="px-3 py-2 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-tighter"
          :class="apiFailing ? 'bg-red-500 border-red-400 text-white' : 'bg-white border-gray-300 text-gray-500'"
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
      // A channel showing more than its ideal allocation is a true shortfall risk
      // (comparing to ideal is more accurate than salesStock which changes during order flow)
      return this.channel.internal > this.channel.ideal && this.channel.ideal > 0;
    },
    // Use raw singles for accurate drift (matches App.vue gatekeeper logic)
    rawDrift() {
      return Math.abs(this.channel.ideal - this.channel.internal);
    },
    driftSeverity() {
      // Display-friendly: show drift in current SKU unit for UI
      return Math.abs(this.displayIdeal - this.displayInternal);
    },
    driftPercent() {
      // Use raw singles for percentage to avoid flooring errors
      if (this.channel.ideal === 0) return 0;
      return Math.round((this.rawDrift / this.channel.ideal) * 100);
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
      // Use raw singles drift for absolute threshold (matches App.vue gatekeeper)
      const absRaw = this.rawDrift;
      // Hardening logic: Uses user-defined thresholds with raw singles
      if (pct > this.pctThreshold || absRaw >= this.absThreshold) return 'text-drift-alert animate-pulse';
      if (pct > 0) return 'text-amber-500';
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
