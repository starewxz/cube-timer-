
            let isRunning = false;
            let timerInterval;
            let elapsedTime = 0;
            let isHoldingSpace = false;
            let readyToStart = false;
            let holdStartTime = 0;
            let isWaitingToStart = false;


            // Results storage
            let results = JSON.parse(localStorage.getItem('results')) || [];

            // Best results storage
            let bestResults = {
                5: localStorage.getItem('best5') ? parseInt(localStorage.getItem('best5')) : Infinity,
                12: localStorage.getItem('best12') ? parseInt(localStorage.getItem('best12')) : Infinity,
                allTime: localStorage.getItem('bestAllTime') ? parseInt(localStorage.getItem('bestAllTime')) : Infinity
            };

            // Load averages from localStorage
            let avg5 = localStorage.getItem('avg5') ? parseFloat(localStorage.getItem('avg5')) : null;
            let avg12 = localStorage.getItem('avg12') ? parseFloat(localStorage.getItem('avg12')) : null;

            // Format time to display it as mm:ss:ms
            function formatTime(ms) {
                const minutes = String(Math.floor((ms / 60000) % 60)).padStart(2, '0');
                const seconds = String(Math.floor((ms / 1000) % 60)).padStart(2, '0');
                const milliseconds = String(Math.floor((ms / 10) % 100)).padStart(2, '0');
                return `${minutes}:${seconds}:${milliseconds}`;
            }

            // Update the stopwatch display
            function updateDisplay() {
                document.getElementById('stopwatch').textContent = formatTime(elapsedTime);
            }

            // Calculate average of last 'count' results
            function calculateAverage(count) {
                if (results.length < count) return null;
                const sum = results.slice(-count).reduce((acc, curr) => acc + curr, 0);
                return sum / count;
            }

            // Update average and best results display
            function updateResults() {
                avg5 = calculateAverage(5);
                avg12 = calculateAverage(12);

                // Calculate best results
                const best5 = Math.min(...results.slice(-5), bestResults[5]);
                const best12 = Math.min(...results.slice(-12), bestResults[12]);
                const bestAllTime = Math.min(...results, bestResults.allTime);

                // Update best results in local storage
                if (best5 < bestResults[5]) {
                    localStorage.setItem('best5', best5);
                    bestResults[5] = best5;
                }
                if (best12 < bestResults[12]) {
                    localStorage.setItem('best12', best12);
                    bestResults[12] = best12;
                }
                if (bestAllTime < bestResults.allTime) {
                    localStorage.setItem('bestAllTime', bestAllTime);
                    bestResults.allTime = bestAllTime;
                }

                // Save averages to local storage
                if (avg5 !== null) localStorage.setItem('avg5', avg5);
                if (avg12 !== null) localStorage.setItem('avg12', avg12);

                document.getElementById('averages').textContent = 
                    `Avg 5: ${avg5 ? formatTime(avg5) : '--:--:--'} | Best 5: ${formatTime(bestResults[5])} | ` +
                    `Avg 12: ${avg12 ? formatTime(avg12) : '--:--:--'} | Best 12: ${formatTime(bestResults[12])} | ` +
                    `Best All Time: ${formatTime(bestResults.allTime)}`;
            }

            // Start the timer
            function startTimer() {
                const startTime = Date.now() - elapsedTime;
                timerInterval = setInterval(() => {
                    elapsedTime = Date.now() - startTime;
                    updateDisplay();
                }, 10);
            }

            // Stop the timer
            function stopTimer() {
                clearInterval(timerInterval);
            }

            // Reset the timer
            function resetTimer() {
                elapsedTime = 0;
                updateDisplay();
            }

            // Save the current result and calculate time difference with the previous result
            function saveLastResult() {
                const lastResult = elapsedTime;
                const previousResult = localStorage.getItem('previousResult') ? parseInt(localStorage.getItem('previousResult')) : null;

                if (previousResult !== null) {
                    const timeDifference = lastResult - previousResult;
                    const differenceText = `Difference: ${formatTime(Math.abs(timeDifference))} ${timeDifference > 0 ? '+' : timeDifference < 0 ? '-' : ''}`;
                    document.getElementById('lastResult').textContent = `Last Result: ${formatTime(lastResult)} | ${differenceText}`;
                } else {
                    document.getElementById('lastResult').textContent = `Last Result: ${formatTime(lastResult)}`;
                }

                document.getElementById('previousResult').textContent = `Previous Result: ${previousResult ? formatTime(previousResult) : 'None'}`;
                localStorage.setItem('previousResult', lastResult);

                // Add the result to the array and update averages and best results
                results.push(lastResult);
                localStorage.setItem('results', JSON.stringify(results));
                updateResults();

                // Update the total count display
                document.getElementById('resultCount').textContent = `Count: ${results.length}`;
                // Update scramble auto generating
                const newScramble = generateScramble(20);
                document.querySelector('.auto-scramble-js').innerHTML = newScramble;
            }

            // Handle starting and stopping the timer
            function handleInteraction() {
                if (isRunning) {
                    stopTimer();
                    saveLastResult();
                    resetTimer();
                    isRunning = false;
                    isWaitingToStart = false;
                }  else if (readyToStart && isWaitingToStart) {
                        startTimer();
                        isRunning = true;
                        readyToStart = false;
                        isWaitingToStart = false;
                    }
            }

            // Event listeners for keyboard and touch interactions
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space') {
                    if (!isRunning && !isHoldingSpace) {
                        isHoldingSpace = true;
                        holdStartTime = Date.now();
                        document.getElementById('stopwatch').style.color = 'red';
                        setTimeout(() => {
                            if (isHoldingSpace) {
                                document.getElementById('stopwatch').style.color = 'green';
                                readyToStart = true;
                                isWaitingToStart = true;
                            }
                        }, 500); // Timer turns green after holding for 0.5 seconds
                    }
                    e.preventDefault();
                }
            });

            document.addEventListener('keyup', (e) => {
                if (e.code === 'Space') {
                    isHoldingSpace = false;
                    document.getElementById('stopwatch').style.color = 'white';
                    handleInteraction();
                }
            });

            document.addEventListener('touchstart', () => {
                if (!isRunning && !isHoldingSpace) {
                    isHoldingSpace = true;
                    holdStartTime = Date.now();
                    document.getElementById('stopwatch').style.color = 'red';
                    setTimeout(() => {
                        if (isHoldingSpace) {
                            document.getElementById('stopwatch').style.color = 'green';
                            readyToStart = true;
                            isWaitingToStart = true;
                        }
                    }, 500); // Timer turns green after holding for 0.5 seconds
                }
            });

            document.addEventListener('touchend', () => {
                isHoldingSpace = false;
                document.getElementById('stopwatch').style.color = 'white';
                handleInteraction();
            });

            // Button to clear saved results and reset everything
            document.getElementById('clearResults').addEventListener('click', () => {
                results = [];
                localStorage.clear();
                document.getElementById('resultCount').textContent = 'Count: 0';
                document.getElementById('averages').textContent = 
                    'Avg 5: --:--:-- | Best 5: --:--:-- | Avg 12: --:--:-- | Best 12: --:--:-- | Best All Time: --:--:--';
                document.getElementById('previousResult').textContent = 'Previous Result: None';
                document.getElementById('lastResult').textContent = 'Last Result: --:--:--';
            });

            // Initialize the page with saved results and averages
            updateResults();
            document.getElementById('resultCount').textContent = `Count: ${results.length}`;
            const previousResult = localStorage.getItem('previousResult') ? parseInt(localStorage.getItem('previousResult')) : null;
            document.getElementById('previousResult').textContent = `Previous Result: ${previousResult ? formatTime(previousResult) : 'None'}`;

            function generateScramble(length) {
                const faces = ['U', 'D', 'R', 'L', 'F', 'B'];
                const modifiers = ['', "'", '2'];
                let scramble = [];
                let lastMove = '';

                for ( let i = 0; i < length; i++) {
                    let move;
                    do {
                        const face = faces [Math.floor(Math.random() * faces.length)];
                        const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
                        move = face+modifier;
                    } while (move[0] === lastMove);
                    scramble.push(move);
                    lastMove = move[0];
                }

                return scramble.join(' ');

            }

            const scramble = generateScramble(20);
            document.querySelector('.auto-scramble-js').innerHTML = scramble;