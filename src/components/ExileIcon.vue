<template>
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
        <!-- Horizontal warped grid lines -->
        <path d="M 0,0 Q 50,21 100,0" stroke="#52b788" stroke-width="0.7" fill="none" />
        <path d="M 0,10 Q 50,31 100,10" stroke="#52b788" stroke-width="0.7" fill="none" />
        <path d="M 0,20 Q 50,41 100,20" stroke="#52b788" stroke-width="0.8" fill="none" />
        <path d="M 0,30 Q 50,50 100,30" stroke="#52b788" stroke-width="0.8" fill="none" />
        <path d="M 0,40 Q 50,58 100,40" stroke="#95d5b2" stroke-width="0.9" fill="none" />
        <path d="M 0,50 Q 50,65 100,50" stroke="#95d5b2" stroke-width="0.9" fill="none" />
        <path d="M 0,60 Q 50,69 100,60" stroke="#95d5b2" stroke-width="1" fill="none" />
        <line x1="0" y1="70" x2="100" y2="70" stroke="#95d5b2" stroke-width="1" />
        <path d="M 0,80 Q 50,71 100,80" stroke="#95d5b2" stroke-width="1" fill="none" />
        <path d="M 0,90 Q 50,75 100,90" stroke="#95d5b2" stroke-width="0.9" fill="none" />
        <path d="M 0,100 Q 50,82 100,100" stroke="#95d5b2" stroke-width="0.9" fill="none" />
        <path d="M 0,110 Q 50,90 100,110" stroke="#52b788" stroke-width="0.8" fill="none" />
        <path d="M 0,120 Q 50,99 100,120" stroke="#52b788" stroke-width="0.8" fill="none" />
        <path d="M 0,130 Q 50,109 100,130" stroke="#52b788" stroke-width="0.7" fill="none" />
        <path d="M 0,140 Q 50,119 100,140" stroke="#52b788" stroke-width="0.7" fill="none" />

        <!-- Vertical warped grid lines -->
        <path d="M 0,0 Q 17,70 0,140" stroke="#52b788" stroke-width="0.7" fill="none" />
        <path d="M 10,0 Q 27,70 10,140" stroke="#52b788" stroke-width="0.8" fill="none" />
        <path d="M 20,0 Q 35,70 20,140" stroke="#52b788" stroke-width="0.8" fill="none" />
        <path d="M 30,0 Q 43,70 30,140" stroke="#95d5b2" stroke-width="0.9" fill="none" />
        <path d="M 40,0 Q 49,70 40,140" stroke="#95d5b2" stroke-width="1" fill="none" />
        <line x1="50" y1="0" x2="50" y2="140" stroke="#95d5b2" stroke-width="1" />
        <path d="M 60,0 Q 51,70 60,140" stroke="#95d5b2" stroke-width="1" fill="none" />
        <path d="M 70,0 Q 57,70 70,140" stroke="#95d5b2" stroke-width="0.9" fill="none" />
        <path d="M 80,0 Q 65,70 80,140" stroke="#52b788" stroke-width="0.8" fill="none" />
        <path d="M 90,0 Q 73,70 90,140" stroke="#52b788" stroke-width="0.8" fill="none" />
        <path d="M 100,0 Q 83,70 100,140" stroke="#52b788" stroke-width="0.7" fill="none" />

        <!-- Lensing glow rings -->
        <circle cx="50" cy="70" r="20" fill="none" stroke="#95d5b2" stroke-width="2.5" opacity="0.2" />
        <circle cx="50" cy="70" r="16" fill="none" stroke="#95d5b2" stroke-width="2" opacity="0.4" />
        <!-- Event horizon -->
        <circle cx="50" cy="70" r="12" fill="#000" />
        <circle cx="50" cy="70" r="12" fill="none" stroke="#52b788" stroke-width="1" opacity="0.8" />
    </svg>
</template>
