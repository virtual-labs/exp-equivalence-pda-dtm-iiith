// Main application initialization and utility functions
// for 2-Stack PDA and DTM Equivalence Experiment

// Global application object
window.pdaDtmApp = {
    debugMode: false,
    animationSpeed: 300,
    version: '2.0.0'
};

// Utility function to format state names for display
function formatStateName(state) {
    const stateNames = {
        'q0': 'Initial',
        'q1': 'Scanning',
        'q2': 'Backtrack',
        'q3': 'Accept',
        'qstart': 'Initial',
        'qread': 'Reading',
        'qreturn': 'Returning',
        'qcompare': 'Comparing',
        'qaccept': 'Accept',
        'qreject': 'Reject'
    };
    
    return stateNames[state] || state;
}

// Display control functions
function showMachineState(state) {
    const stateDisplay = document.getElementById('machine-status');
    if (!stateDisplay) return;
    
    const stateTexts = {
        'ready': '⏱️ Ready',
        'processing': '⚙️ Processing',
        'accepted': '✅ Accepted',
        'rejected': '❌ Rejected',
        'error': '⚠️ Error'
    };
    
    stateDisplay.textContent = stateTexts[state] || state;
    stateDisplay.className = `status-${state}`;
}

function highlightEquivalence() {
    // Add visual highlighting to show equivalence
    const elements = document.querySelectorAll('.pda-panel, .dtm-panel');
    elements.forEach(el => {
        el.classList.add('equivalence-highlight');
    });
    
    // Remove highlighting after animation
    setTimeout(() => {
        elements.forEach(el => {
            el.classList.remove('equivalence-highlight');
        });
    }, 2000);
}

function addSynchronizedAnimation() {
    const elements = document.querySelectorAll('.pda-state-info, .dtm-state-info');
    elements.forEach(el => {
        el.classList.add('synchronized-update');
    });
    
    setTimeout(() => {
        elements.forEach(el => {
            el.classList.remove('synchronized-update');
        });
    }, 600);
}

// Stack display functions
function updateStackDisplay(stackId, stackContents) {
    const stackEl = document.getElementById(stackId);
    if (!stackEl) return;
    
    stackEl.innerHTML = '';
    
    // Add stack contents from bottom to top
    stackContents.forEach((symbol, index) => {
        const symbolEl = document.createElement('div');
        symbolEl.className = `stack-symbol ${index === stackContents.length - 1 ? 'stack-top' : ''}`;
        symbolEl.textContent = symbol;
        symbolEl.setAttribute('data-stack-level', index);
        stackEl.appendChild(symbolEl);
    });
    
    // Add empty message if stack is empty
    if (stackContents.length === 0) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'stack-empty';
        emptyEl.textContent = 'ε';
        stackEl.appendChild(emptyEl);
    }
}

function animateStackOperation(stackId, operation, symbol = null) {
    const stackEl = document.getElementById(stackId);
    if (!stackEl) return;
    
    if (operation === 'push' && symbol) {
        // Create temporary element for push animation
        const tempEl = document.createElement('div');
        tempEl.className = 'stack-symbol push-animation';
        tempEl.textContent = symbol;
        tempEl.style.opacity = '0';
        tempEl.style.transform = 'translateY(-20px)';
        
        stackEl.appendChild(tempEl);
        
        // Animate in
        setTimeout(() => {
            tempEl.style.opacity = '1';
            tempEl.style.transform = 'translateY(0)';
        }, 50);
        
    } else if (operation === 'pop') {
        // Animate top element out
        const topElement = stackEl.querySelector('.stack-top');
        if (topElement) {
            topElement.style.opacity = '0';
            topElement.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                if (topElement.parentNode) {
                    topElement.parentNode.removeChild(topElement);
                }
            }, 300);
        }
    }
}

// Tape display functions
function updateTapeDisplay(tape, headPosition) {
    const tapeEl = document.getElementById('dtm-tape');
    const headEl = document.getElementById('tape-head');
    
    if (!tapeEl || !headEl) return;
    
    tapeEl.innerHTML = '';
    
    // Create tape cells with proper highlighting
    tape.forEach((symbol, index) => {
        const cellEl = document.createElement('div');
        cellEl.className = 'tape-cell';
        cellEl.textContent = symbol;
        cellEl.setAttribute('data-position', index);
        
        // Highlight the current head position
        if (index === headPosition) {
            cellEl.classList.add('current');
        }
        
        // Make blank symbols more visible
        if (symbol === '⊔') {
            cellEl.classList.add('blank');
        }
        
        tapeEl.appendChild(cellEl);
    });
    
    // Position the head indicator under the current cell
    if (headEl) {
        // Calculate position based on cell width (42px) + borders/gaps
        const cellWidth = 42;
        const leftPosition = headPosition * cellWidth + cellWidth/2;
        headEl.style.left = `${leftPosition}px`;
        headEl.style.display = 'block';
        
        // Add a pulse animation to make it more visible
        headEl.classList.add('pulse');
        setTimeout(() => {
            headEl.classList.remove('pulse');
        }, 600);
    }
}

function animateTapeOperation(operation, position, symbol = null) {
    const tapeEl = document.getElementById('dtm-tape');
    const headEl = document.getElementById('tape-head');
    
    if (!tapeEl || !headEl) return;
    
    if (operation === 'move') {
        // Remove current highlighting from all cells
        const allCells = tapeEl.querySelectorAll('.tape-cell.current');
        allCells.forEach(cell => cell.classList.remove('current'));
        
        // Add current highlighting to new position
        const newCell = tapeEl.querySelector(`[data-position="${position}"]`);
        if (newCell) {
            newCell.classList.add('current');
        }
        
        // Animate head movement with bounce effect
        const cellWidth = 42;
        const leftPosition = position * cellWidth + cellWidth/2;
        headEl.style.left = `${leftPosition}px`;
        headEl.classList.add('moving');
        
        setTimeout(() => {
            headEl.classList.remove('moving');
        }, 500);
        
    } else if (operation === 'write' && symbol !== null) {
        // Animate symbol change with flash effect
        const cellEl = tapeEl.querySelector(`[data-position="${position}"]`);
        if (cellEl) {
            cellEl.classList.add('writing');
            
            // Flash effect
            setTimeout(() => {
                cellEl.textContent = symbol;
                cellEl.classList.add('flash');
                setTimeout(() => {
                    cellEl.classList.remove('writing', 'flash');
                }, 200);
            }, 150);
        }
    }
}

// Initialize simulation function that creates StepByStepSimulation instance
function initializeSimulation(testString) {
    try {
        return new StepByStepSimulation(testString);
    } catch (error) {
        console.error('Failed to initialize simulation:', error);
        return null;
    }
}

// Validation and test functions
function validateSimulationStep(stepData) {
    if (!stepData) return false;
    
    // Basic validation
    if (!stepData.pda || !stepData.dtm) return false;
    if (typeof stepData.stepNumber !== 'number') return false;
    
    // State validation
    const validPDAStates = ['q0', 'q1', 'q2', 'q3', 'qreject'];
    const validDTMStates = ['qstart', 'qread', 'qreturn', 'qcompare', 'qaccept', 'qreject'];
    
    if (!validPDAStates.includes(stepData.pda.state)) {
        console.warn('Invalid PDA state:', stepData.pda.state);
        return false;
    }
    
    if (!validDTMStates.includes(stepData.dtm.state)) {
        console.warn('Invalid DTM state:', stepData.dtm.state);
        return false;
    }
    
    return true;
}

// Debug utilities
function enableDebugMode() {
    window.pdaDtmApp.debugMode = true;
    console.log('Debug mode enabled');
}

function disableDebugMode() {
    window.pdaDtmApp.debugMode = false;
    console.log('Debug mode disabled');
}

function logSimulationState(stepData) {
    if (!window.pdaDtmApp.debugMode) return;
    
    console.group(`Step ${stepData.stepNumber}`);
    console.log('Description:', stepData.description);
    console.log('PDA State:', stepData.pda);
    console.log('DTM State:', stepData.dtm);
    console.groupEnd();
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('2-Stack PDA ≡ DTM Equivalence Experiment v' + window.pdaDtmApp.version);
    
    // Set up global error handling
    window.addEventListener('error', (e) => {
        console.error('Application error:', e.error);
        showMachineState('error');
    });
    
    // Set up keyboard shortcuts info
    const helpText = `
    Keyboard Shortcuts:
    - H: Show Hint
    - C: Auto-Correct
    - R: Reset
    - P: Previous Step
    `;
    
    // Add help tooltip or info
    const helpBtn = document.querySelector('.help-btn');
    if (helpBtn) {
        helpBtn.title = helpText;
    }
});

// Export utility functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatStateName,
        showMachineState,
        updateStackDisplay,
        updateTapeDisplay,
        validateSimulationStep,
        initializeSimulation
    };
}
