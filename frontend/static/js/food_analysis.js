document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Text analysis
    const analyzeTextBtn = document.getElementById('analyze-text-btn');
    const foodDescription = document.getElementById('food-description');
    
    analyzeTextBtn.addEventListener('click', async function() {
        const text = foodDescription.value.trim();
        
        if (!text) {
            alert('Please enter a food description.');
            return;
        }
        
        showLoading();
        
        try {
            const response = await fetch('/api/food/analyze-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });
            
            handleAnalysisResponse(response);
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Image analysis
    const analyzeImageBtn = document.getElementById('analyze-image-btn');
    const foodImage = document.getElementById('food-image');
    const imagePreview = document.getElementById('image-preview');
    
    // Show image preview when file is selected
    foodImage.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    analyzeImageBtn.addEventListener('click', async function() {
        if (!foodImage.files || !foodImage.files[0]) {
            alert('Please select an image to analyze.');
            return;
        }
        
        showLoading();
        
        try {
            const formData = new FormData();
            formData.append('image', foodImage.files[0]);
            
            const response = await fetch('/api/food/analyze-image', {
                method: 'POST',
                body: formData
            });
            
            handleAnalysisResponse(response);
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Shared functions
    const resultsContainer = document.getElementById('results-container');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    
    function showLoading() {
        loading.style.display = 'block';
        resultsContainer.style.display = 'block';
        results.textContent = '';
    }
    
    function showError(message) {
        results.textContent = `Error: ${message}`;
        loading.style.display = 'none';
    }
    
    async function handleAnalysisResponse(response) {
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
            showError(data.error || 'Failed to analyze food');
        }
        
        loading.style.display = 'none';
    }
});