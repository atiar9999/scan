// System Breach Simulation - Main Script (Fixed Version)

// Application State
const state = {
    simulationActive: false,
    startTime: null,
    elapsedTime: 0,
    threatLevel: 0,
    errorCount: 0,
    fakeThreats: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    uploadSpeed: 0,
    downloadSpeed: 0,
    isFrozen: false,
    escapeUnlocked: false,
    terminalLines: [],
    errorInterval: null,
    freezeInterval: null,
    soundEnabled: true,
    currentStage: 0,
    bitcoinShown: false,
    bsodTriggered: false,
    audioContext: null
};

// DOM Elements
const elements = {
    // Screens
    warningScreen: document.getElementById('warningScreen'),
    hackingContainer: document.getElementById('hackingContainer'),
    bsod: document.getElementById('bsod'),
    revealScreen: document.getElementById('revealScreen'),
    loadingScreen: document.getElementById('loadingScreen'),
    loadingPercent: document.getElementById('loadingPercent'),
    
    // Warning screen
    startBtn: document.getElementById('startBtn'),
    
    // System info
    systemStatus: document.getElementById('systemStatus'),
    systemTime: document.getElementById('systemTime'),
    threatLevel: document.getElementById('threatLevel'),
    
    // Terminal
    terminalBody: document.getElementById('terminalBody'),
    
    // Monitors
    cpuFill: document.getElementById('cpuFill'),
    cpuCurrent: document.getElementById('cpuCurrent'),
    cpuPeak: document.getElementById('cpuPeak'),
    memoryFill: document.getElementById('memoryFill'),
    memoryUsed: document.getElementById('memoryUsed'),
    networkCanvas: document.getElementById('networkCanvas'),
    uploadSpeed: document.getElementById('uploadSpeed'),
    downloadSpeed: document.getElementById('downloadSpeed'),
    threatCount: document.getElementById('threatCount'),
    
    // Control buttons
    stopBtn: document.getElementById('stopBtn'),
    restoreBtn: document.getElementById('restoreBtn'),
    firewallBtn: document.getElementById('firewallBtn'),
    shutdownBtn: document.getElementById('shutdownBtn'),
    
    // Bitcoin demand
    bitcoinDemand: document.getElementById('bitcoinDemand'),
    countdown: document.getElementById('countdown'),
    
    // Error popups container
    errorPopups: document.getElementById('errorPopups'),
    
    // Escape
    escapeContainer: document.getElementById('escapeContainer'),
    escapeBtn: document.getElementById('escapeBtn'),
    
    // Reveal screen
    simDuration: document.getElementById('simDuration'),
    fakeThreats: document.getElementById('fakeThreats'),
    errorCount: document.getElementById('errorCount'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    closeBtn: document.getElementById('closeBtn')
};

// Audio functions using Web Audio API
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.initialized = false;
    }

    async init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume context (required for some browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.initialized = true;
            console.log("AudioManager initialized");
        } catch (error) {
            console.log("Web Audio API not supported or blocked:", error);
            this.initialized = false;
        }
    }

    // Create beep sound
    playBeep(frequency = 800, duration = 0.1, type = 'sine') {
        if (!this.initialized || !state.soundEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.log("Error playing beep:", error);
        }
    }

    // Create warning sound
    playWarning() {
        if (!this.initialized || !state.soundEnabled) return;
        
        try {
            // Create a more complex warning sound
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator1.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator1.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.5);
            
            oscillator2.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.5);
            
            oscillator1.type = 'sawtooth';
            oscillator2.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
            
            oscillator1.start(this.audioContext.currentTime);
            oscillator2.start(this.audioContext.currentTime);
            oscillator1.stop(this.audioContext.currentTime + 1);
            oscillator2.stop(this.audioContext.currentTime + 1);
        } catch (error) {
            console.log("Error playing warning:", error);
        }
    }

    // Create error sound
    playError() {
        if (!this.initialized || !state.soundEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
            
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (error) {
            console.log("Error playing error sound:", error);
        }
    }

    // Create static noise
    playStatic(duration = 2) {
        if (!this.initialized || !state.soundEnabled) return;
        
        try {
            const bufferSize = this.audioContext.sampleRate * duration;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            
            // Fill buffer with random noise
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            source.start();
        } catch (error) {
            console.log("Error playing static:", error);
        }
    }

    // Create hacking sound (continuous processing noise)
    startHackingSound() {
        if (!this.initialized || !state.soundEnabled) return null;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 120;
            
            // Create LFO for modulation
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            
            lfo.type = 'sine';
            lfo.frequency.value = 0.5;
            lfoGain.gain.value = 40;
            
            gainNode.gain.value = 0.05;
            
            oscillator.start();
            lfo.start();
            
            return { oscillator, gainNode, lfo, lfoGain };
        } catch (error) {
            console.log("Error starting hacking sound:", error);
            return null;
        }
    }

    stopHackingSound(sound) {
        if (sound) {
            try {
                sound.oscillator.stop();
                sound.lfo.stop();
                sound.gainNode.disconnect();
                sound.lfoGain.disconnect();
            } catch (error) {
                console.log("Error stopping hacking sound:", error);
            }
        }
    }
}

// Create global audio manager
const audioManager = new AudioManager();

// Error messages database
const errorMessages = [
    {
        title: "CRITICAL PROCESS DIED",
        message: "The system process C:\\Windows\\system32\\csrss.exe terminated unexpectedly."
    },
    {
        title: "MEMORY MANAGEMENT",
        message: "Your computer has a memory problem that could be caused by a virus."
    },
    {
        title: "SYSTEM SERVICE EXCEPTION",
        message: "What failed: win32kfull.sys. Your files may be at risk."
    },
    {
        title: "IRQL NOT LESS OR EQUAL",
        message: "A driver or system service accessed an invalid memory address."
    },
    {
        title: "KERNEL SECURITY CHECK FAILURE",
        message: "This is often caused by corrupted system files or malware."
    },
    {
        title: "VIDEO TDR FAILURE",
        message: "The display driver failed to respond. Screen may freeze."
    },
    {
        title: "DPC WATCHDOG VIOLATION",
        message: "A driver took too long to complete its task."
    },
    {
        title: "DRIVER IRQL NOT LESS OR EQUAL",
        message: "A driver tried to access an invalid memory address."
    },
    {
        title: "UNEXPECTED STORE EXCEPTION",
        message: "Windows encountered an error while writing to disk."
    },
    {
        title: "WHEA UNCORRECTABLE ERROR",
        message: "A hardware error has occurred. This could be due to overheating."
    }
];

// Terminal commands simulation
const terminalCommands = [
    "> Scanning system files...",
    "> Detecting malware signatures...",
    "> Checking registry entries...",
    "> Analyzing network traffic...",
    "> WARNING: Trojan.Generic.457832 detected in system32",
    "> ALERT: Suspicious process found: svchost.exe (PID: 7845)",
    "> Attempting to quarantine threat...",
    "> ERROR: Quarantine failed. Threat is active.",
    "> Scanning memory for rootkits...",
    "> Rootkit.HiddenProcess detected in kernel memory",
    "> Attempting to remove rootkit...",
    "> ERROR: Removal failed. Rootkit is protecting itself.",
    "> Checking firewall status...",
    "> WARNING: Firewall has been disabled by threat",
    "> Scanning startup programs...",
    "> 3 unknown startup entries found",
    "> Checking for encryption ransomware...",
    "> ALERT: Cryptolocker signature detected",
    "> System integrity compromised",
    "> Initiating emergency protocols...",
    "> ERROR: Emergency protocols blocked by threat",
    "> System breach confirmed",
    "> Threat level: CRITICAL"
];

// Initialize the simulation
async function init() {
    console.log("Initializing SYSTEM BREACH simulation...");
        
    // Set up event listeners
    setupEventListeners();
    
    // Initialize system time
    updateSystemTime();
    setInterval(updateSystemTime, 1000);
    
    // Initialize network graph
    initNetworkGraph();
    
    console.log("SYSTEM BREACH simulation initialized. Ready to start.");
}

// Set up event listeners
function setupEventListeners() {
    // Start simulation button
    elements.startBtn.addEventListener('click', startSimulation);
    
    // Control buttons (don't work properly)
    elements.stopBtn.addEventListener('click', () => fakeButtonEffect(elements.stopBtn, "STOPPING..."));
    elements.restoreBtn.addEventListener('click', () => fakeButtonEffect(elements.restoreBtn, "RESTORING..."));
    elements.firewallBtn.addEventListener('click', () => fakeButtonEffect(elements.firewallBtn, "ACTIVATING..."));
    elements.shutdownBtn.addEventListener('click', triggerBSOD);
    
    // Escape button
    elements.escapeBtn.addEventListener('click', endSimulation);
    
    // Reveal screen buttons
    elements.playAgainBtn.addEventListener('click', () => location.reload());
    elements.closeBtn.addEventListener('click', () => elements.revealScreen.style.display = 'none');
    
    // Make close button on bitcoin demand close it
    elements.bitcoinDemand.addEventListener('click', () => {
        elements.bitcoinDemand.style.display = 'none';
    });
    
    // Make BSOD clickable to proceed
    elements.bsod.addEventListener('click', () => {
        elements.bsod.style.display = 'none';
        showRevealScreen();
    });
    
    // Keyboard shortcuts for escape
    document.addEventListener('keydown', (e) => {
        // Ctrl+Alt+E to escape
        if (e.ctrlKey && e.altKey && e.key === 'E') {
            endSimulation();
        }
        
        // Space to trigger BSOD
        if (e.code === 'Space' && state.simulationActive) {
            triggerBSOD();
        }
        
        // Escape key to show escape button early
        if (e.key === 'Escape' && !state.escapeUnlocked) {
            elements.escapeContainer.style.display = 'block';
            state.escapeUnlocked = true;
        }
    });
}

// Start the simulation
async function startSimulation() {
    console.log("Starting simulation...");

    // Initialize audio on user interaction (avoids autoplay restrictions)
    if (!audioManager.initialized) {
        await audioManager.init();
        audioManager.playWarning();
    }
    
    // Show loading screen
    elements.loadingScreen.style.display = 'flex';
    
    // Simulate loading - FIXED VERSION
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 5 + Math.random() * 15; // Much faster progress
        
        if (progress > 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            // Hide loading and warning screens
            elements.loadingScreen.style.display = 'none';
            elements.warningScreen.style.display = 'none';
            
            // Show hacking interface
            elements.hackingContainer.style.display = 'block';
            
            // Add hacking cursor
            document.body.classList.add('hacking-active');
            
            // Initialize simulation
            state.simulationActive = true;
            state.startTime = new Date();
            
            // Start simulation sequences
            startTerminalSequence();
            startMonitorUpdates();
            startErrorPopups();
            startStageProgression();
            
            // Start hacking sound
            state.hackingSound = audioManager.startHackingSound();
            
            // Show escape container after 30 seconds
            setTimeout(() => {
                elements.escapeContainer.style.display = 'block';
                state.escapeUnlocked = true;
                audioManager.playBeep(600, 0.2);
            }, 30000);
        }
        
        elements.loadingPercent.textContent = `${Math.floor(progress)}%`;
        
    }, 50); // Much faster interval
}

// Update system time display
function updateSystemTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    elements.systemTime.textContent = timeString;
}

// Initialize network graph
function initNetworkGraph() {
    const canvas = elements.networkCanvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    // Draw initial graph
    drawNetworkGraph(ctx, canvas.width, canvas.height);
}

// Draw network activity graph
function drawNetworkGraph(ctx, width, height) {
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw network activity
    const dataPoints = 50;
    const sliceWidth = width / dataPoints;
    let x = 0;
    
    ctx.strokeStyle = state.uploadSpeed > 100 ? '#ff3333' : '#00ff41';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < dataPoints; i++) {
        // Simulate network activity
        const time = Date.now() / 1000;
        const uploadVariation = Math.sin(time + i * 0.5) * 30;
        const downloadVariation = Math.cos(time + i * 0.3) * 20;
        const threatVariation = state.threatLevel * 0.5;
        
        const y = height/2 + uploadVariation + downloadVariation + threatVariation;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    ctx.stroke();
    
    // Draw additional noise for high threat levels
    if (state.threatLevel > 50) {
        ctx.strokeStyle = 'rgba(255, 51, 51, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        x = 0;
        for (let i = 0; i < dataPoints; i++) {
            const noise = (Math.random() - 0.5) * 100 * (state.threatLevel / 100);
            const y = height/2 + noise;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        ctx.stroke();
    }
}

// Start terminal command sequence
function startTerminalSequence() {
    let lineIndex = 0;
    
    const addTerminalLine = () => {
        if (!state.simulationActive) return;
        
        if (lineIndex < terminalCommands.length) {
            // Remove blinking cursor
            const blinkingCursor = elements.terminalBody.querySelector('.blink');
            if (blinkingCursor) {
                blinkingCursor.remove();
            }
            
            // Add new line
            const newLine = document.createElement('div');
            newLine.className = 'terminal-line';
            newLine.textContent = terminalCommands[lineIndex];
            elements.terminalBody.appendChild(newLine);
            
            // Add blinking cursor back
            const cursor = document.createElement('div');
            cursor.className = 'terminal-line blink';
            cursor.textContent = '> _';
            elements.terminalBody.appendChild(cursor);
            
            // Scroll to bottom
            elements.terminalBody.scrollTop = elements.terminalBody.scrollHeight;
            
            lineIndex++;
            
            // Random interval between lines
            const nextDelay = Math.random() * 800 + 300;
            setTimeout(addTerminalLine, nextDelay);
        } else {
            // Loop terminal
            setTimeout(() => {
                lineIndex = 0;
                elements.terminalBody.innerHTML = '';
                addTerminalLine();
            }, 3000);
        }
    };
    
    addTerminalLine();
}

// Start updating system monitors
function startMonitorUpdates() {
    const monitorInterval = setInterval(() => {
        if (!state.simulationActive) {
            clearInterval(monitorInterval);
            return;
        }
        
        // Update CPU usage (random spikes)
        const time = Date.now() / 1000;
        const cpuBase = 20 + Math.sin(time) * 8;
        const cpuSpike = state.threatLevel > 50 ? Math.random() * 40 : 0;
        const cpuRandom = Math.random() * 10;
        state.cpuUsage = Math.min(cpuBase + cpuSpike + cpuRandom, 99);
        
        // Update elements if they exist
        if (elements.cpuFill) {
            elements.cpuFill.style.width = `${state.cpuUsage}%`;
            elements.cpuFill.textContent = `${Math.floor(state.cpuUsage)}%`;
        }
        if (elements.cpuCurrent) {
            elements.cpuCurrent.textContent = `${Math.floor(state.cpuUsage)}%`;
        }
        
        // Track CPU peak
        if (elements.cpuPeak) {
            if (!elements.cpuPeak.dataset.peak || state.cpuUsage > parseFloat(elements.cpuPeak.dataset.peak)) {
                elements.cpuPeak.dataset.peak = state.cpuUsage;
                elements.cpuPeak.textContent = `${Math.floor(state.cpuUsage)}%`;
            }
        }
        
        // Update memory usage (gradually increasing)
        state.memoryUsage = Math.min(30 + state.threatLevel * 0.7, 98);
        const memoryGB = (16 * state.memoryUsage / 100).toFixed(1);
        
        if (elements.memoryFill) {
            elements.memoryFill.style.width = `${state.memoryUsage}%`;
            elements.memoryFill.textContent = `${Math.floor(state.memoryUsage)}%`;
        }
        if (elements.memoryUsed) {
            elements.memoryUsed.textContent = `${memoryGB} GB`;
        }
        
        // Update network speeds
        state.uploadSpeed = Math.random() * 300 + 50 + (state.threatLevel * 2);
        state.downloadSpeed = Math.random() * 800 + 100 + (state.threatLevel * 3);
        
        if (elements.uploadSpeed) {
            elements.uploadSpeed.textContent = `${Math.floor(state.uploadSpeed)} KB/s`;
        }
        if (elements.downloadSpeed) {
            elements.downloadSpeed.textContent = `${Math.floor(state.downloadSpeed)} KB/s`;
        }
        
        // Update network graph
        const canvas = elements.networkCanvas;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            drawNetworkGraph(ctx, canvas.width, canvas.height);
        }
        
        // Update threat count
        state.fakeThreats = Math.floor(state.threatLevel / 10) + 1;
        if (elements.threatCount) {
            elements.threatCount.textContent = state.fakeThreats;
        }
        
        // Update threat level display
        let threatText = 'LOW';
        let threatColor = '#00ff41';
        
        if (state.threatLevel > 30) {
            threatText = 'MEDIUM';
            threatColor = '#ffcc00';
        }
        if (state.threatLevel > 60) {
            threatText = 'HIGH';
            threatColor = '#ff6600';
        }
        if (state.threatLevel > 80) {
            threatText = 'CRITICAL';
            threatColor = '#ff3333';
        }
        
        if (elements.threatLevel) {
            elements.threatLevel.textContent = threatText;
            elements.threatLevel.style.color = threatColor;
        }
        
        // Update system status
        if (elements.systemStatus) {
            if (state.threatLevel > 50) {
                elements.systemStatus.textContent = '● COMPROMISED';
                elements.systemStatus.style.color = '#ff3333';
            } else if (state.threatLevel > 20) {
                elements.systemStatus.textContent = '● AT RISK';
                elements.systemStatus.style.color = '#ffcc00';
            }
        }
        
    }, 800);
}

// Start generating error popups
function startErrorPopups() {
    state.errorInterval = setInterval(() => {
        if (!state.simulationActive) return;
        
        // Increase frequency based on threat level
        const chance = 0.3 + (state.threatLevel / 200);
        if (Math.random() < chance) {
            createErrorPopup();
            state.errorCount++;
        }
        
        // Randomly play error sound
        if (Math.random() < 0.4) {
            audioManager.playError();
        }
        
    }, Math.max(800, 3000 - state.threatLevel * 25));
}

// Create a random error popup
function createErrorPopup() {
    const error = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    
    const popup = document.createElement('div');
    popup.className = 'error-popup';
    
    // Random position (avoid edges)
    const maxX = Math.max(0, window.innerWidth - 300);
    const maxY = Math.max(0, window.innerHeight - 200);
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    
    popup.innerHTML = `
        <div class="error-popup-header">
            <i class="fas fa-exclamation-circle"></i>
            <span>${error.title}</span>
        </div>
        <div class="error-popup-body">
            ${error.message}
        </div>
    `;
    
    if (elements.errorPopups) {
        elements.errorPopups.appendChild(popup);
        
        // Remove after random time
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, Math.random() * 4000 + 2000);
    }
}

// Start stage progression
function startStageProgression() {
    // Gradually increase threat level
    const threatInterval = setInterval(() => {
        if (!state.simulationActive) {
            clearInterval(threatInterval);
            return;
        }
        
        state.threatLevel = Math.min(state.threatLevel + 2, 100);
        state.currentStage = Math.floor(state.threatLevel / 25);
        
        // Trigger stage-specific events
        triggerStageEvents();
        
        if (state.threatLevel >= 100) {
            clearInterval(threatInterval);
            // Auto-trigger BSOD at 100%
            setTimeout(triggerBSOD, 2000);
        }
    }, 10000); // Increase every 10 seconds (faster progression)
}

// Trigger events based on current stage
function triggerStageEvents() {
    switch(state.currentStage) {
        case 1: // 25% threat
            // Start file deletion simulation
            simulateFileDeletion();
            audioManager.playBeep(400, 0.3);
            break;
            
        case 2: // 50% threat
            // Show bitcoin demand
            if (!state.bitcoinShown) {
                showBitcoinDemand();
                state.bitcoinShown = true;
            }
            break;
            
        case 3: // 75% threat
            // Trigger screen freezes
            startScreenFreezes();
            audioManager.playStatic(1);
            break;
    }
}

// Simulate file deletion
function simulateFileDeletion() {
    const fileItems = document.querySelectorAll('.file-item');
    
    fileItems.forEach((item, index) => {
        setTimeout(() => {
            const status = item.querySelector('.file-status');
            
            // Randomly change status
            const statuses = ['deleting', 'corrupted', 'encrypting'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            status.className = 'file-status ' + newStatus;
            status.textContent = newStatus.toUpperCase();
            
            // Play beep sound
            audioManager.playBeep(300 + index * 100, 0.2);
            
            // Make file name red for deleting/encrypting
            if (newStatus === 'deleting' || newStatus === 'encrypting') {
                const fileName = item.querySelector('.file-name');
                fileName.style.color = '#ff3333';
                fileName.style.textDecoration = 'line-through';
            }
            
        }, index * 1500);
    });
}

// Show bitcoin ransom demand
function showBitcoinDemand() {
    if (!elements.bitcoinDemand) return;
    
    elements.bitcoinDemand.style.display = 'block';
    audioManager.playStatic(2);
    
    // Start countdown from 10 minutes (for demo purposes)
    let minutes = 9;
    let seconds = 59;
    
    const countdownInterval = setInterval(() => {
        if (!elements.countdown) {
            clearInterval(countdownInterval);
            return;
        }
        
        elements.countdown.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
        }
        
        // Flash red when under 5 minutes
        if (minutes < 5) {
            elements.countdown.style.animation = 'pulse 0.5s infinite';
        }
        
        if (minutes < 0) {
            clearInterval(countdownInterval);
            elements.bitcoinDemand.style.display = 'none';
        }
    }, 1000); // Real-time seconds
    
    // Hide after 30 seconds for demo
    setTimeout(() => {
        if (elements.bitcoinDemand.style.display === 'block') {
            elements.bitcoinDemand.style.display = 'none';
            clearInterval(countdownInterval);
        }
    }, 30000);
}

// Start screen freezes
function startScreenFreezes() {
    if (state.freezeInterval) return;
    
    state.freezeInterval = setInterval(() => {
        if (!state.simulationActive || state.isFrozen) return;
        
        // Random chance to freeze (increases with threat level)
        const freezeChance = 0.2 + (state.threatLevel / 200);
        if (Math.random() < freezeChance) {
            triggerScreenFreeze();
        }
    }, 8000); // Check every 8 seconds
}

// Trigger screen freeze
function triggerScreenFreeze() {
    if (state.isFrozen) return;
    
    state.isFrozen = true;
    
    // Add freeze effect
    document.body.classList.add('freeze');
    audioManager.playStatic(0.5);
    
    // Stop animations temporarily
    const animatedElements = document.querySelectorAll('*');
    animatedElements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.animationName !== 'none') {
            el.dataset.originalAnimationPlayState = computedStyle.animationPlayState;
            el.style.animationPlayState = 'paused';
        }
    });
    
    // Create visual glitch effect
    const glitchOverlay = document.createElement('div');
    glitchOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, 
            rgba(255, 0, 0, 0.1) 0%,
            rgba(0, 255, 0, 0.1) 50%,
            rgba(0, 0, 255, 0.1) 100%);
        mix-blend-mode: overlay;
        pointer-events: none;
        z-index: 10000;
    `;
    document.body.appendChild(glitchOverlay);
    
    // Unfreeze after random time
    setTimeout(() => {
        // Remove freeze effect
        document.body.classList.remove('freeze');
        if (glitchOverlay.parentNode) {
            glitchOverlay.remove();
        }
        
        // Restore animations
        animatedElements.forEach(el => {
            if (el.dataset.originalAnimationPlayState) {
                el.style.animationPlayState = el.dataset.originalAnimationPlayState;
                delete el.dataset.originalAnimationPlayState;
            }
        });
        
        state.isFrozen = false;
        
        // Add post-freeze glitch effect
        document.body.classList.add('glitch-effect');
        setTimeout(() => {
            document.body.classList.remove('glitch-effect');
        }, 800);
        
    }, Math.random() * 2000 + 1000);
}

// Trigger Blue Screen of Death
function triggerBSOD() {
    if (!state.simulationActive || state.bsodTriggered) return;
    
    state.bsodTriggered = true;
    state.simulationActive = false;
    
    // Clear intervals
    if (state.errorInterval) clearInterval(state.errorInterval);
    if (state.freezeInterval) clearInterval(state.freezeInterval);
    
    // Stop hacking sound
    if (state.hackingSound) {
        audioManager.stopHackingSound(state.hackingSound);
    }
    
    // Play error sound
    audioManager.playError();
    
    // Hide everything
    if (elements.hackingContainer) {
        elements.hackingContainer.style.display = 'none';
    }
    if (elements.escapeContainer) {
        elements.escapeContainer.style.display = 'none';
    }
    
    // Show BSOD
    if (elements.bsod) {
        elements.bsod.style.display = 'flex';
        
        // Simulate BSOD loading percentage
        const bsodPercent = elements.bsod.querySelector('.bsod-percent');
        if (bsodPercent) {
            let percent = 0;
            
            const bsodInterval = setInterval(() => {
                percent += Math.random() * 10 + 5;
                if (percent > 100) percent = 100;
                
                bsodPercent.textContent = `${Math.floor(percent)}% complete`;
                
                if (percent >= 100) {
                    clearInterval(bsodInterval);
                    
                    // Wait a moment then proceed to reveal screen
                    setTimeout(() => {
                        if (elements.bsod) {
                            elements.bsod.style.display = 'none';
                        }
                        showRevealScreen();
                    }, 1500);
                }
            }, 150);
        }
    } else {
        // If BSOD element doesn't exist, go directly to reveal
        setTimeout(showRevealScreen, 1000);
    }
}

// Fake button effect (buttons don't actually work)
function fakeButtonEffect(button, text) {
    const originalText = button.innerHTML;
    const originalBg = button.style.background;
    
    // Change button text
    button.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${text}`;
    button.style.background = 'linear-gradient(135deg, #ff3333, #cc0000)';
    button.disabled = true;
    
    // Play error sound
    audioManager.playError();
    
    // Revert after delay
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = originalBg;
        button.disabled = false;
        
        // Show error message
        createErrorPopup();
        
        // Increase threat level
        state.threatLevel = Math.min(state.threatLevel + 8, 100);
        
    }, 2500);
}

// Show the reveal screen
function showRevealScreen() {
    // Calculate simulation duration
    let duration = 0;
    if (state.startTime) {
        duration = Math.floor((new Date() - state.startTime) / 1000);
    }
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    if (elements.simDuration) {
        elements.simDuration.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    if (elements.fakeThreats) {
        elements.fakeThreats.textContent = state.fakeThreats;
    }
    if (elements.errorCount) {
        elements.errorCount.textContent = state.errorCount;
    }
    
    // Show reveal screen
    if (elements.revealScreen) {
        elements.revealScreen.style.display = 'flex';
        audioManager.playBeep(600, 0.5, 'sine');
    }
}

// End simulation (escape)
function endSimulation() {
    if (!state.escapeUnlocked) return;
    
    state.simulationActive = false;
    
    // Clear intervals
    if (state.errorInterval) clearInterval(state.errorInterval);
    if (state.freezeInterval) clearInterval(state.freezeInterval);
    
    // Stop hacking sound
    if (state.hackingSound) {
        audioManager.stopHackingSound(state.hackingSound);
    }
    
    // Show reveal screen
    showRevealScreen();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure everything is loaded
    setTimeout(init, 500);
});

// Add TV static overlay
const staticOverlay = document.createElement('div');
staticOverlay.className = 'tv-static';
document.body.appendChild(staticOverlay);

// Add secret console commands
console.log("%c⚠️ SYSTEM BREACH SIMULATION ACTIVATED ⚠️", "color: #ff3333; font-size: 20px; font-weight: bold;");
console.log("%cThis is a simulated hacking experience. Your system is safe.", "color: #00ff41; font-size: 14px;");
console.log("%cType 'simulation.help()' for available commands.", "color: #ffcc00; font-size: 12px;");

// Create simulation object for console commands
window.simulation = {
    help: function() {
        console.log("%c=== SYSTEM BREACH SIMULATION COMMANDS ===", "color: #00ff41; font-weight: bold;");
        console.log("%csimulation.skip() - Skip to end of simulation", "color: #ffcc00;");
        console.log("%csimulation.panic() - Trigger immediate BSOD", "color: #ffcc00;");
        console.log("%csimulation.toggleSound() - Toggle sound effects", "color: #ffcc00;");
        console.log("%csimulation.setThreat(level) - Set threat level (0-100)", "color: #ffcc00;");
        console.log("%csimulation.escape() - Show escape button immediately", "color: #ffcc00;");
    },
    
    skip: function() {
        if (state.simulationActive) {
            console.log("%cSkipping to end...", "color: #ffcc00;");
            triggerBSOD();
        } else {
            console.log("%cSimulation not active", "color: #ff3333;");
        }
    },
    
    panic: function() {
        console.log("%cPANIC MODE ACTIVATED!", "color: #ff3333; font-weight: bold;");
        triggerBSOD();
    },
    
    toggleSound: function() {
        state.soundEnabled = !state.soundEnabled;
        console.log(`%cSound ${state.soundEnabled ? 'ENABLED' : 'DISABLED'}`, 
            `color: ${state.soundEnabled ? '#00ff41' : '#ff3333'};`);
    },
    
    setThreat: function(level) {
        const newLevel = Math.min(Math.max(parseInt(level), 0), 100);
        state.threatLevel = newLevel;
        console.log(`%cThreat level set to ${newLevel}`, "color: #ffcc00;");
    },
    
    escape: function() {
        elements.escapeContainer.style.display = 'block';
        state.escapeUnlocked = true;
        console.log("%cEscape button revealed!", "color: #00ff41;");
    }
};  
