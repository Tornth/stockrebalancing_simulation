import { SIMULATION_CONFIG, THRESHOLDS } from '../constants';

export class InventoryEngine {
    constructor(initialPhysicalStock = SIMULATION_CONFIG.INITIAL_STOCK) {
        this.physicalStock = initialPhysicalStock;
        this.bufferPercent = 5;
        this.bufferStock = 0;
        this.reservedStock = 0;
        this.channels = [];
        this.recalculateBuffer();
    }

    setChannels(channels) {
        // Expects array of { id, weight, ideal, internal, ... }
        // We store a reference or a deep copy? 
        // For this simulation, we'll manipulate the passed objects directly or return state updates
        this.channels = channels;
    }

    recalculateBuffer() {
        const baseStock = Math.max(0, this.physicalStock);
        this.bufferStock = Math.ceil(baseStock * (this.bufferPercent / 100));
    }

    get effectiveBuffer() {
        return this.bufferStock;
    }

    get rawSalesStock() {
        return this.physicalStock - this.bufferStock - this.reservedStock;
    }

    get salesStock() {
        return Math.max(0, this.rawSalesStock);
    }

    // Calculate Ideals Logic
    calculateIdeals(strategy, salesStock) {
        let newIdeals = {}; // { channelId: value }

        if (strategy === 'mirror') {
            this.channels.forEach(ch => {
                newIdeals[ch.id] = Math.max(0, salesStock);
            });
            return newIdeals;
        }

        let totalAllocated = 0;
        let ideals = [];

        // Base Allocation
        this.channels.forEach(ch => {
            let val = 0;
            if (strategy === 'weighted') {
                val = Math.floor(salesStock * (ch.weight / 100));
            } else if (strategy === 'equal') {
                val = Math.floor(salesStock / this.channels.length);
            }
            val = Math.max(0, val);
            ideals.push({ id: ch.id, val, weight: ch.weight });
            totalAllocated += val;
        });

        // Remainder Distribution
        let remainder = salesStock - totalAllocated;
        if (remainder > 0 && salesStock > 0) {
            if (strategy === 'weighted') {
                ideals.sort((a, b) => b.weight - a.weight);
            } else {
                ideals.sort((a, b) => a.id.localeCompare(b.id));
            }

            for (let i = 0; i < remainder; i++) {
                const target = ideals[i % ideals.length];
                target.val += 1;
            }
        }

        // Convert back to map
        ideals.forEach(item => {
            newIdeals[item.id] = item.val;
        });

        return newIdeals;
    }

    rebalanceWeights(channels, masterId, newValue) {
        const masterChannel = channels.find(c => c.id === masterId);
        if (!masterChannel) return channels;

        const oldValue = masterChannel.weight;
        const delta = newValue - oldValue;

        const otherChannels = channels.filter(c => c.id !== masterId);
        const sumOthers = otherChannels.reduce((acc, c) => acc + c.weight, 0);

        if (sumOthers > 0) {
            otherChannels.forEach(c => {
                const reduction = delta * (c.weight / sumOthers);
                c.weight = Math.max(0, c.weight - reduction);
            });
        }

        masterChannel.weight = newValue;
        return channels;
    }

    checkDrift(channelId, currentInternal, ideal, pctThreshold, absThreshold) {
        const absDrift = Math.abs(ideal - currentInternal);
        const pctDrift = ideal > 0 ? (absDrift / ideal) : 0;

        const isPctTrigger = pctDrift > (pctThreshold / 100);
        const isAbsTrigger = absThreshold > 0 && absDrift >= absThreshold;

        if (isPctTrigger || isAbsTrigger) {
            return {
                syncRequired: true,
                reason: ` ค่าเบี่ยงเบน (${absDrift} หน่วย / ${Math.round(pctDrift * 100)}%) เกินเกณฑ์ ${pctThreshold}%${absThreshold > 0 ? ` / ${absThreshold} หน่วย` : ''}`
            };
        }

        return { syncRequired: false, reason: '' };
    }
}
