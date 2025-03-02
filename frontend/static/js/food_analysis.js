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
                    
                    // Initialize camera if camera tab is selected
                    if (tabId === 'camera') {
                        initCamera();
                    } else {
                        stopCamera();
                    }
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
            
            await handleAnalysisResponse(response);
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Camera functionality
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const cameraPreview = document.getElementById('camera-preview');
    const flipCameraBtn = document.getElementById('flip-camera');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const analyzeCameraBtn = document.getElementById('analyze-camera-btn');
    
    let stream;
    let facingMode = 'environment'; // Start with rear camera
    let capturedImage = null;
    
    // Initialize camera
    async function initCamera() {
        try {
            if (stream) {
                stopCamera();
            }
            
            const constraints = {
                video: { facingMode: facingMode }
            };
            
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            
            // Show camera container and hide preview
            document.querySelector('.camera-container').style.display = 'block';
            document.querySelector('#camera-tab .preview-container').style.display = 'none';
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access the camera. Please make sure you have granted permission.');
        }
    }
    
    // Stop camera stream
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }
    
    // Flip between front and rear cameras
    flipCameraBtn.addEventListener('click', function() {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        initCamera();
    });
    
    // Capture photo from camera
    captureBtn.addEventListener('click', function() {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame to the canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL and display in preview
        const imgUrl = canvas.toDataURL('image/png');
        cameraPreview.src = imgUrl;
        capturedImage = imgUrl;
        
        // Show preview and hide camera
        document.querySelector('.camera-container').style.display = 'none';
        document.querySelector('#camera-tab .preview-container').style.display = 'block';
    });
    
    // Retake photo
    retakeBtn.addEventListener('click', function() {
        // Hide preview and show camera
        document.querySelector('#camera-tab .preview-container').style.display = 'none';
        document.querySelector('.camera-container').style.display = 'block';
        capturedImage = null;
    });
    
    // Analyze from camera
    analyzeCameraBtn.addEventListener('click', async function() {
        if (!capturedImage) {
            alert('Please capture an image first');
            return;
        }
        
        showLoading();
        
        try {
            // Convert data URL to blob
            const response = await fetch(capturedImage);
            const blob = await response.blob();
            const file = new File([blob], "camera-capture.png", { type: "image/png" });
            const formData = new FormData();
            formData.append('image', file);
            
            const apiResponse = await fetch('/api/food/analyze-image', {
                method: 'POST',
                body: formData
            });
            
            await handleAnalysisResponse(apiResponse);
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Image upload functionality
    const foodImage = document.getElementById('food-image');
    const uploadPreview = document.getElementById('upload-preview');
    const analyzeUploadBtn = document.getElementById('analyze-upload-btn');
    
    // Show image preview when file is selected
    foodImage.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                uploadPreview.src = e.target.result;
                uploadPreview.style.display = 'block';
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Analyze from upload
    analyzeUploadBtn.addEventListener('click', async function() {
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
            
            await handleAnalysisResponse(response);
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Save to food log
    const saveResultBtn = document.getElementById('save-result-btn');
    
    saveResultBtn.addEventListener('click', function() {
        const foodData = JSON.parse(localStorage.getItem('currentFoodAnalysis'));
        if (foodData) {
            // Get existing food log or initialize empty array
            let foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
            
            // Add timestamp
            foodData.timestamp = new Date().toISOString();
            
            // Add to log
            foodLog.push(foodData);
            
            // Save back to localStorage
            localStorage.setItem('foodLog', JSON.stringify(foodLog));
            
            alert('Food saved to your log!');
        }
    });
    
    // Shared functions
    const resultsContainer = document.getElementById('results-container');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    
    function showLoading() {
        // Get references to the elements
        const resultsContainer = document.getElementById('results-container');
        const loading = document.getElementById('loading');
        const results = document.getElementById('results');
        const saveResultBtn = document.getElementById('save-result-btn');
        
        // Show the results container and loading spinner
        if (resultsContainer) resultsContainer.style.display = 'block';
        if (loading) loading.style.display = 'flex'; // Change to flex to center spinner
        if (results) results.innerHTML = '';
        if (saveResultBtn) saveResultBtn.style.display = 'none';
        
        console.log("Loading spinner shown");
    }
    
    function showError(message) {
        results.textContent = `Error: ${message}`;
        loading.style.display = 'none';
    }
    
    async function handleAnalysisResponse(response) {
        try {
            // First check if the response is OK
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            // Try to parse JSON
            const data = await response.json();
            
            if (data.success) {
                try {
                    // Clean up the response - remove markdown formatting
                    let cleanJson = data.data;
                    
                    // Remove markdown code blocks if present
                    if (cleanJson.includes('```')) {
                        cleanJson = cleanJson.replace(/```json|```/g, '').trim();
                    }
                    
                    console.log("Cleaned JSON:", cleanJson);
                    
                    // Parse the data from Gemini
                    const parsedData = JSON.parse(cleanJson);
                    
                    // Store the raw data for saving to food log
                    localStorage.setItem('currentFoodAnalysis', JSON.stringify(parsedData));
                    
                    // Use our formatting function instead of showing raw JSON
                    const formattedHTML = formatNutritionData(parsedData);
                    results.innerHTML = formattedHTML;
                    
                    // Show save button
                    saveResultBtn.style.display = 'block';
                } catch (e) {
                    // If parsing fails, just show the raw response
                    results.textContent = data.data;
                    console.error("Error formatting data:", e);
                }
            } else {
                showError(data.error || 'Failed to analyze food');
            }
        } catch (error) {
            showError(`Failed to process response: ${error.message}`);
        } finally {
            // Make sure to hide the loading spinner when done, whether success or error
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        }
    }
    
    function formatNutritionData(data) {
        // Extract values (with fallbacks)
        const foodName = data.food_name || data.name || 'Unknown Food';
        const portionSize = data.portion_size || data.portionSize || 'Standard serving';
        const calories = data.calories || '0';
        
        // Handle nested macronutrients
        let protein = '0g';
        let carbs = '0g';
        let fat = '0g';
        let fiber = '0g';
        
        if (data.macronutrients) {
            protein = data.macronutrients.protein + 'g' || '0g';
            
            // Handle nested carbs
            if (typeof data.macronutrients.carbohydrates === 'object') {
                carbs = data.macronutrients.carbohydrates.total + 'g' || '0g';
                fiber = data.macronutrients.carbohydrates.fiber ? data.macronutrients.carbohydrates.fiber + 'g' : '0g';
            } else {
                carbs = data.macronutrients.carbohydrates + 'g' || '0g';
            }
            
            fat = data.macronutrients.fat + 'g' || '0g';
        } else {
            // Fallback to flat structure
            protein = data.protein ? 
                (data.protein.toString().endsWith('g') ? data.protein : data.protein + 'g') : 
                '0g';
            carbs = data.carbohydrates ? 
                (data.carbohydrates.toString().endsWith('g') ? data.carbohydrates : data.carbohydrates + 'g') : 
                '0g';
            fat = data.fat || data.fats ? 
                ((data.fat || data.fats).toString().endsWith('g') ? (data.fat || data.fats) : (data.fat || data.fats) + 'g') : 
                '0g';
            fiber = data.fiber ? 
                (data.fiber.toString().endsWith('g') ? data.fiber : data.fiber + 'g') : 
                '0g';
        }
        
        // Vitamins and minerals are combined in the JSON
        const micronutrients = data.vitamins_and_minerals || {};
        
        // Potential allergens
        const allergens = data.potential_allergens || data.allergens || [];
        
        // Start building the HTML
        let html = `
            <div class="nutrition-card">
                <h3 class="food-name">${foodName}</h3>
                <div class="portion-size">${portionSize}</div>
                <h3>Macronutrients</h3>
                                <div class="calories-section">
                    <div class="nutrition-label">Calories:</div>
                    <div class="nutrition-value">${calories}</div>
                </div>
                <div class="macro-section">
                    <div class="macro-item">
                        <div class="macro-label">Protein</div>
                        <div class="macro-value">${protein}</div>
                    </div>
                    <div class="macro-item">
                        <div class="macro-label">Carbohydrates</div>
                        <div class="macro-value">${carbs}</div>
                    </div>
                    <div class="macro-item">
                        <div class="macro-label">Fat</div>
                        <div class="macro-value">${fat}</div>
                    </div>
        `;
        
        // Add fiber if available
        if (fiber !== '0g') {
            html += `
                <div class="macro-item">
                    <div class="macro-label">Fiber</div>
                    <div class="macro-value">${fiber}</div>
                </div>
            `;
        }
        
        html += `</div>`;
        
        // Add micronutrients if available
        if (Object.keys(micronutrients).length > 0) {
            html += `<h3>Vitamins & Minerals</h3><div class="micronutrient-section">`;
            
            for (const [nutrient, value] of Object.entries(micronutrients)) {
                html += `
                    <div class="micro-item">
                        <div class="micro-label">${formatNutrientName(nutrient)}</div>
                        <div class="micro-value">${value}${getMicroUnit(nutrient)}</div>
                    </div>
                `;
            }
            
            html += `</div>`;
        }
        
        // Add allergens if available
        if (allergens && allergens.length > 0) {
            html += `<h3>Potential Allergens</h3><div class="allergens-section">`;
            
            if (typeof allergens === 'string') {
                // Handle case where allergens is a string
                html += `<div class="allergen-item">${allergens}</div>`;
            } else {
                // Handle case where allergens is an array
                allergens.forEach(allergen => {
                    html += `<div class="allergen-item">${allergen}</div>`;
                });
            }
            
            html += `</div>`;
        }
        
        // Check if we have a health assessment
        const healthAssessment = data.health_assessment || "No health assessment available.";

        // Add health assessment section to your html variable
        html += `
            <div class="health-assessment-section">
                <h3>Health Assessment</h3>
                <div class="health-assessment-content">
                    <p>${healthAssessment}</p>
                </div>
            </div>
        `;
        
        html += `</div>`;
        
        return html;
    }
    
    function formatNutrientName(name) {
        // Convert vitamin_c to Vitamin C
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    function getMicroUnit(nutrient) {
        // Add appropriate units to micronutrients
        if (nutrient.includes('vitamin')) {
            return ' mg';
        } else if (nutrient.includes('potassium') || nutrient.includes('sodium') || nutrient.includes('calcium')) {
            return ' mg';
        } else if (nutrient.includes('iron') || nutrient.includes('zinc') || nutrient.includes('manganese')) {
            return ' mg';
        }
        return '';
    }
});