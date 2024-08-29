// Retrieve and display results
const results = JSON.parse(localStorage.getItem('results')) || [];
const resultsContainer = document.getElementById('resultsContainer');

results.forEach(result => {
    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item');
    resultItem.textContent = (result / 1000).toFixed(2); // Convert ms to seconds
    resultsContainer.appendChild(resultItem);
});