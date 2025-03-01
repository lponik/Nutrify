document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const foodDescription = document.getElementById('food-description');
    const resultsContainer = document.getElementById('results-container');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');

    analyzeBtn.addEventListener('click', async function() {
        const text = foodDescription.value.trim();
        
        if (!text) {
            alert('Please enter a food description.');
            return;
        }
        
        // Show loading indicator
        loading.style.display = 'block';
        resultsContainer.style.display = 'block';
        results.textContent = '';
        
        try {
            const response = await fetch('/api/food/analyze-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Format JSON response for better readability
                try {
                    const parsedData = JSON.parse(data.data);
                    const formattedData = JSON.stringify(parsedData, null, 2);
                    results.innerHTML = '<pre>' + formattedData + '</pre>';
                } catch (e) {
                    // If parsing fails, just show the raw response
                    results.textContent = data.data;
                }
            } else {
                results.textContent = `Error: ${data.error || 'Failed to analyze food'}`;
            }
        } catch (error) {
            results.textContent = `Error: ${error.message}`;
        } finally {
            loading.style.display = 'none';
        }
    });
});