document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const cameraOption = document.getElementById('camera-option');
    const uploadOption = document.getElementById('upload-option');
    const cameraSection = document.getElementById('camera-section');
    const uploadSection = document.getElementById('upload-section');
    
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const flipCameraBtn = document.getElementById('flip-camera');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const analyzeCameraBtn = document.getElementById('analyze-camera-btn');
    
    const foodImage = document.getElementById('food-image');
    const uploadPreview = document.getElementById('upload-preview');
    const analyzeUploadBtn = document.getElementById('analyze-upload-btn');
    
    const resultsContainer = document.getElementById('results-container');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const saveResultBtn = document.getElementById('save-result-btn');
    
    let cameraPreview = document.getElementById('camera-preview');
    let previewContainer = cameraPreview.closest('.preview-container');
    let cameraContainer = document.querySelector('.camera-container');
    
    // Camera variables
    let stream;
    let facingMode = 'environment'; // Start with rear camera
    let capturedImage = null;
    
    // Switch between camera and upload options
    cameraOption.addEventListener('click', function() {
        cameraOption.classList.add('active');
        uploadOption.classList.remove('active');
        cameraSection.classList.add('active');
        uploadSection.classList.remove('active');
        initCamera();
    });
    
    uploadOption.addEventListener('click', function() {
        uploadOption.classList.add('active');
        cameraOption.classList.remove('active');
        uploadSection.classList.add('active');
        cameraSection.classList.remove('active');
        stopCamera();
    });
    
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
        cameraContainer.style.display = 'none';
        previewContainer.style.display = 'block';
    });
    
    // Retake photo
    retakeBtn.addEventListener('click', function() {
        // Hide preview and show camera
        previewContainer.style.display = 'none';
        cameraContainer.style.display = 'block';
        capturedImage = null;
    });
    
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
    
    // Analyze from camera
    analyzeCameraBtn.addEventListener('click', function() {
        if (!capturedImage) {
            alert('Please capture an image first');
            return;
        }
        
        showLoading();
        
        // Convert data URL to blob
        fetch(capturedImage)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "camera-capture.png", { type: "image/png" });
                const formData = new FormData();
                formData.append('image', file);
                
                return fetch('/api/food/analyze-image', {
                    method: 'POST',
                    body: formData
                });
            })
            .then(handleAnalysisResponse)
            .catch(error => {
                showError(error.message);
            });
    });
    
    // Analyze from upload
    analyzeUploadBtn.addEventListener('click', function() {
        if (!foodImage.files || !foodImage.files[0]) {
            alert('Please select an image to analyze.');
            return;
        }
        
        showLoading();
        
        const formData = new FormData();
        formData.append('image', foodImage.files[0]);
        
        fetch('/api/food/analyze-image', {
            method: 'POST',
            body: formData
        })
        .then(handleAnalysisResponse)
        .catch(error => {
            showError(error.message);
        });
    });
    
    // Save result to food log
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
    
    // Initialize the camera by default
    initCamera();
});