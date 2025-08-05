// Helper functions for 2-Stack PDA and DTM Equivalence Experiment

/**
 * Utility function to animate stack operations
 */
function animateStackOperation(stackId, operation, element = null) {
    const stack = document.getElementById(stackId);
    if (!stack) return;

    if (operation === 'push' && element) {
        const stackEl = document.createElement('div');
        stackEl.className = 'stack-element';
        stackEl.textContent = element;
        
        // Insert before the bottom element
        const bottom = stack.querySelector('.stack-bottom');
        stack.insertBefore(stackEl, bottom);
        
        // Add animation class
        stack.classList.add('stack-push-animation');
        setTimeout(() => stack.classList.remove('stack-push-animation'), 800);
        
    } else if (operation === 'pop') {
        const elements = stack.querySelectorAll('.stack-element');
        if (elements.length > 0) {
            const topElement = elements[elements.length - 1];
            topElement.classList.add('popping');
            
            stack.classList.add('stack-pop-animation');
            setTimeout(() => {
                stack.classList.remove('stack-pop-animation');
                if (topElement.parentNode) {
                    topElement.parentNode.removeChild(topElement);
                }
            }, 300);
        }
    }
}

/**
 * Update visual stack representation
 */
function updateStackDisplay(stackId, stackArray) {
    const stackContainer = document.getElementById(stackId);
    if (!stackContainer) return;
    
    // Clear existing elements except bottom
    const elements = stackContainer.querySelectorAll('.stack-element');
    elements.forEach(el => el.remove());
    
    // Add elements from array (excluding bottom symbol)
    const bottom = stackContainer.querySelector('.stack-bottom');
    for (let i = 1; i < stackArray.length; i++) {
        const stackEl = document.createElement('div'); 
        stackEl.className = 'stack-element';
        stackEl.textContent = stackArray[i];
        stackContainer.insertBefore(stackEl, bottom);
    }
}

/**
 * Animate tape operations
 */
function animateTapeOperation(operation, position, value = null) {
    const tape = document.getElementById('dtm-tape');
    const head = document.getElementById('tape-head');
    
    if (operation === 'move') {
        // Move head to new position
        const cells = tape.querySelectorAll('.tape-cell');
        if (cells[position]) {
            const cellRect = cells[position].getBoundingClientRect();
            const tapeRect = tape.getBoundingClientRect();
            const relativePos = cellRect.left - tapeRect.left + cellRect.width / 2;
            
            head.style.left = relativePos + 'px';
            head.classList.add('tape-head-moving');
            setTimeout(() => head.classList.remove('tape-head-moving'), 500);
        }
        
        // Update current cell highlighting
        cells.forEach((cell, index) => {
            cell.classList.toggle('current', index === position);
        });
        
    } else if (operation === 'write' && value !== null) {
        const cells = tape.querySelectorAll('.tape-cell');
        if (cells[position]) {
            cells[position].textContent = value === '⊔' ? '' : value;
            cells[position].classList.add('tape-cell-write');
            setTimeout(() => cells[position].classList.remove('tape-cell-write'), 600);
        }
    }
}

/**
 * Update tape display
 */
function updateTapeDisplay(tapeArray, headPosition) {
    const tapeContainer = document.getElementById('dtm-tape');
    const head = document.getElementById('tape-head');
    
    if (!tapeContainer || !head) return;
    
    // Clear existing cells
    tapeContainer.innerHTML = '';
    
    // Create cells
    const visibleRange = 15; // Show 15 cells total
    const startPos = Math.max(0, headPosition - Math.floor(visibleRange / 2));
    
    for (let i = 0; i < visibleRange; i++) {
        const cellIndex = startPos + i;
        const cell = document.createElement('div');
        cell.className = 'tape-cell';
        
        if (cellIndex < tapeArray.length) {
            const symbol = tapeArray[cellIndex];
            cell.textContent = symbol === '⊔' ? '' : symbol;
            if (symbol === '⊔') cell.classList.add('blank');
        } else {
            cell.classList.add('blank');
        }
        
        if (cellIndex === headPosition) {
            cell.classList.add('current');
        }
        
        tapeContainer.appendChild(cell);
    }
    
    // Position head
    const cells = tapeContainer.querySelectorAll('.tape-cell');
    const headCellIndex = headPosition - startPos;
    
    // Ensure the head position is within the visible range
    if (headCellIndex >= 0 && headCellIndex < cells.length) {
        const targetCell = cells[headCellIndex];
        if (targetCell) {
            const cellRect = targetCell.getBoundingClientRect();
            const tapeRect = tapeContainer.getBoundingClientRect();
            const relativePos = cellRect.left - tapeRect.left + cellRect.width / 2;
            head.style.left = relativePos + 'px';
            head.style.display = 'block';
        }
    } else {
        // Hide head if position is outside visible range
        head.style.display = 'none';
    }
}

/**
 * Update remaining input display with highlighting
 */
function updateRemainingInput(inputElement, remainingInput, currentIndex = 0) {
    if (!inputElement) return;
    
    if (remainingInput === '') {
        inputElement.innerHTML = '<span class="input-consumed">ε</span>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < remainingInput.length; i++) {
        const char = remainingInput[i];
        if (i === 0) {
            html += `<span class="current-input">${char}</span>`;
        } else {
            html += char;
        }
    }
    
    inputElement.innerHTML = html;
}

/**
 * Show step-by-step comparison
 */
function updateComparisonDisplay(stepData) {
    const comparisonEl = document.getElementById('comparison-display');
    if (!comparisonEl || !stepData) return;
    
    comparisonEl.innerHTML = `
        <div class="step-info">
            <h4>Step ${stepData.stepNumber}</h4>
            <p>${stepData.comparison}</p>
        </div>
        <div class="machine-states">
            <div class="pda-state">
                <strong>2-Stack PDA:</strong> ${stepData.pda.transition}
                <br><small>State: ${stepData.pda.state}, Input: ${stepData.pda.remainingInput || 'ε'}</small>
            </div>
            <div class="dtm-state">
                <strong>DTM:</strong> ${stepData.dtm.transition}
                <br><small>State: ${stepData.dtm.state}, Head: ${stepData.dtm.headPosition}</small>
            </div>
        </div>
    `;
}

/**
 * Highlight equivalence between machines
 */
function highlightEquivalence() {
    const pdaPanel = document.querySelector('.pda-panel');
    const dtmPanel = document.querySelector('.dtm-panel');
    
    if (pdaPanel && dtmPanel) {
        pdaPanel.classList.add('equivalence-highlight');
        dtmPanel.classList.add('equivalence-highlight');
        
        setTimeout(() => {
            pdaPanel.classList.remove('equivalence-highlight');
            dtmPanel.classList.remove('equivalence-highlight');
        }, 2000);
    }
}

/**
 * Show success or error states
 */
function showMachineState(state) {
    const pdaPanel = document.querySelector('.pda-panel');
    const dtmPanel = document.querySelector('.dtm-panel');
    const statusEl = document.getElementById('machine-status');
    
    if (state === 'accepted') {
        if (pdaPanel) pdaPanel.classList.add('success-state');
        if (dtmPanel) dtmPanel.classList.add('success-state');
        if (statusEl) statusEl.textContent = 'Accepted';
        
        setTimeout(() => {
            if (pdaPanel) pdaPanel.classList.remove('success-state');
            if (dtmPanel) dtmPanel.classList.remove('success-state');
        }, 1000);
        
    } else if (state === 'rejected') {
        if (pdaPanel) pdaPanel.classList.add('error-state');
        if (dtmPanel) dtmPanel.classList.add('error-state');
        if (statusEl) statusEl.textContent = 'Rejected';
        
        setTimeout(() => {
            if (pdaPanel) pdaPanel.classList.remove('error-state');
            if (dtmPanel) dtmPanel.classList.remove('error-state');
        }, 800);
        
    } else if (state === 'processing') {
        if (statusEl) statusEl.textContent = 'Processing';
        
    } else if (state === 'ready') {
        if (statusEl) statusEl.textContent = 'Ready';
    }
}

/**
 * Add synchronized animation to both machines
 */
function addSynchronizedAnimation() {
    const pdaElements = document.querySelectorAll('.pda-container .current-state, .pda-container .transition-info');
    const dtmElements = document.querySelectorAll('.dtm-container .current-state, .dtm-container .transition-info');
    
    [...pdaElements, ...dtmElements].forEach(el => {
        el.classList.add('synchronized-step');
        setTimeout(() => el.classList.remove('synchronized-step'), 1000);
    });
}

/**
 * Format state names for display
 */
function formatStateName(state) {
    const subscriptMap = {
        'q0': 'q₀',
        'q1': 'q₁', 
        'q2': 'q₂',
        'q3': 'q₃',
        'q4': 'q₄',
        'q5': 'q₅',
        'qaccept': 'qₐccₑₚₜ',
        'qreject': 'qᵣₑⱼₑcₜ'
    };
    
    return subscriptMap[state] || state;
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Smooth scroll to element
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
        });
    }
}

/**
 * Export functions for use in other files
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        animateStackOperation,
        updateStackDisplay,
        animateTapeOperation,
        updateTapeDisplay,
        updateRemainingInput,
        updateComparisonDisplay,
        highlightEquivalence,
        showMachineState,
        addSynchronizedAnimation,
        formatStateName,
        debounce,
        scrollToElement
    };
}
