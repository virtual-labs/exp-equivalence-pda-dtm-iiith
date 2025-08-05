### Getting Started

1. **Access the Simulation Interface**
   - The main interface displays two side-by-side panels: 2-Stack PDA on the left and DTM on the right
   - The Quick Guide at the top explains the four-step process for observing computational equivalence
   - Control buttons and status indicators are positioned at the top for easy access

2. **Select Test String**
   - Use the **"Test String"** dropdown to choose from predefined w#w pattern examples:
     - **"ab#ab"** - Simple matching pair for initial understanding
     - **"abc#abc"** - Longer matching sequence for complexity observation
     - **"ab#ba"** - Non-matching reversed pair to see rejection behavior
     - **"ab#ac"** - Non-matching different pair for comparison
     - **"a#a"** - Single character case for minimal example
   - Each string tests the pattern w#w where both machines must verify if the parts before and after # are identical

### Understanding the 2-Stack PDA Panel

3. **PDA State Information**
   - **Current State**: Shows the PDA's control state (q₀, q₁, q₂, q₃)
   - **Remaining Input**: Displays unprocessed portion of the input string
   - State names are descriptive: Initial, Scanning, Backtrack, Accept

4. **Stack Visualizations**
   - **Left Stack**: Stores the first part w before the # separator
     - Bottom element is always ⊥ (stack bottom marker)
     - Characters are pushed during the first scanning phase
     - Stack grows upward as characters are added
   - **Right Stack**: Used for comparison with the second part w after #
     - Initially contains only ⊥
     - Used for temporary storage during comparison phase
     - Elements are popped during verification

5. **PDA Transition Selection**
   - **Choice Panel**: Displays 4 possible transitions at each step
   - **Transition Format**: (current_state, input_symbol, stack_tops) → (next_state, stack_operations)
   - **Selection Process**: Click on the correct transition based on current configuration
   - **Feedback**: System provides guidance on correct vs. incorrect choices

### Understanding the DTM Panel

6. **DTM State Information**
   - **Current State**: Shows the DTM's control state (q_start, q_mark, q_return, q_compare, q_accept, q_reject)
   - **Head Position**: Indicates current position of the read/write head on the tape
   - State names reflect the DTM's strategy: marking, returning, comparing

7. **Tape Visualization**
   - **Tape Cells**: Display current tape contents with clear cell boundaries
   - **Head Indicator**: Arrow (↑) shows current head position
   - **Symbol Meanings**:
     - **X**: Marked characters from the first part
     - **Y**: Successfully matched character pairs
     - **#**: Separator between the two parts
     - **⊔**: Blank tape cells
   - **Current Cell Highlighting**: The cell under the head is visually emphasized

8. **DTM Transition Selection**
   - **Choice Panel**: Presents 4 possible transitions for current configuration
   - **Transition Format**: (current_state, read_symbol) → (next_state, write_symbol, head_direction)
   - **Direction Indicators**: L (left), R (right) for head movement
   - **Validation**: System checks if selected transition matches current tape state

### Step-by-Step Execution

9. **Phase 1: Initial Processing (Both Machines)**
   - **PDA**: Begins in state q₀, starts reading input and pushing characters to left stack
   - **DTM**: Begins in q_start, starts marking characters from first part as X
   - **Parallel Operation**: Watch how both machines process the same input differently
   - **Character Storage**: PDA uses stack, DTM uses tape marking

10. **Phase 2: Separator Handling**
    - **PDA**: Recognizes # symbol and transitions to comparison mode
    - **DTM**: Encounters # and switches to return-and-compare mode
    - **Strategic Difference**: PDA maintains stack state, DTM repositions head
    - **Synchronization**: Both machines reach decision phase simultaneously

11. **Phase 3: Comparison Phase**
    - **PDA**: Pops from left stack while reading second part, comparing characters
    - **DTM**: Returns to start, compares marked X's with second part characters
    - **Verification Process**: Both machines check character-by-character matching
    - **Memory Usage**: PDA uses stack content, DTM uses tape markings

12. **Phase 4: Decision and Acceptance**
    - **PDA**: Accepts if left stack becomes empty when input is consumed
    - **DTM**: Accepts if all characters match and proper pattern is verified
    - **Equivalence Demonstration**: Both machines reach the same accept/reject decision
    - **Final State**: Both show ACCEPT or REJECT for identical strings

### Controls

13. **Navigation and Control**
    - **Reset Button**: Return both machines to initial configuration
    - **Show Hint**: Get guidance on correct transition choice
    - **Apply Correct**: Automatically apply the correct transition if stuck
    - **Previous Step**: Undo the last transition to try alternative approaches

14. **Status Monitoring**
    - **Current Step**: Track progress through the simulation sequence
    - **Machine Status**: Monitor overall execution state (Ready, Processing, Accepted, Rejected)
    - **Mode Indicator**: Confirms both machines are running in parallel
    - **Synchronization**: Observe how both machines stay in sync



### Understanding Computational Equivalence

17. **Memory Model Comparison**
    - **PDA Memory**: Hierarchical stack structure with LIFO access
    - **DTM Memory**: Linear tape with bidirectional random access
    - **Equivalent Capacity**: Both provide sufficient memory for the same computations
    - **Access Pattern Differences**: Observe how different memory models achieve same results

18. **Algorithm Strategy Comparison**
    - **PDA Strategy**: Store-and-compare using dual stack operations
    - **DTM Strategy**: Mark-and-verify using tape head movements
    - **Complexity Analysis**: Different approaches with equivalent outcomes
    - **Efficiency Considerations**: Understand theoretical vs. practical efficiency
