<template>
    <div class="control-btn-group" @mouseenter="hovered = true" @mouseleave="hovered = false">
        <div class="control-extra-btns" :class="{ visible: hovered }">
            <button v-for="btn in extraButtons" :key="btn.label" @click="btn.onClick">
                {{ btn.label }}
            </button>
        </div>
        <button @click="onPrimary">{{ hovered ? hoveredLabel : label }}</button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
    label: string
    hoveredLabel: string
    extraButtons: Array<{ label: string; onClick: () => void }>
    onPrimary: () => void
}>()

const hovered = ref(false)
</script>

<style scoped>
.control-btn-group {
    position: relative;
}

.control-extra-btns {
    position: absolute;
    bottom: 100%;
    left: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding-bottom: 0.3rem;
    transform: translateY(6px);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.15s ease, opacity 0.15s ease;
}

.control-extra-btns.visible {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
}
</style>
