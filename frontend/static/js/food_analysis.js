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
        loading.style.display = 'block';
        resultsContainer.style.display = 'block';
        results.textContent = '';
        saveResultBtn.style.display = 'none';
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
                // Format JSON response for better readability
                try {
                    const parsedData = JSON.parse(data.data);
                    const formattedData = JSON.stringify(parsedData, null, 2);
                    results.innerHTML = '<pre>' + formattedData + '</pre>';
                    
                    // Store the current analysis for saving
                    localStorage.setItem('currentFoodAnalysis', JSON.stringify(parsedData));
                    
                    // Show save button
                    saveResultBtn.style.display = 'block';
                } catch (e) {
                    // If parsing fails, just show the raw response
                    results.textContent = data.data;
                }
            } else {
                showError(data.error || 'Failed to analyze food');
            }
        } catch (error) {
            showError(`Failed to process response: ${error.message}`);
        } finally {
            loading.style.display = 'none';
        }
    }
});