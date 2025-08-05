// Interactive functionality for 2-Stack PDA and DTM Equivalence Experiment
// Choice-based learning system

class InteractiveEquivalenceSimulator {
    constructor() {
        this.currentTestString = 'ab#ab';
        this.simulation = null;
        this.waitingForChoice = { pda: false, dtm: false };
        this.lastSelections = { pda: null, dtm: null };
        this.isComplete = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadTestString(this.currentTestString);
    }
    
    initializeElements() {
        // Control elements
        this.testStringSelect = document.getElementById('test-string-select');
        this.resetBtn = document.getElementById('reset-btn');
        this.showHintBtn = document.getElementById('show-hint-btn');
        this.autoCorrectBtn = document.getElementById('auto-correct-btn');
        this.previousStepBtn = document.getElementById('previous-step-btn');
        
        // Status elements
        this.currentStepEl = document.getElementById('current-step');
        this.machineStatusEl = document.getElementById('machine-status');
        this.currentModeEl = document.getElementById('current-mode');
        
        // PDA elements
        this.pdaCurrentState = document.getElementById('pda-current-state');
        this.pdaRemainingInput = document.getElementById('pda-remaining-input');
        this.pdaChoices = document.getElementById('pda-choices');
        this.pdaFeedback = document.getElementById('pda-feedback');
        this.leftStack = document.getElementById('left-stack');
        this.rightStack = document.getElementById('right-stack');
        
        // DTM elements
        this.dtmCurrentState = document.getElementById('dtm-current-state');
        this.dtmHeadPosition = document.getElementById('dtm-head-position');
        this.dtmChoices = document.getElementById('dtm-choices');
        this.dtmFeedback = document.getElementById('dtm-feedback');
        this.dtmTape = document.getElementById('dtm-tape');
        this.tapeHead = document.getElementById('tape-head');
        
        // Comparison element
        this.comparisonDisplay = document.getElementById('comparison-display');
    }
    
    setupEventListeners() {
        // Test string selection
        this.testStringSelect?.addEventListener('change', (e) => {
            this.loadTestString(e.target.value);
        });
        
        // Control buttons
        this.resetBtn?.addEventListener('click', () => this.reset());
        this.showHintBtn?.addEventListener('click', () => this.showHint());
        this.autoCorrectBtn?.addEventListener('click', () => this.autoCorrect());
        this.previousStepBtn?.addEventListener('click', () => this.previousStep());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            
            switch(e.key) {
                case 'h':
                case 'H':
                    e.preventDefault();
                    this.showHint();
                    break;
                case 'c':
                case 'C':
                    e.preventDefault();
                    this.autoCorrect();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    this.reset();
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    this.previousStep();
                    break;
            }
        });
    }
    
    loadTestString(testString) {
        this.currentTestString = testString;
        this.simulation = initializeSimulation(testString);
        this.reset();
        
        // Update UI to show selected string
        if (this.testStringSelect) {
            this.testStringSelect.value = testString;
        }
    }
    
    reset() {
        if (this.simulation) {
            this.simulation.currentStep = 0;
        }
        this.waitingForChoice = { pda: false, dtm: false };
        this.lastSelections = { pda: null, dtm: null };
        this.isComplete = false;
        
        this.updateDisplay();
        this.updateChoices();
        this.updateStatus();
        this.clearFeedback();
        
        // Reset button states
        this.updateButtonStates();
    }
    
    updateDisplay() {
        if (!this.simulation) return;
        
        const currentStep = this.simulation.getCurrentStep();
        if (!currentStep) return;
        
        // Update PDA display
        if (this.pdaCurrentState) {
            this.pdaCurrentState.textContent = formatStateName(currentStep.pda.state);
        }
        
        if (this.pdaRemainingInput) {
            this.pdaRemainingInput.textContent = currentStep.pda.remainingInput || 'ε';
        }
        
        // Update stack displays
        updateStackDisplay('left-stack', currentStep.pda.leftStack);
        updateStackDisplay('right-stack', currentStep.pda.rightStack);
        
        // Update DTM display
        if (this.dtmCurrentState) {
            this.dtmCurrentState.textContent = formatStateName(currentStep.dtm.state);
        }
        
        if (this.dtmHeadPosition) {
            this.dtmHeadPosition.textContent = currentStep.dtm.headPosition;
        }
        
        // Update tape display
        updateTapeDisplay(currentStep.dtm.tape, currentStep.dtm.headPosition);
        
        // Update comparison
        this.updateComparison(currentStep);
    }
    
    updateChoices() {
        if (!this.simulation) return;
        
        const choices = this.simulation.getCurrentChoices();
        if (!choices) {
            this.showCompletion();
            return;
        }
        
        // Update PDA choices
        this.renderChoices('pda', choices.pda);
        
        // Update DTM choices  
        this.renderChoices('dtm', choices.dtm);
        
        // Reset waiting states
        this.waitingForChoice = { pda: true, dtm: true };
    }
    
    renderChoices(machine, choiceList) {
        const container = machine === 'pda' ? this.pdaChoices : this.dtmChoices;
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!choiceList || choiceList.length === 0) {
            container.innerHTML = '<div class="no-choices">No choices available</div>';
            return;
        }
        
        choiceList.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            button.setAttribute('data-choice-index', index);
            button.setAttribute('data-machine', machine);
            
            button.addEventListener('click', () => {
                // Allow re-selection even if choice was already made (for correction)
                this.selectChoice(machine, index);
            });
            
            container.appendChild(button);
        });
    }
    
    selectChoice(machine, choiceIndex) {
        if (!this.simulation) return;
        
        // Mark this choice as selected
        this.lastSelections[machine] = choiceIndex;
        
        // Visual feedback for selection
        const container = machine === 'pda' ? this.pdaChoices : this.dtmChoices;
        const buttons = container.querySelectorAll('.choice-button');
        buttons.forEach((btn, idx) => {
            btn.classList.remove('selected', 'correct', 'incorrect');
            if (idx === choiceIndex) {
                btn.classList.add('selected');
            }
        });
        
        // Validate the choice
        const validation = this.simulation.validateChoice(machine, choiceIndex);
        if (validation) {
            this.showFeedback(machine, validation);
            
            // Mark button as correct or incorrect
            const selectedButton = buttons[choiceIndex];
            if (selectedButton) {
                selectedButton.classList.add(validation.correct ? 'correct' : 'incorrect');
            }
            
            // Update waiting state based on correctness
            this.waitingForChoice[machine] = !validation.correct;
        }
        
        // Check if both machines have made correct selections
        const bothSelected = this.lastSelections.pda !== null && this.lastSelections.dtm !== null;
        if (bothSelected) {
            const pdaValidation = this.simulation.validateChoice('pda', this.lastSelections.pda);
            const dtmValidation = this.simulation.validateChoice('dtm', this.lastSelections.dtm);
            
            if (pdaValidation?.correct && dtmValidation?.correct) {
                // Both correct - advance to next step
                this.waitingForChoice = { pda: false, dtm: false };
                
                // Show success message
                this.showTransitionMessage("Great! Both choices are correct. Advancing to next step...");
                
                setTimeout(() => {
                    this.advanceStep();
                }, 1500);
            } else {
                // At least one incorrect - show encouragement to try again
                this.updateButtonStates();
                
                // Add visual indication that incorrect choices can be changed
                if (!pdaValidation?.correct) {
                    this.waitingForChoice.pda = true;
                }
                if (!dtmValidation?.correct) {
                    this.waitingForChoice.dtm = true;
                }
                
                // Show progress message
                const correctCount = (pdaValidation?.correct ? 1 : 0) + (dtmValidation?.correct ? 1 : 0);
                if (correctCount === 1) {
                    this.showTransitionMessage("One correct choice! Fix the other choice to continue.");
                }
            }
        }
        
        this.updateButtonStates();
    }
    
    showFeedback(machine, validation) {
        const feedbackEl = machine === 'pda' ? this.pdaFeedback : this.dtmFeedback;
        if (!feedbackEl) return;
        
        let feedbackText = validation.explanation;
        
        // Make feedback more encouraging for incorrect choices
        if (!validation.correct) {
            feedbackText += " Try another option!";
        }
        
        feedbackEl.textContent = feedbackText;
        feedbackEl.className = machine === 'pda' ? 'pda-feedback' : 'dtm-feedback';
        feedbackEl.classList.add(validation.correct ? 'success' : 'error');
    }
    
    showTransitionMessage(message) {
        // Show a temporary message at the top of the comparison display
        if (this.comparisonDisplay) {
            const messageEl = document.createElement('div');
            messageEl.className = 'transition-message';
            messageEl.textContent = message;
            messageEl.style.cssText = `
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
                color: #1e40af;
                padding: 12px;
                border-radius: 8px;
                text-align: center;
                font-weight: 500;
                margin-bottom: 15px;
                animation: slideInMessage 0.3s ease-out;
            `;
            
            // Remove any existing transition message
            const existingMessage = this.comparisonDisplay.querySelector('.transition-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            this.comparisonDisplay.insertBefore(messageEl, this.comparisonDisplay.firstChild);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.style.opacity = '0';
                    setTimeout(() => {
                        if (messageEl.parentNode) {
                            messageEl.remove();
                        }
                    }, 300);
                }
            }, 3000);
        }
    }

    clearFeedback() {
        if (this.pdaFeedback) {
            this.pdaFeedback.textContent = 'Select a transition to proceed with the PDA simulation.';
            this.pdaFeedback.className = 'pda-feedback';
        }
        
        if (this.dtmFeedback) {
            this.dtmFeedback.textContent = 'Select a transition to proceed with the DTM simulation.';
            this.dtmFeedback.className = 'dtm-feedback';
        }
    }
    
    showHint() {
        if (!this.simulation) return;
        
        const choices = this.simulation.getCurrentChoices();
        if (!choices) return;
        
        // Show hints for both machines
        ['pda', 'dtm'].forEach(machine => {
            const machineChoices = choices[machine];
            if (machineChoices && this.waitingForChoice[machine]) {
                const correctChoice = machineChoices.find(choice => choice.correct);
                const feedbackEl = machine === 'pda' ? this.pdaFeedback : this.dtmFeedback;
                
                if (correctChoice && feedbackEl) {
                    feedbackEl.textContent = `Hint: ${correctChoice.explanation}`;
                    feedbackEl.className = (machine === 'pda' ? 'pda-feedback' : 'dtm-feedback') + ' hint';
                }
            }
        });
    }
    
    autoCorrect() {
        if (!this.simulation) return;
        
        const choices = this.simulation.getCurrentChoices();
        if (!choices) return;
        
        // Auto-select correct choices for both machines
        ['pda', 'dtm'].forEach(machine => {
            const machineChoices = choices[machine];
            if (machineChoices && this.waitingForChoice[machine]) {
                const correctIndex = machineChoices.findIndex(choice => choice.correct);
                if (correctIndex !== -1) {
                    this.selectChoice(machine, correctIndex);
                }
            }
        });
    }
    
    previousStep() {
        if (!this.simulation) return;
        
        if (this.simulation.goBack()) {
            this.waitingForChoice = { pda: false, dtm: false };
            this.lastSelections = { pda: null, dtm: null };
            this.updateDisplay();
            this.updateChoices();
            this.updateStatus();
            this.clearFeedback();
            this.updateButtonStates();
        }
    }
    
    advanceStep() {
        if (!this.simulation) return;
        
        // Get current step before advancing for animation purposes
        const previousStep = this.simulation.getCurrentStep();
        
        if (this.simulation.advance()) {
            this.lastSelections = { pda: null, dtm: null };
            
            // Get new step after advancing
            const newStep = this.simulation.getCurrentStep();
            
            // Animate tape changes if head position changed
            if (previousStep && newStep && 
                previousStep.dtm.headPosition !== newStep.dtm.headPosition) {
                
                // Animate head movement
                setTimeout(() => {
                    animateTapeOperation('move', newStep.dtm.headPosition);
                }, 100);
            }
            
            // Check for tape symbol changes
            if (previousStep && newStep) {
                for (let i = 0; i < Math.max(previousStep.dtm.tape.length, newStep.dtm.tape.length); i++) {
                    if (previousStep.dtm.tape[i] !== newStep.dtm.tape[i]) {
                        setTimeout(() => {
                            animateTapeOperation('write', i, newStep.dtm.tape[i]);
                        }, 200);
                    }
                }
            }
            
            this.updateDisplay();
            this.updateChoices();
            this.updateStatus();
            this.clearFeedback();
            this.updateButtonStates();
            
            // Add synchronized animation
            addSynchronizedAnimation();
        } else {
            // Simulation complete
            this.showCompletion();
        }
    }
    
    showCompletion() {
        this.isComplete = true;
        
        // Clear choice containers
        if (this.pdaChoices) {
            this.pdaChoices.innerHTML = '<div class="completion-message"><h4>🎉 PDA Simulation Complete!</h4></div>';
        }
        
        if (this.dtmChoices) {
            this.dtmChoices.innerHTML = '<div class="completion-message"><h4>🎉 DTM Simulation Complete!</h4></div>';
        }
        
        // Show final comparison
        const testCase = machineData.testStrings.find(t => t.input === this.currentTestString);
        const expected = testCase ? testCase.expected : false;
        
        if (expected) {
            showMachineState('accepted');
            highlightEquivalence();
        } else {
            showMachineState('rejected');
        }
        
        this.showFinalComparison(expected);
        this.updateButtonStates();
    }
    
    updateComparison(stepData) {
        if (!this.comparisonDisplay || !stepData) return;
        
        this.comparisonDisplay.innerHTML = `
            <div class="step-info">
                <h4>Step ${stepData.stepNumber}</h4>
                <p>${stepData.description}</p>
            </div>
            <div class="machine-states">
                <div class="pda-state">
                    <strong>2-Stack PDA:</strong> ${stepData.pda.description}
                    <br><small>State: ${stepData.pda.state}, Input: ${stepData.pda.remainingInput || 'ε'}</small>
                </div>
                <div class="dtm-state">
                    <strong>DTM:</strong> ${stepData.dtm.description}
                    <br><small>State: ${stepData.dtm.state}, Head: ${stepData.dtm.headPosition}</small>
                </div>
            </div>
        `;
    }
    
    showFinalComparison(accepted) {
        if (!this.comparisonDisplay) return;
        
        const resultText = accepted ? 'ACCEPTED' : 'REJECTED';
        const resultClass = accepted ? 'success' : 'error';
        const resultIcon = accepted ? '✅' : '❌';
        
        this.comparisonDisplay.innerHTML = `
            <div class="final-result ${resultClass}">
                <h4>${resultIcon} Simulation Complete</h4>
                <div class="result-status">
                    Both machines reached the same result: <strong>${resultText}</strong>
                </div>
                <div class="result-details">
                    <p><strong>Input:</strong> "${this.currentTestString}"</p>
                    <p><strong>Is Palindrome:</strong> ${accepted ? 'Yes' : 'No'}</p>
                    <p><strong>Both machines agree:</strong> This proves their equivalence!</p>
                </div>
                <div class="equivalence-explanation">
                    <h5>How the equivalence works:</h5>
                    <ul>
                        <li><strong>Left stack:</strong> Simulates tape content to the left of DTM head</li>
                        <li><strong>Right stack:</strong> Simulates tape content to the right of DTM head</li>
                        <li><strong>Stack operations:</strong> Equivalent to DTM head movements</li>
                        <li><strong>State transitions:</strong> Both machines follow equivalent logic</li>
                    </ul>
                    <p class="equivalence-note">
                        This demonstrates that 2-stack PDAs have the same computational power as DTMs!
                    </p>
                </div>
            </div>
        `;
    }
    
    updateStatus() {
        if (!this.simulation) return;
        
        const progress = this.simulation.getProgress();
        
        if (this.currentStepEl) {
            this.currentStepEl.textContent = `${progress.current} / ${progress.total}`;
        }
        
        if (this.machineStatusEl) {
            if (this.isComplete) {
                this.machineStatusEl.textContent = 'Complete';
            } else if (this.waitingForChoice.pda || this.waitingForChoice.dtm) {
                this.machineStatusEl.textContent = 'Waiting for Choice';
            } else {
                this.machineStatusEl.textContent = 'Processing';
            }
        }
        
        if (this.currentModeEl) {
            this.currentModeEl.textContent = 'Interactive Choice';
        }
    }
    
    updateButtonStates() {
        if (!this.simulation) return;
        
        const progress = this.simulation.getProgress();
        const bothCorrect = this.lastSelections.pda !== null && this.lastSelections.dtm !== null &&
                           this.simulation.validateChoice('pda', this.lastSelections.pda)?.correct &&
                           this.simulation.validateChoice('dtm', this.lastSelections.dtm)?.correct;
        
        if (this.previousStepBtn) {
            this.previousStepBtn.disabled = progress.current <= 0;
        }
        
        if (this.showHintBtn) {
            this.showHintBtn.disabled = this.isComplete || (!this.waitingForChoice.pda && !this.waitingForChoice.dtm);
        }
        
        if (this.autoCorrectBtn) {
            this.autoCorrectBtn.disabled = this.isComplete || (!this.waitingForChoice.pda && !this.waitingForChoice.dtm);
        }
    }
    
    // Helper method to get current simulation stats
    getStats() {
        if (!this.simulation) return null;
        
        const progress = this.simulation.getProgress();
        const currentStep = this.simulation.getCurrentStep();
        
        return {
            currentStep: progress.current,
            totalSteps: progress.total,
            currentTestString: this.currentTestString,
            isComplete: this.isComplete,
            currentPDAState: currentStep?.pda.state,
            currentDTMState: currentStep?.dtm.state,
            waitingForChoice: this.waitingForChoice
        };
    }
}

// Initialize the simulator when the page loads
let simulator;

document.addEventListener('DOMContentLoaded', () => {
    simulator = new InteractiveEquivalenceSimulator();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InteractiveEquivalenceSimulator };
}
