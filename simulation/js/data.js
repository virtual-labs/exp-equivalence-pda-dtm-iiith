// Data for 2-Stack PDA and DTM Equivalence Experiment
// Algorithm: Recognize strings of the form w#w (where w is any string)
// This fully utilizes both stacks in the PDA

const machineData = {
    testStrings: [
        {
            id: "ab#ab",
            input: "ab#ab",
            description: "Matching strings w#w",
            expected: true
        },
        {
            id: "abc#abc", 
            input: "abc#abc",
            description: "Longer matching strings",
            expected: true
        },
        {
            id: "ab#ba",
            input: "ab#ba",
            description: "Non-matching (reversed)",
            expected: false
        },
        {
            id: "ab#ac",
            input: "ab#ac",
            description: "Non-matching (different)",
            expected: false
        },
        {
            id: "a#a",
            input: "a#a",
            description: "Single character match",
            expected: true
        }
    ]
};

// Interactive step-by-step simulation data
class StepByStepSimulation {
    constructor(inputString) {
        this.inputString = inputString;
        this.isMatch = this.checkIfMatch(inputString);
        this.currentStep = 0;
        this.steps = this.generateSteps();
        this.isComplete = false;
        
        console.log(`Simulating "${inputString}" - Expected: ${this.isMatch ? 'ACCEPT' : 'REJECT'}`);
    }

    checkIfMatch(str) {
        const hashIndex = str.indexOf('#');
        if (hashIndex === -1) return false;
        
        const w1 = str.substring(0, hashIndex);
        const w2 = str.substring(hashIndex + 1);
        return w1 === w2;
    }

    generateSteps() {
        const steps = [];
        const chars = this.inputString.split('');
        const n = chars.length;
        const hashIndex = this.inputString.indexOf('#');
        
        // Step 0: Initial configuration
        steps.push({
            stepNumber: 0,
            description: "Initial configuration - both machines start processing",
            pda: {
                state: "q0",
                remainingInput: this.inputString,
                leftStack: ["⊥"],
                rightStack: ["⊥"],
                description: "Start state - will store first part w before # in left stack"
            },
            dtm: {
                state: "q_start",
                tape: [...chars, "⊔", "⊔", "⊔", "⊔"],
                headPosition: 0,
                description: "Start state - will mark and compare character by character"
            },
            choices: this.generateChoicesStep0(chars, hashIndex)
        });

        // Phase 1: Store characters before # in left stack
        for (let i = 0; i < hashIndex; i++) {
            steps.push({
                stepNumber: i + 1,
                description: `Store '${chars[i]}' in left stack (before # separator)`,
                pda: {
                    state: "q0",
                    remainingInput: this.inputString.substring(i + 1),
                    leftStack: ["⊥", ...chars.slice(0, i + 1)],
                    rightStack: ["⊥"],
                    description: `Storing first part in left stack: push '${chars[i]}'`
                },
                dtm: {
                    state: "q_mark",
                    tape: this.generateDTMTape(i + 1, chars, hashIndex),
                    headPosition: i + 1,
                    description: `Marked '${chars[i]}' and moved right`
                },
                choices: this.generateChoicesPhase1(chars, i, hashIndex)
            });
        }

        // Step at #: Transition to comparison phase
        steps.push({
            stepNumber: hashIndex + 1,
            description: "Found # separator - transition to comparison phase",
            pda: {
                state: "q1",
                remainingInput: this.inputString.substring(hashIndex + 1),
                leftStack: ["⊥", ...chars.slice(0, hashIndex)],
                rightStack: ["⊥"],
                description: "Transition to comparison state - will use right stack for matching"
            },
            dtm: {
                state: "q_separator",
                tape: this.generateDTMTape(hashIndex + 1, chars, hashIndex),
                headPosition: hashIndex + 1,
                description: "Found separator, start comparing characters"
            },
            choices: this.generateChoicesSeparator(chars, hashIndex)
        });

        // Step: Transfer from left stack to right stack to reverse order for w#w matching
        steps.push({
            stepNumber: hashIndex + 2,
            description: "Transfer left stack to right stack for correct ordering",
            pda: {
                state: "q_transfer",
                remainingInput: this.inputString.substring(hashIndex + 1),
                leftStack: ["⊥"], // Empty after transfer
                rightStack: ["⊥", ...chars.slice(0, hashIndex).reverse()], // Reverse to get correct order
                description: "Transfer complete - right stack now has first part in correct order"
            },
            dtm: {
                state: "q_separator",
                tape: this.generateDTMTape(hashIndex + 1, chars, hashIndex),
                headPosition: hashIndex + 1,
                description: "Ready to start character-by-character comparison"
            },
            choices: this.generateChoicesTransfer(chars, hashIndex)
        });

        // Phase 2: Compare characters after # with right stack (now in correct order)
        for (let i = hashIndex + 1; i < n; i++) {
            const positionInSecondPart = i - hashIndex - 1;
            const shouldMatch = positionInSecondPart < hashIndex && chars[positionInSecondPart] === chars[i];
            
            // Calculate remaining characters in right stack after this comparison
            const remainingInRightStack = shouldMatch ? 
                chars.slice(0, hashIndex).reverse().slice(positionInSecondPart + 1) : 
                chars.slice(0, hashIndex).reverse();
            
            steps.push({
                stepNumber: hashIndex + 3 + positionInSecondPart,
                description: `Compare '${chars[i]}' with '${chars[positionInSecondPart]}' from right stack`,
                pda: {
                    state: shouldMatch ? "q1" : "q_reject",
                    remainingInput: i < n - 1 ? this.inputString.substring(i + 1) : "",
                    leftStack: ["⊥"],
                    rightStack: remainingInRightStack.length > 0 ? ["⊥", ...remainingInRightStack] : ["⊥"],
                    description: shouldMatch ? 
                        `'${chars[i]}' matches '${chars[positionInSecondPart]}' - pop from right stack` :
                        `'${chars[i]}' doesn't match '${chars[positionInSecondPart]}' - reject`
                },
                dtm: {
                    state: shouldMatch ? "q_compare" : "q_reject",
                    tape: this.generateDTMTape(i + 1, chars, hashIndex),
                    headPosition: shouldMatch ? i + 1 : i,
                    description: shouldMatch ? 
                        `Characters match at positions ${positionInSecondPart} and ${i}` :
                        `Mismatch at position ${i} - reject`
                },
                choices: this.generateChoicesPhase2(chars, i, hashIndex, shouldMatch, positionInSecondPart)
            });
        }

        // Additional step: PDA final check - ensure left stack is empty
        if (this.isMatch) {
            steps.push({
                stepNumber: n + 1,
                description: "PDA final check - verify both stacks are properly managed",
                pda: {
                    state: "q_final_check",
                    remainingInput: "",
                    leftStack: ["⊥"], // Empty after transferring all characters
                    rightStack: ["⊥"], // Empty after popping all matched characters
                    description: "Both stacks properly managed - all characters matched"
                },
                dtm: {
                    state: "q_compare",
                    tape: this.generateDTMTape(n + 1, chars, hashIndex),
                    headPosition: n,
                    description: "DTM completed character comparisons"
                },
                choices: this.generateChoicesFinalCheck(chars, hashIndex)
            });
        }

        // Final step: Both machines reach final decision
        const finalState = this.isMatch ? "q_accept" : "q_reject";
        steps.push({
            stepNumber: this.isMatch ? n + 2 : n + 1,
            description: "Both machines reach final decision",
            pda: {
                state: finalState,
                remainingInput: "",
                leftStack: ["⊥"],
                rightStack: ["⊥"], // Should be empty after successful w#w matching
                description: this.isMatch ? 
                    "ACCEPT: Both stacks empty, all characters matched in w#w pattern" :
                    "REJECT: Mismatch detected during comparison"
            },
            dtm: {
                state: finalState,
                tape: this.generateDTMTape(this.isMatch ? n + 2 : n + 1, chars, hashIndex),
                headPosition: 0,
                description: this.isMatch ?
                    "ACCEPT: All character pairs verified as matching" :
                    "REJECT: Found non-matching character pair"
            },
            choices: this.generateChoicesFinal(chars, hashIndex)
        });

        return steps;
    }

    generateDTMTape(stepNum, chars, hashIndex) {
        const n = chars.length;
        let tape = [...chars, "⊔", "⊔", "⊔", "⊔"];
        
        // DTM algorithm for w#w matching:
        // For "ab#ab": a b # a b -> X b # a b -> X Y # a b -> X Y # Y b -> X Y # Y Y (accept)
        // For "ab#ba": a b # b a -> X b # b a -> X Y # b a -> X Y # N a (reject on mismatch)
        
        if (stepNum <= hashIndex) {
            // Phase 1: Mark characters before # as X
            for (let i = 0; i < Math.min(stepNum, hashIndex); i++) {
                tape[i] = 'X';
            }
        } else if (stepNum === hashIndex + 1) {
            // At separator - all chars before # marked as X
            for (let i = 0; i < hashIndex; i++) {
                tape[i] = 'X';
            }
            tape[hashIndex] = '#'; // Keep separator visible
        } else {
            // Phase 2: Compare characters from both parts
            // Mark first part as X initially
            for (let i = 0; i < hashIndex; i++) {
                tape[i] = 'X';
            }
            tape[hashIndex] = '#';
            
            // Compare character by character
            const comparisonsCompleted = Math.min(stepNum - hashIndex - 1, hashIndex);
            for (let i = 0; i < comparisonsCompleted; i++) {
                const pos1 = i; // Position in first part
                const pos2 = hashIndex + 1 + i; // Position in second part
                
                if (pos2 < n && chars[pos1] === chars[pos2]) {
                    // Match found - mark both as Y
                    tape[pos1] = 'Y';
                    tape[pos2] = 'Y';
                } else if (pos2 < n) {
                    // Mismatch - mark second part character as N
                    tape[pos2] = 'N';
                    break; // Stop further processing on mismatch
                }
            }
            
            // For final steps, ensure all matches are marked
            if (stepNum >= n + 1 && this.isMatch) {
                for (let i = 0; i < hashIndex; i++) {
                    tape[i] = 'Y';
                    tape[hashIndex + 1 + i] = 'Y';
                }
            }
        }
        
        return tape;
    }

    generateChoicesStep0(chars, hashIndex) {
        return {
            pda: [
                {
                    text: `δ(q₀, ${chars[0]}, ⊥) = (q₀, ${chars[0]}⊥)`,
                    correct: true,
                    explanation: `Start by storing first character '${chars[0]}' in left stack`
                },
                {
                    text: `δ(q₀, ${chars[0]}, ⊥) = (q₀, ⊥${chars[0]})`,
                    correct: false,
                    explanation: "Left stack grows upward - character goes on top"
                },
                {
                    text: `δ(q₀, ε, ⊥) = (q₁, ⊥)`,
                    correct: false,
                    explanation: "Cannot skip input - must process all characters before #"
                },
                {
                    text: `δ(q₀, ${chars[0]}, ⊥) = (q_reject, ⊥)`,
                    correct: false,
                    explanation: "No reason to reject the first character"
                }
            ],
            dtm: [
                {
                    text: `δ(q_start, ${chars[0]}) = (q_mark, X, R)`,
                    correct: true,  
                    explanation: `Mark first character '${chars[0]}' as X and move right`
                },
                {
                    text: `δ(q_start, ${chars[0]}) = (q_start, ${chars[0]}, R)`,
                    correct: false,
                    explanation: "Should mark character to track comparison progress"
                },
                {
                    text: `δ(q_start, ${chars[0]}) = (q_compare, ${chars[0]}, L)`,
                    correct: false,
                    explanation: "Too early to start comparing - need to find separator first"
                },
                {
                    text: `δ(q_start, ${chars[0]}) = (q_accept, X, R)`,
                    correct: false,
                    explanation: "Cannot accept without processing entire input"
                }
            ]
        };
    }

    generateChoicesPhase1(chars, i, hashIndex) {
        const nextChar = chars[i + 1];
        const isLastBeforeHash = (i + 1) === hashIndex;
        
        return {
            pda: [
                {
                    text: isLastBeforeHash ? 
                        `δ(q₀, #, ${chars[i]}) = (q₁, ${chars[i]})` :
                        `δ(q₀, ${nextChar}, ${chars[i]}) = (q₀, ${nextChar}${chars[i]})`,
                    correct: true,
                    explanation: isLastBeforeHash ? 
                        "Found separator # - transition to comparison phase" :
                        `Continue storing characters: push '${nextChar}' onto left stack`
                },
                {
                    text: `δ(q₀, ${nextChar || '#'}, ${chars[i]}) = (q₀, ${chars[i]}${nextChar || '#'})`,
                    correct: false,
                    explanation: "Stack operations wrong - new items go on top"
                },
                {
                    text: isLastBeforeHash ?
                        `δ(q₀, #, ${chars[i]}) = (q₀, #${chars[i]})` :
                        `δ(q₀, ${nextChar}, ${chars[i]}) = (q₁, ${nextChar}${chars[i]})`,
                    correct: false,
                    explanation: isLastBeforeHash ?
                        "Should transition states when encountering separator" :
                        "Too early to enter comparison phase"
                },
                {
                    text: `δ(q₀, ${nextChar || '#'}, ${chars[i]}) = (q_reject, ${chars[i]})`,
                    correct: false,
                    explanation: "No reason to reject during storage phase"
                }
            ],
            dtm: [
                {
                    text: `δ(q_mark, ${nextChar || '#'}) = (q_mark, ${nextChar === '#' ? '#' : 'X'}, R)`,
                    correct: true,
                    explanation: nextChar === '#' ? 
                        "Found separator - keep it visible and continue" :
                        `Mark '${nextChar}' as X and continue scanning`
                },
                {
                    text: `δ(q_mark, ${nextChar || '#'}) = (q_mark, ${nextChar || '#'}, R)`,
                    correct: false,
                    explanation: "Should mark characters to track progress"
                },
                {
                    text: `δ(q_mark, ${nextChar || '#'}) = (q_compare, ${nextChar || '#'}, L)`,
                    correct: false,
                    explanation: nextChar === '#' ?
                        "At separator but moving wrong direction" :
                        "Not ready to compare yet - continue marking"
                },
                {
                    text: `δ(q_mark, ${nextChar || '#'}) = (q_reject, ${nextChar === '#' ? '#' : 'X'}, R)`,
                    correct: false,
                    explanation: "No reason to reject during marking phase"
                }
            ]
        };
    }

    generateChoicesSeparator(chars, hashIndex) {
        const firstAfterHash = chars[hashIndex + 1];
        
        return {
            pda: [
                {
                    text: `δ(q₁, #, ${chars[hashIndex-1]}) = (q_transfer, ${chars[hashIndex-1]})`,
                    correct: true,
                    explanation: `Found separator # - transition to transfer state to reverse left stack for w#w comparison`
                },
                {
                    text: `δ(q₁, #, ${chars[hashIndex-1]}) = (q₁, #${chars[hashIndex-1]})`,
                    correct: false,
                    explanation: "Should transition to transfer state, not push separator to stack"
                },
                {
                    text: `δ(q₁, #, ${chars[hashIndex-1]}) = (q_reject, ${chars[hashIndex-1]})`,
                    correct: false,
                    explanation: "Finding separator is expected in w#w pattern - don't reject"
                },
                {
                    text: `δ(q₁, ε, ${chars[hashIndex-1]}) = (q_accept, ${chars[hashIndex-1]})`,
                    correct: false,
                    explanation: "Still have input after # to process - cannot accept yet"
                }
            ],
            dtm: [
                {
                    text: `δ(q_separator, #) = (q_compare, #, R)`,
                    correct: true,
                    explanation: `Found separator # - move to comparison state and advance to compare second part`
                },
                {
                    text: `δ(q_separator, #) = (q_separator, #, R)`,
                    correct: false,
                    explanation: "Should transition to comparison state after finding separator"
                },
                {
                    text: `δ(q_separator, #) = (q_accept, #, R)`,
                    correct: false,
                    explanation: "Finding separator alone is not enough - need to verify w#w pattern"
                },
                {
                    text: `δ(q_separator, #) = (q_mark, X, L)`,
                    correct: false,
                    explanation: "Wrong direction and wrong state - should move right to compare second part"
                }
            ]
        };
    }

    generateChoicesTransfer(chars, hashIndex) {
        return {
            pda: [
                {
                    text: `δ(q_transfer, ε, ${chars[hashIndex-1]}) = (q_transfer, push to right stack)`,
                    correct: true,
                    explanation: `Transfer all characters from left stack to right stack to reverse order for w#w comparison`
                },
                {
                    text: `δ(q_transfer, ε, ${chars[hashIndex-1]}) = (q₁, ${chars[hashIndex-1]})`,
                    correct: false,
                    explanation: "Should transfer to right stack, not keep in left"
                },
                {
                    text: `δ(q_transfer, ${chars[hashIndex+1]}, ε) = (q_transfer, push)`,
                    correct: false,
                    explanation: "Transfer uses epsilon transitions, no input reading"
                },
                {
                    text: `δ(q_transfer, ε, ${chars[hashIndex-1]}) = (q_reject, pop)`,
                    correct: false,
                    explanation: "Transfer is needed for comparison - don't reject"
                }
            ],
            dtm: [
                {
                    text: "Continue with character comparison algorithm",
                    correct: true,
                    explanation: "DTM operates independently and continues its comparison process"
                },
                {
                    text: "Wait for PDA to complete transfer",
                    correct: false,
                    explanation: "Both machines operate independently in parallel"
                },
                {
                    text: "Reset tape head to beginning",
                    correct: false,
                    explanation: "DTM maintains its current position and state"
                },
                {
                    text: "Switch to transfer mode",
                    correct: false,
                    explanation: "DTM doesn't have transfer operations - only PDA does"
                }
            ]
        };
    }

    generateChoicesPhase2(chars, i, hashIndex, shouldMatch, stackIndex) {
        const currentChar = chars[i];
        const expectedChar = stackIndex >= 0 && stackIndex < hashIndex ? chars[stackIndex] : null;
        const isLast = i === chars.length - 1;
        
        return {
            pda: [
                {
                    text: shouldMatch ?
                        `δ(q₁, ${currentChar}, ${expectedChar}) = (q₁, pop)` :
                        `δ(q₁, ${currentChar}, ${expectedChar || '?'}) = (q_reject, ${expectedChar || '?'})`,
                    correct: true,
                    explanation: shouldMatch ?
                        `Match found: '${currentChar}' = '${expectedChar}' - pop from right stack and continue` :
                        `Mismatch: '${currentChar}' ≠ '${expectedChar}' - reject w#w pattern`
                },
                {
                    text: shouldMatch ?
                        `δ(q₁, ${currentChar}, ${expectedChar}) = (q₁, ${currentChar}${expectedChar})` :
                        `δ(q₁, ${currentChar}, ${expectedChar || '?'}) = (q_accept, ${expectedChar || '?'})`,
                    correct: false,
                    explanation: shouldMatch ?
                        "Should pop from right stack, not push during comparison" :
                        "Mismatched strings cannot be accepted"
                },
                {
                    text: `δ(q₁, ε, ${expectedChar || '?'}) = (q₁, pop)`,
                    correct: false,
                    explanation: "Must consume input character - cannot use epsilon transition"
                },
                {
                    text: shouldMatch ?
                        `δ(q₁, ${currentChar}, ${expectedChar}) = (q_reject, pop)` :
                        `δ(q₁, ${currentChar}, ${expectedChar || '?'}) = (q₁, ${currentChar})`,
                    correct: false,
                    explanation: shouldMatch ?
                        "Characters match - should continue, not reject" :
                        "Mismatch detected - should reject, not continue"
                }
            ],
            dtm: [
                {
                    text: shouldMatch ?
                        `δ(q_compare, ${currentChar}) = (q_compare, Y, R)` :
                        `δ(q_compare, ${currentChar}) = (q_reject, N, R)`,
                    correct: true,
                    explanation: shouldMatch ?
                        `Character '${currentChar}' matches position ${stackIndex} - mark as Y and continue` :
                        `Mismatch at position ${i} - mark as N and reject`
                },
                {
                    text: `δ(q_compare, ${currentChar}) = (q_compare, ${currentChar}, R)`,
                    correct: false,
                    explanation: "Should mark the result of comparison (Y or N)"
                },
                {
                    text: shouldMatch ?
                        `δ(q_compare, ${currentChar}) = (q_reject, Y, R)` :
                        `δ(q_compare, ${currentChar}) = (q_accept, N, R)`,
                    correct: false,
                    explanation: shouldMatch ?
                        "Characters match - should continue comparing, not reject" :
                        "Mismatch found - cannot accept"
                },
                {
                    text: `δ(q_compare, ${currentChar}) = (q_mark, X, L)`,
                    correct: false,
                    explanation: "Wrong phase - should be comparing, not marking"
                }
            ]
        };
    }

    generateChoicesFinal(chars, hashIndex) {
        return {
            pda: [
                {
                    text: this.isMatch ?
                        `δ(q₁, ε, ⊥) = (q_accept, ⊥)` :
                        `δ(q₁, mismatch, ?) = (q_reject, ?)`,
                    correct: true,
                    explanation: this.isMatch ?
                        "Both stacks properly managed, all chars matched - accept w#w" :
                        "Mismatch detected during comparison - reject"
                },
                {
                    text: this.isMatch ?
                        `δ(q₁, ε, ⊥) = (q_reject, ⊥)` :
                        `δ(q₁, mismatch, ?) = (q_accept, ?)`,
                    correct: false,
                    explanation: this.isMatch ?
                        "Pattern w#w successfully verified - should accept" :
                        "Strings don't match w#w pattern - cannot accept"
                },
                {
                    text: `δ(q₁, ε, remaining) = (q_accept, remaining)`,
                    correct: false,
                    explanation: this.isMatch ?
                        "Left stack should be empty after complete match" :
                        "Cannot accept with remaining characters"
                },
                {
                    text: `δ(q₁, ε, ⊥) = (q₁, ⊥)`,
                    correct: false,
                    explanation: "Must make final decision - cannot stay in same state"
                }
            ],
            dtm: [
                {
                    text: this.isMatch ?
                        `δ(q_compare, ⊔) = (q_accept, ⊔, L)` :
                        `δ(q_compare, N) = (q_reject, N, L)`,
                    correct: true,
                    explanation: this.isMatch ?
                        "All character pairs verified as matching - accept w#w pattern" :
                        "Found non-matching pair marked as N - reject"
                },
                {
                    text: this.isMatch ?
                        `δ(q_compare, ⊔) = (q_reject, ⊔, L)` :
                        `δ(q_compare, N) = (q_accept, N, L)`,
                    correct: false,
                    explanation: this.isMatch ?
                        "All pairs match perfectly - should accept" :
                        "Mismatch found - cannot accept non-matching pattern"
                },
                {
                    text: `δ(q_compare, Y) = (q_accept, Y, R)`,
                    correct: false,
                    explanation: this.isMatch ?
                        "Should check all characters are processed" :
                        "Found mismatch earlier - should reject"
                },
                {
                    text: `δ(q_compare, ⊔) = (q_compare, ⊔, R)`,
                    correct: false,
                    explanation: "Must make final decision - cannot continue comparing"
                }
            ]
        };
    }

    addComparisonSteps(steps, chars) {
        const n = chars.length;
        
        // Final step: determine acceptance or rejection
        const finalStepNum = steps.length;
        const shouldAccept = this.isPalindrome;
        
        steps.push({
            stepNumber: finalStepNum,
            description: "Final comparison and decision",
            pda: {
                state: shouldAccept ? "qaccept" : "qreject",
                remainingInput: "",
                leftStack: ["⊥"],
                rightStack: shouldAccept ? ["⊥"] : ["⊥", ...chars.slice(Math.floor(n/2)+1)],
                description: shouldAccept ? "All characters matched - accept" : "Characters don't match - reject"
            },
            dtm: {
                state: shouldAccept ? "qaccept" : "qreject",
                tape: this.generateDTMTape(n-1, chars),
                headPosition: 0,
                description: shouldAccept ? "Palindrome verified - accept" : "Not a palindrome - reject"
            },
            choices: {
                pda: [
                    { 
                        text: shouldAccept ? `δ(q₁, ε, ⊥) = (qₐccₑₚₜ, ⊥)` : `δ(q₁, ${chars[Math.floor(n/2)+1]}, ${chars[Math.floor(n/2)]}) = (qᵣₑⱼₑcₜ, ${chars[Math.floor(n/2)]})`,
                        correct: true,
                        explanation: shouldAccept ? "Empty stacks and no input - accept palindrome" : "Characters don't match - reject"
                    },
                    { 
                        text: shouldAccept ? `δ(q₁, ε, ⊥) = (qᵣₑⱼₑcₜ, ⊥)` : `δ(q₁, ${chars[Math.floor(n/2)+1]}, ${chars[Math.floor(n/2)]}) = (qₐccₑₚₜ, ${chars[Math.floor(n/2)]})`,
                        correct: false,
                        explanation: shouldAccept ? "All conditions met for acceptance" : "Characters don't match - cannot accept"
                    },
                    { 
                        text: `δ(q₁, ε, ${chars[0]}) = (q₁, ${chars[0]})`,
                        correct: false,
                        explanation: "Should make a decision, not stay in same state"
                    },
                    { 
                        text: `δ(q₁, ${chars[0]}, ⊥) = (q₀, ⊥${chars[0]})`,
                        correct: false,
                        explanation: "Cannot go back to copying phase"
                    }
                ],
                dtm: [
                    { 
                        text: shouldAccept ? `δ(qₛₑₑₖ, X) = (qₐccₑₚₜ, X, R)` : `δ(qₛₑₑₖ, ${chars[chars.length-1]}) = (qᵣₑⱼₑcₜ, ${chars[chars.length-1]}, L)`,
                        correct: true,
                        explanation: shouldAccept ? "All pairs matched - accept palindrome" : "Character mismatch found - reject"
                    },
                    { 
                        text: shouldAccept ? `δ(qₛₑₑₖ, X) = (qᵣₑⱼₑcₜ, X, R)` : `δ(qₛₑₑₖ, ${chars[chars.length-1]}) = (qₐccₑₚₜ, ${chars[chars.length-1]}, L)`,
                        correct: false,
                        explanation: shouldAccept ? "Palindrome verified - should accept" : "Characters don't match - should reject"
                    },
                    { 
                        text: `δ(qₛₑₑₖ, ${chars[0]}) = (qₘₐᵣₖ, Y, R)`,
                        correct: false,
                        explanation: "Should make final decision, not continue marking"
                    },
                    { 
                        text: `δ(qₛₑₑₖ, ⊔) = (qₐccₑₚₜ, ⊔, R)`,
                        correct: false,  
                        explanation: "Not at blank symbol - should compare characters"
                    }
                ]
            }
        });
    }

    generateChoicesFinalCheck(chars, hashIndex) {
        return {
            pda: [
                {
                    text: `δ(q_final_check, ε, ⊥) = (q_accept, ⊥)`,
                    correct: true,
                    explanation: "Left stack is empty - all characters from first part were matched"
                },
                {
                    text: `δ(q_final_check, ε, remaining) = (q_reject, remaining)`,
                    correct: false,
                    explanation: "Left stack should be empty after complete matching"
                },
                {
                    text: `δ(q_final_check, ε, ⊥) = (q_final_check, ⊥)`,
                    correct: false,
                    explanation: "Must make final decision - cannot stay in check state"
                },
                {
                    text: `δ(q_final_check, ε, ⊥) = (q_reject, ⊥)`,
                    correct: false,
                    explanation: "All conditions met for acceptance - should accept"
                }
            ],
            dtm: [
                {
                    text: `δ(q_compare, ⊔) = (q_accept, ⊔, L)`,
                    correct: true,
                    explanation: "Reached end of tape - all comparisons successful"
                },
                {
                    text: `δ(q_compare, ⊔) = (q_reject, ⊔, L)`,
                    correct: false,
                    explanation: "All character pairs matched - should accept"
                },
                {
                    text: `δ(q_compare, ⊔) = (q_compare, ⊔, R)`,
                    correct: false,
                    explanation: "Must make final decision - cannot continue comparing"
                },
                {
                    text: `δ(q_compare, Y) = (q_accept, Y, L)`,
                    correct: false,
                    explanation: "Should check if at end of input, not process more Y symbols"
                }
            ]
        };
    }

    getCurrentStep() {
        return this.steps[this.currentStep] || null;
    }

    getCurrentChoices() {
        const step = this.getCurrentStep();
        return step ? step.choices : null;
    }

    validateChoice(machine, choiceIndex) {
        const step = this.getCurrentStep();
        if (!step || !step.choices[machine]) return null;

        const choice = step.choices[machine][choiceIndex];
        if (!choice) return null;

        return {
            correct: choice.correct,
            explanation: choice.explanation,
            choiceText: choice.text
        };
    }

    canAdvance() {
        return this.currentStep < this.steps.length - 1;
    }

    advance() {
        if (this.canAdvance()) {
            this.currentStep++;
            return true;
        }
        this.isComplete = true;
        return false;
    }

    goBack() {
        if (this.currentStep > 0) {
            this.currentStep--;
            return true;
        }
        return false;
    }

    getProgress() {
        return {
            current: this.currentStep,
            total: this.steps.length,
            percentage: Math.round((this.currentStep / this.steps.length) * 100)
        };
    }
}

// Global simulation instance
let currentSimulation = null;

// Helper functions
function initializeSimulation(inputString) {
    currentSimulation = new StepByStepSimulation(inputString);
    return currentSimulation;
}

function getCurrentSimulation() {
    return currentSimulation;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        machineData, 
        StepByStepSimulation, 
        initializeSimulation, 
        getCurrentSimulation 
    };
}
