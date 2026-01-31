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

    <!-- Overselling Banner -->
    <transition name="slide-fade">
      <div v-if="isOversold" class="fixed top-0 left-0 right-0 z-[60] bg-red-600 text-white py-2 shadow-2xl overflow-hidden">
        <div class="flex items-center justify-center gap-4 animate-pulse">
          <span class="text-xl font-black uppercase tracking-tighter">🚨 CRITICAL: STOCK COLLAPSE DETECTED</span>
          <span class="text-sm font-bold bg-white/20 px-3 py-0.5 rounded-full">SYSTEM OVER-COMMITTED</span>
        </div>
      </div>
    </transition>

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
          <div class="flex items-center gap-1">
            <span class="text-xs text-gray-500 font-medium whitespace-nowrap">Distribution Strategy</span>
            <!-- Strategy Tooltip -->
            <div class="group relative inline-block">
              <span class="cursor-help inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-50 text-brand-blue text-[10px] font-bold">?</span>
              <div class="pointer-events-none absolute top-full left-0 mt-2 w-72 p-4 bg-white border border-gray-200 text-slate-600 text-[13px] font-normal normal-case rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl leading-relaxed">
                <p class="font-bold mb-2 border-b border-gray-100 pb-1 text-brand-blue">วิธีกระจายสต็อก</p>
                
                <div class="space-y-3">
                  <div>
                    <p class="font-bold text-slate-800">1. Weighted (ถ่วงน้ำหนัก)</p>
                    <p>กระจายสต็อกตามสัดส่วน (%) ที่คุณกำหนดเองในแต่ละช่องทาง เหมาะสำหรับเน้นขายในที่ที่ทำกำไรได้มากกว่า</p>
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">2. Equal (สัดส่วนเท่ากัน)</p>
                    <p>ระบบจะแบ่งสต็อกให้ทุกช่องทางเท่าๆ กันโดยอัตโนมัติ เพื่อกระจายโอกาสการเข้าถึงสินค้าอย่างยุติธรรม</p>
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">3. Mirror (แสดงสต็อกเต็มจำนวน)</p>
                    <p>แสดงสต็อกที่มีทั้งหมดบนทุกช่องทางพร้อมกัน (เช่น มี 10 จะแสดง 10 ทุกที่) เพื่อเพิ่มโอกาสการขายสูงสุด แต่มีความเสี่ยง Oversell สูง</p>
                  </div>
                </div>
                
                <div class="absolute bottom-full left-4 border-[6px] border-transparent border-b-white"></div>
                <div class="absolute bottom-full left-4 border-[7px] border-transparent border-b-gray-200 -z-10 mb-[1px]"></div>
              </div>
            </div>
          </div>
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
            ปรับแต่งการทำงาน
          </button>
          
<div v-if="previewStrategy" class="flex items-center gap-3 animate-pulse">
             <span class="text-[10px] font-black text-brand-blue uppercase tracking-tighter">ตัวอย่างแผนงานใหม่</span>
             <button 
               @click="applyStrategy"
               class="px-6 py-2 bg-sync-pulse hover:bg-emerald-400 text-white font-black text-xs uppercase rounded-lg shadow-lg transition-all"
             >
               ยืนยันการเปลี่ยนแผน
             </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Tuning Panel -->
    <transition name="slide-fade">
      <div v-if="showTuning" class="mb-8 glass-card border-amber-300 p-6 grid grid-cols-4 gap-6">
        <!-- Insurance Buffer -->
        <div class="space-y-4">
          <h3 class="text-xs font-black text-amber-600 uppercase flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            Safety Guardrails
            <!-- Tooltip -->
            <div class="group relative inline-block">
              <span class="cursor-help inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold">?</span>
              <div class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-gray-200 text-slate-600 text-[13px] font-normal normal-case rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl leading-relaxed">
                <p class="font-bold mb-1 border-b border-gray-100 pb-1 text-amber-600">สำรองสต็อกเพื่อความปลอดภัย</p>
                <p class="mb-2 italic">สต็อกส่วนที่ "กั้นไว้" ไม่ให้นำไปแสดงขายบนช่องทางต่างๆ เพื่อป้องกัน Oversell</p>
                <p class="text-emerald-600 font-bold">↑ ปรับสูง: สต็อกที่แสดงขายลดลง (ปลอดภัยมากขึ้น)</p>
                <p class="text-rose-500 font-bold">↓ ปรับต่ำ: สต็อกที่แสดงขายมากขึ้น (เพิ่มโอกาสขาย)</p>
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-gray-200 -z-10 mt-[1px]"></div>
              </div>
            </div>
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

        <!-- Sync Sensitivity (Rel) -->
        <div class="space-y-4">
          <h3 class="text-xs font-black text-brand-blue uppercase flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-brand-blue rounded-full"></span>
            Sync Sensitivity (Rel)
            <!-- Tooltip -->
            <div class="group relative inline-block">
              <span class="cursor-help inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-brand-blue text-[10px] font-bold">?</span>
              <div class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-gray-200 text-slate-600 text-[13px] font-normal normal-case rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl leading-relaxed">
                <p class="font-bold mb-1 border-b border-gray-100 pb-1 text-brand-blue">เกณฑ์ความต่างแบบเปอร์เซ็นต์</p>
                <p class="mb-2 italic">กำหนดค่าเบี่ยงเบน (%) ที่ยอมรับได้ระหว่างสต็อกในระบบและหน้าร้าน ก่อนสั่งซิงค์ใหม่</p>
                <p class="text-emerald-600 font-bold">↑ ปรับสูง: ซิงค์ไม่บ่อย (ประหยัดทรัพยากรระบบ)</p>
                <p class="text-rose-500 font-bold">↓ ปรับต่ำ: ซิงค์บ่อยมาก (สต็อกแม่นยำตลอดเวลา)</p>
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-gray-200 -z-10 mt-[1px]"></div>
              </div>
            </div>
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

        <!-- Sync Sensitivity (Abs) -->
        <div class="space-y-4">
          <h3 class="text-xs font-black text-pink-500 uppercase flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="absThresholdEnabled" class="w-4 h-4 accent-pink-500 rounded">
              <span class="w-1.5 h-1.5 bg-pink-500 rounded-full" :class="{ 'opacity-30': !absThresholdEnabled }"></span>
              <span :class="{ 'opacity-50': !absThresholdEnabled }">Sync Sensitivity (Abs)</span>
            </label>
            <!-- Tooltip -->
            <div class="group relative inline-block">
              <span class="cursor-help inline-flex items-center justify-center w-4 h-4 rounded-full bg-pink-100 text-pink-600 text-[10px] font-bold">?</span>
              <div class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-gray-200 text-slate-600 text-[13px] font-normal normal-case rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl leading-relaxed">
                <p class="font-bold mb-1 border-b border-gray-100 pb-1 text-pink-600">เกณฑ์ความต่างแบบจำนวนหน่วย</p>
                <p class="mb-2 italic">กำหนดจำนวนหน่วยความต่างที่จะสั่งซิงค์ทันทีโดยไม่สนเปอร์เซ็นต์</p>
                <p class="text-emerald-600 font-bold">↑ ปรับสูง: ยอมให้สต็อกต่างกันหลายหน่วยค่อยซิงค์</p>
                <p class="text-rose-500 font-bold">↓ ปรับต่ำ: ซิงค์ทันทีแม้สต็อกต่างกันเพียงเล็กน้อย</p>
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-gray-200 -z-10 mt-[1px]"></div>
              </div>
            </div>
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
            <!-- Tooltip -->
            <div class="group relative inline-block">
              <span class="cursor-help inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">?</span>
              <div class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-gray-200 text-slate-600 text-[13px] font-normal normal-case rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl leading-relaxed">
                <p class="font-bold mb-1 border-b border-gray-100 pb-1 text-emerald-600">ระบบหยุดขายอัตโนมัติเมื่อสต็อกต่ำ</p>
                <p class="mb-2 italic">เมื่อสต็อกลดลงถึงจุดที่กำหนด ระบบจะโยก Stock ทั้งหมดไปขายที่ช่องทางหลักที่เดียว</p>
                <p class="text-emerald-600 font-bold">↑ ปรับสูง: ย้ายไปขายที่เดียวเร็วขึ้น (ปลอดภัยมาก)</p>
                <p class="text-rose-500 font-bold">↓ ปรับต่ำ: ยอมให้ขายหลายที่ต่อ (เสี่ยงออเดอร์ซ้ำซ้อน)</p>
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-gray-200 -z-10 mt-[1px]"></div>
              </div>
            </div>
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

        <!-- Chaos Mode Section -->
        <div class="col-span-4 mt-2 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div>
            <h3 class="text-xs font-black text-red-600 uppercase flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-red-500 rounded-full" :class="{ 'animate-ping': isChaosMode }"></span>
              Stress Test Environment
              <!-- Tooltip -->
              <div class="group relative inline-block">
                <span class="cursor-help inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">?</span>
                <div class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-gray-200 text-slate-600 text-[13px] font-normal normal-case rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl leading-relaxed">
                  <p class="font-bold mb-1 border-b border-gray-100 pb-1 text-red-600">จำลองสถานการณ์ขายดีผิดปกติ</p>
                  <p class="mb-2 italic">ระบบจะสร้างออเดอร์จำนวนมากแบบรัวๆ เข้ามาพร้อมกันจากทุกช่องทาง เพื่อทดสอบว่าค่า Buffer ที่คุณตั้งไว้เพียงพอหรือไม่</p>
                  <p class="text-emerald-600 font-bold">✔ ทดสอบความไว: ดูการตัดสต็อกแบบ Real-time</p>
                  <p class="text-emerald-600 font-bold">✔ ตรวจสอบการขายเกิน: ดูว่าสต็อกหน้าบ้านติดลบหรือไม่</p>
                  <div class="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
                  <div class="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-gray-200 -z-10 mt-[1px]"></div>
                </div>
              </div>
            </h3>
            <p class="text-[9px] text-gray-400 italic">Simulate a high-velocity flash sale to test your buffer strategy.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex flex-col items-end gap-1">
              <span class="text-[9px] font-bold text-gray-400 uppercase">Order Count</span>
              <input 
                v-model.number="chaosOrderLimit" 
                type="number" 
                min="1" max="100"
                class="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-red-600 font-bold text-center focus:border-red-500 focus:outline-none"
                :disabled="isChaosMode"
              >
            </div>
            <button 
              @click="triggerChaosMode"
              :disabled="isChaosMode || salesStock <= 0"
              class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase rounded-lg shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group relative"
            >
              {{ isChaosMode ? 'Flash Sale in Progress...' : 'Launch Chaos Mode' }}
              <span v-if="salesStock <= 0 && !isChaosMode" class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Needs available stock</span>
            </button>
          </div>
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
          <div class="relative h-64 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden mb-8 physical-tank-main" :class="{ 'ring-4 ring-red-500 ring-inset animate-pulse': isOversold }" style="isolation: isolate;">
            <!-- Debt Zone (Red growing up from bottom if stock is negative) -->
            <div 
              v-if="physicalStock < 0"
              class="absolute bottom-0 left-0 right-0 bg-red-600 transition-all duration-500"
              :style="{ height: (Math.min(100, (Math.abs(physicalStock) / tankMaxCapacity) * 100)) + '%' }"
            >
              <div class="absolute top-0 left-0 right-0 h-1 bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
              <span class="absolute top-2 left-2 text-[10px] font-black text-white uppercase italic">Inventory Debt</span>
            </div>

            <!-- Normal Stock Liquid -->
            <div 
              v-else
              class="absolute bottom-0 left-0 right-0 bg-brand-blue/20 transition-all duration-500"
              :style="{ height: (physicalStock / tankMaxCapacity) * 100 + '%' }"
            >
              <div class="absolute top-0 left-0 right-0 h-1 bg-brand-blue shadow-[0_0_10px_rgba(0,136,255,0.5)]"></div>
            </div>

            <!-- Reserved Zone (above buffer) -->
            <div 
              v-if="reservedStock > 0"
              class="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-amber-500/70 bg-amber-500/20 transition-all duration-300"
              :style="{ height: ((effectiveBuffer + reservedStock) / tankMaxCapacity) * 100 + '%' }"
            >
              <span class="absolute -top-6 left-2 text-xs text-amber-600 font-mono">RESERVED ({{ reservedStock }})</span>
            </div>

            <div 
              class="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-drift-alert/50 transition-all duration-300"
              :class="isBufferCompressed ? 'caution-stripe' : 'bg-drift-alert/10'"
              :style="{ height: ((isBufferCompressed ? Math.max(4, effectiveBuffer) : effectiveBuffer) / tankMaxCapacity) * 100 + '%' }"
            >
              <span class="absolute -top-6 right-2 text-xs text-drift-alert font-black">
                {{ isBufferCompressed ? '⚠️ BUFFER COMPRESSED' : 'BUFFER' }} 
                ({{ isBufferCompressed ? (bufferStock - remainingBufferUnits) : effectiveBuffer }})
              </span>
            </div>
            
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-5xl font-black rolling-number" :class="physicalStock < 0 ? 'text-red-600' : 'text-brand-text'">
                {{ physicalStock < 0 ? '-' : '' }}{{ Math.round(Math.abs(displayPhysicalStock)) }}
              </span>
              <span class="text-xs uppercase tracking-widest" :class="physicalStock < 0 ? 'text-red-500 font-bold' : 'text-gray-500'">Physical Units</span>
            </div>
          </div>

          <!-- Risk Gauge Section (2-Column Explanation) -->
          <div class="mb-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex gap-6 items-center">
            <!-- Left: Gauge Visualization -->
            <div class="flex flex-col items-center flex-shrink-0">
              <div class="relative w-40 h-20 overflow-hidden">
                <!-- Semi-circle Track -->
                <svg viewBox="0 0 100 50" class="w-full h-full text-gray-100">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" />
                  <!-- Risk Progress -->
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    :stroke="riskColor" 
                    stroke-width="12" 
                    stroke-linecap="round" 
                    stroke-dasharray="125.66" 
                    :stroke-dashoffset="125.66 - (125.66 * (oversellRisk / 100))"
                    class="transition-all duration-700 ease-out"
                  />
                </svg>
                <!-- Digital Output -->
                <div class="absolute bottom-0 left-0 right-0 text-center">
                  <p class="text-xs font-black font-mono transition-colors duration-500" :style="{ color: riskColor }">
                    {{ oversellRisk }}%
                  </p>
                </div>
              </div>
              <p class="text-[9px] font-bold uppercase mt-2 italic flex items-center gap-2" :style="{ color: riskColor }">
                <span class="w-1.5 h-1.5 rounded-full" :class="{ 'animate-ping': oversellRisk > 70 }" :style="{ backgroundColor: riskColor }"></span>
                {{ riskStatus }}
              </p>
              <!-- Formula moved here for balance -->
              <div class="mt-3 font-mono text-[8px] text-gray-400 bg-gray-200/40 py-1.5 px-2 rounded-lg border border-gray-200/50 text-center leading-tight">
                Risk = (Velocity × Latency) / <br>(Sales Stock + Buffer)
              </div>
            </div>

            <!-- Right: Thai Explanation -->
            <div class="flex-grow">
              <p class="text-[13px] text-brand-text leading-relaxed">
                วิเคราะห์โอกาสขายเกินจาก <span class="font-bold">ความเร็วการขาย (Velocity)</span> 
                เทียบกับ <span class="font-bold text-brand-blue">สต็อกคงเหลือ</span> 
                โดยคำนวณรวมระยะเวลาที่ใช้ในการอัปเดตระบบ 
                <span class="font-bold text-amber-500 italic">(Simulated Latency: 0.8s)</span>
              </p>
              <div class="mt-2 flex gap-3 opacity-60">
                <div class="text-[9px] font-bold text-gray-400">VELOCITY: {{ salesVelocity.toFixed(1) }}/s</div>
                <div class="text-[9px] font-bold text-gray-400">LATENCY: 0.8s</div>
              </div>
            </div>
          </div>

          <!-- Stock Breakdown -->
          <div class="space-y-3">
            <!-- Sales Stock -->
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border transition-all" :class="isOversold ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-gray-200'">
              <div class="sales-stock-display">
                <p class="text-xs text-gray-500 uppercase font-bold tracking-tight">Sales Stock (Available)</p>
                <p class="text-3xl font-black" :class="isOversold ? 'text-red-600' : 'text-brand-blue'">{{ salesStock }}</p>
                <p v-if="isOversold" class="text-[10px] text-red-600 font-bold uppercase tracking-tighter mt-1 animate-pulse">
                  ⚠️ INVENTORY DEBT: {{ inventoryDebt }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500 uppercase font-bold tracking-tight">Buffer</p>
                <p class="text-2xl font-black transition-colors" :class="isBufferCompressed ? 'text-amber-500 animate-pulse' : 'text-drift-alert'">{{ effectiveBuffer }}</p>
                <p v-if="isBufferCompressed && !isOversold" class="text-[9px] text-amber-500 italic font-bold">
                  ({{ bufferStock - remainingBufferUnits }}) DEPLETED
                </p>
                <p v-if="isOversold" class="text-[9px] text-red-600 italic font-bold">(0) EXHAUSTED</p>
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

import { SIMULATION_CONFIG, THRESHOLDS, TIMINGS } from './constants';
import { InventoryEngine } from './services/InventoryEngine';

export default {
  components: { ChannelCard },
  data() {
    return {
      engine: new InventoryEngine(), // Instance of logic engine
      physicalStock: SIMULATION_CONFIG.INITIAL_STOCK,
      displayPhysicalStock: SIMULATION_CONFIG.INITIAL_STOCK,
      bufferPercent: 5,
      bufferStock: 5, // Fixed buffer: recalculates only on slider change or admin adjustment
      reservedStock: 0, // Units held for pending orders (waiting for RTS)
      pctThreshold: 15,
      absThreshold: 2,
      absThresholdEnabled: false,
      cutoffEnabled: true,
      cutoffThreshold: 20,
      cutoffPriorityChannel: 'shopee',
      isChaosMode: false,
      chaosOrderLimit: 20,
      isSyncing: false,
      orderTimestamps: [],
      salesVelocity: 0,
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
        { id: 'shopee', name: 'Shopee', weight: 40, internal: 380, ideal: 380, drift: 0, orderCount: 0, isManual: false, apiFailing: false },
        { id: 'lazada', name: 'Lazada', weight: 30, internal: 285, ideal: 285, drift: 0, orderCount: 0, isManual: false, apiFailing: false },
        { id: 'tiktok', name: 'TikTok', weight: 20, internal: 190, ideal: 190, drift: 0, orderCount: 0, isManual: false, apiFailing: false },
        { id: 'website', name: 'BentoWeb', weight: 10, internal: 95, ideal: 95, drift: 0, orderCount: 0, isManual: false, apiFailing: false }
      ],
      packetPool: [],
      stockAdjustmentInput: null
    };
  },
  computed: {
    activeSku() {
      return this.skuTypes.find(s => s.id === this.selectedSku);
    },
    // Effective buffer is now STICKY. 
    // It remains firm at the target level even during sales.
    // This allows salesStock to go into "Inventory Debt" while buffer stays visible.
    effectiveBuffer() {
      return this.bufferStock;
    },
    inventoryDebt() {
      // True debt: when we've sold more than we physically have
      return Math.max(0, this.reservedStock - this.physicalStock);
    },
    oversellRisk() {
      // Risk = (Velocity * Latency) / Max(1, SafeStock)
      // Latency is simulated at ~0.8s
      // SafeStock = salesStock + effectiveBuffer
      const safeStock = this.salesStock + this.effectiveBuffer;
      if (safeStock <= 0) return 100;
      
      const latency = 0.8; 
      const risk = (this.salesVelocity * latency) / safeStock;
      return Math.min(100, Math.round(risk * 100));
    },
    riskColor() {
      if (this.oversellRisk < 40) return '#10b981'; // Green
      if (this.oversellRisk < 80) return '#f59e0b'; // Amber
      return '#ef4444'; // Red
    },
    riskStatus() {
      if (this.salesVelocity === 0) return 'System Idling';
      if (this.oversellRisk < 40) return 'Status: Stable';
      if (this.oversellRisk < 70) return 'Status: Buffer Stressed';
      if (this.oversellRisk < 90) return 'Status: Critical Risk';
      return 'STATUS: GUARANTEED OVERSELL';
    },
    rawSalesStock() {
      // Sales Stock follows the priority: Physical -> Buffer -> Sales
      // Available for sales = Physical - Buffer (if any) - Reserved
      // If this is negative, it means we are dipping into Buffer or Debt.
      return this.physicalStock - this.bufferStock - this.reservedStock;
    },
    tankMaxCapacity() {
      // Scale visualization base on current levels, minimum 100
      return Math.max(100, this.physicalStock, this.reservedStock + this.effectiveBuffer);
    },
    salesStock() {
      // Marketplace display: never show negative values
      return Math.max(0, this.rawSalesStock);
    },
    remainingBufferUnits() {
      // How much of the safety net is actually left physically?
      const available = this.physicalStock - this.reservedStock;
      return Math.max(0, Math.min(this.bufferStock, available));
    },
    isBufferCompressed() {
      // Buffer is compressed/depleted when we have less available physical stock 
      // than the target, OR when reserved orders are forcing us to use it.
      const availablePhysical = this.physicalStock - this.reservedStock;
      return this.bufferStock > 0 && availablePhysical < this.bufferStock;
    },
    isOversold() {
      // Trigger critical alarms only on TRUE debt (Orders > Physical)
      return this.inventoryDebt > 0;
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
      handler() {
        this.recalculateBuffer();
      }
    },
    salesStock: {
      handler() {
        this.updateIdeals();
      }
    }
  },
  methods: {
    // recalculateBuffer sets the "Unit Target" for safety.
    // It is called when stock is increased (Growth) or when settings change.
    recalculateBuffer(silent = false) {
      // Update Engine State
      this.engine.physicalStock = this.physicalStock;
      this.engine.bufferPercent = this.bufferPercent;
      this.engine.recalculateBuffer();
      
      this.bufferStock = this.engine.bufferStock;

      const baseStock = Math.max(0, this.physicalStock);
      if (!silent) {
        this.addLog(`อัปเดต Buffer: ${this.bufferStock} หน่วย (${this.bufferPercent}% ของ Physical ${baseStock})`, 'info');
      }
    },
    addLog(message, type = 'info') {
      const now = new Date();
      const time = now.toTimeString().split(' ')[0];
      this.logs.unshift({ time, message, type });
      if (this.logs.length > SIMULATION_CONFIG.LOG_Limit) this.logs.pop();
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
      this.recalculateBuffer();
      
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
            ch.ideal = Math.max(0, this.salesStock);
            ch.ghostValue = this.previewStrategy ? Math.max(0, this.salesStock) : null;
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
      
      // Calculate base ideals using Engine
      
      // Ensure engine has current channel config (weights)
      this.engine.setChannels(this.channels);
      
      const newIdeals = this.engine.calculateIdeals(strategy, this.salesStock);
      
      // Apply results
      this.channels.forEach(ch => {
        ch.ideal = newIdeals[ch.id] || 0;
        ch.ghostValue = this.previewStrategy ? ch.ideal : null;
      });

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
      
      await new Promise(resolve => setTimeout(resolve, TIMINGS.GHOST_STRATEGY_DELAY_MS));
      
      this.selectedStrategy = this.previewStrategy;
      this.previewStrategy = null;
      this.isSyncing = false;
      this.performMasterSync();
    },
    rebalanceWeights({ id, value }) {
      const newValue = parseFloat(value);
      this.engine.rebalanceWeights(this.channels, id, newValue);
      
      // Cleanup visual rounding (UI specific)
      // We keep this here because it modifies the bound data directly for the sliders
      let total = this.channels.reduce((acc, c) => acc + c.weight, 0);
      const diff = 100 - total;
      if (Math.abs(diff) > 0.001) {
         const otherChannels = this.channels.filter(c => c.id !== id);
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
      
      // In "Hard Truth" mode, we allow sales to proceed even if stock is 0
      // this simulates the reality of overselling due to sync delays.

      // Stage 1: Reserve units (don't touch physical yet)
      this.reservedStock += factor;
      channel.orderCount++;
      this.orderTimestamps.push(Date.now());
      this.addLog(`ออเดอร์เข้า: ขาย ${this.activeSku.name} ผ่าน ${channel.name} จอง: +${factor} → รวมจอง: ${this.reservedStock}`);
      gsap.to(".sales-stock-display", { x: 5, yoyo: true, repeat: 3, duration: 0.05 });

      // Stage 2: Data Packet (Visual Flow)
      this.showDataPacket(channelId);

      // Stage 3: Marketplace Drop (Delayed - simulate API travel time)
      // This creates the "Desync" period where Drift is visible
      await new Promise(resolve => setTimeout(resolve, TIMINGS.MARKETPLACE_LATENCY_MS));
      channel.internal = Math.max(0, channel.internal - factor);

      // Stage 4: Global Drift Gatekeeper (Omnichannel Scan)
      let syncRequired = false;
      let triggerReason = "";

      for (const ch of this.channels) {
        if (ch.isManual) continue;

        const result = this.engine.checkDrift(
          ch.id, 
          ch.internal, 
          ch.ideal, 
          this.pctThreshold, 
          this.absThresholdEnabled ? this.absThreshold : 0
        );

        if (result.syncRequired) {
          syncRequired = true;
          triggerReason = `${ch.name}: ${result.reason}`;
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
    async triggerChaosMode() {
      if (this.isChaosMode || this.salesStock <= 0) return;
      
      this.isChaosMode = true;
      this.addLog(`🚨 CHAOS MODE: Simulating ${this.chaosOrderLimit} high-velocity orders...`, "warning");
      
      const orderCount = this.chaosOrderLimit;
      for (let i = 0; i < orderCount; i++) {
        // Stop if we hit deep debt during chaos
        if (this.physicalStock < -10) break;

        const randomChannel = this.channels[Math.floor(Math.random() * this.channels.length)].id;
        this.triggerOrder(randomChannel);

        // Random burst interval (50ms - 250ms)
        const delay = Math.random() * 200 + 50;
        await new Promise(r => setTimeout(r, delay));
      }

      this.isChaosMode = false;
      this.addLog("🏁 Chaos Mode Complete. Waiting for system recovery...", "success");
    },
    updateVelocity() {
      const now = Date.now();
      const windowMs = 3000; // 3 second window
      this.orderTimestamps = this.orderTimestamps.filter(t => now - t < windowMs);
      
      this.salesVelocity = this.orderTimestamps.length / (windowMs / 1000);
    },
    async shipAll() {
      if (this.reservedStock === 0) {
        this.addLog(`ไม่มีออเดอร์ที่รอจัดส่ง`);
        return;
      }
      
      const toShip = this.reservedStock;
      
      this.isSyncing = true;
      this.addLog(`พร้อมจัดส่ง: กำลังดำเนินการ ${toShip} หน่วย...`);
      
      // Visual shake on physical tank and reserved stock
      gsap.to(".physical-tank-main", { x: 5, yoyo: true, repeat: 3, duration: 0.05 });
      gsap.to(".reserved-stock-display", { x: 5, yoyo: true, repeat: 3, duration: 0.05 });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // "Hard Truth" fulfillment: Physical decreases even into negative stock
      const oldStock = this.physicalStock;
      this.physicalStock -= toShip;
      this.reservedStock = 0;
      
      // Safety Floor: Keep existing unit target but cap by what's actually left.
      // This absorbs remaining stock into the buffer during low-stock situations
      // instead of shrinking the buffer and releasing 'unsafe' units for sale.
      this.bufferStock = Math.max(0, Math.min(this.bufferStock, this.physicalStock));
      
      this.isSyncing = false;
      this.addLog(`จัดส่งแล้ว: ${toShip} หน่วย ออกจากคลัง Physical Stock: ${oldStock} → ${this.physicalStock}`, this.physicalStock < 0 ? 'warning' : 'success');
      
      if (this.physicalStock < 0) {
        this.addLog(`เตือนภัย: Stock ติดลบ! โปรดเติมสินค้าทันทีเพื่อแก้ปัญหา Overselling`, 'warning');
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
 
       // Simulated Sync Delay
       await new Promise(resolve => setTimeout(resolve, TIMINGS.MASTER_SYNC_DURATION_MS));
       
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
    
    // Initial buffer calculation
    this.recalculateBuffer(true);
    
    // Start velocity tracker (every 200ms for smoothness)
    setInterval(() => {
      this.updateVelocity();
    }, 200);

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
    this.addLog("ระบบพร้อมทำงาน กำลังติดตาม Physical Stock [100 หน่วย]", 'success');
  }
};
</script>
