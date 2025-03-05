/**
 * @file food_capture.js
 * @description Handles image capture and upload functionality for food analysis
 * 
 * This module manages the camera and file upload interfaces for food image analysis,
 * including:
 * - Accessing the device camera (front and rear)
 * - Capturing images from the camera feed
 * - Uploading existing images from the device
 * - Sending images to the backend for AI analysis
 * - Displaying and saving nutritional results
 * 
 * The module offers a dual-mode interface that lets users either take photos
 * directly with their device camera or upload existing food images.
 */

document.addEventListener('DOMContentLoaded', function() {
    /**
     * DOM ELEMENT REFERENCES
     * All HTML elements needed for the module's functionality
     */
    // UI Navigation elements
    const cameraOption = document.getElementById('camera-option');
    const uploadOption = document.getElementById('upload-option');
    const cameraSection = document.getElementById('camera-section');
    const uploadSection = document.getElementById('upload-section');
    
    // Camera interface elements
    const video = document.getElementById('video');           // Live video feed
    const canvas = document.getElementById('canvas');         // For image capture
    const flipCameraBtn = document.getElementById('flip-camera');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const analyzeCameraBtn = document.getElementById('analyze-camera-btn');
    
    // Upload interface elements
    const foodImage = document.getElementById('food-image');  // File input
    const uploadPreview = document.getElementById('upload-preview');
    const analyzeUploadBtn = document.getElementById('analyze-upload-btn');
    
    // Results display elements
    const resultsContainer = document.getElementById('results-container');
    const loading = document.getElementById('loading');       // Loading indicator
    const results = document.getElementById('results');       // Results content
    const saveResultBtn = document.getElementById('save-result-btn');
    
    // Container elements
    let cameraPreview = document.getElementById('camera-preview');
    let previewContainer = cameraPreview.closest('.preview-container');
    let cameraContainer = document.querySelector('.camera-container');
    
    /**
     * CAMERA STATE VARIABLES
     * Tracks the state of camera operations
     */
    let stream;                      // MediaStream object for camera access
    let facingMode = 'environment';  // Camera direction ('environment'=rear, 'user'=front)
    let capturedImage = null;        // Data URL of captured image
    
    /**
     * UI NAVIGATION
     * Handles switching between camera and upload interfaces
     */
    
    /**
     * Activates the camera interface and initializes the camera
     * Deactivates the upload interface
     */
    cameraOption.addEventListener('click', function() {
        cameraOption.classList.add('active');
        uploadOption.classList.remove('active');
        cameraSection.classList.add('active');
        uploadSection.classList.remove('active');
        initCamera();
    });
    
    /**
     * Activates the upload interface and stops the camera
     * Deactivates the camera interface
     */
    uploadOption.addEventListener('click', function() {
        uploadOption.classList.add('active');
        cameraOption.classList.remove('active');
        uploadSection.classList.add('active');
        cameraSection.classList.remove('active');
        stopCamera();
    });
    
    /**
     * CAMERA FUNCTIONALITY
     * Methods for camera initialization, capture, and control
     */
    
    /**
     * Initializes the device camera with the current facing mode
     * Requests camera permissions and sets up the video stream
     * 
     * @async
     * @throws {Error} If camera access is denied or unavailable
     */
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
    
    /**
     * Stops the active camera stream and releases resources
     * Should be called when the camera is no longer needed
     */
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }
    
    /**
     * Toggles between front and rear cameras
     * Reinitializes the camera with the new facing mode
     */
    flipCameraBtn.addEventListener('click', function() {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        initCamera();
    });
    
    /**
     * Captures the current frame from the video feed
     * Converts it to an image and displays the preview
     */
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
    
    /**
     * Discards the captured image and returns to the camera view
     * Allows the user to capture a new image
     */
    retakeBtn.addEventListener('click', function() {
        // Hide preview and show camera
        previewContainer.style.display = 'none';
        cameraContainer.style.display = 'block';
        capturedImage = null;
    });
    
    /**
     * IMAGE UPLOAD FUNCTIONALITY
     * Handles file selection and preview
     */
    
    /**
     * Displays a preview of the selected image file
     * Triggered when the user selects an image file
     */
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
    
    /**
     * IMAGE ANALYSIS
     * Functions for sending images to the backend and handling results
     */
    
    /**
     * Sends the captured camera image to the backend for analysis
     * Converts the data URL to a File object before sending
     */
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
    
    /**
     * Sends the uploaded image to the backend for analysis
     * Uses the selected file from the file input
     */
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
    
    /**
     * DATA STORAGE
     * Functions for saving and retrieving food analysis data
     */
    
    /**
     * Saves the current food analysis to the user's food log
     * Adds a timestamp to track when the food was logged
     */
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
    
    /**
     * UI HELPER FUNCTIONS
     * Functions for managing loading states and displaying results
     */
    
    /**
     * Shows the loading indicator and prepares the results container
     * Clears any previous results and hides the save button
     */
    function showLoading() {
        loading.style.display = 'block';
        resultsContainer.style.display = 'block';
        results.textContent = '';
        saveResultBtn.style.display = 'none';
    }
    
    /**
     * Displays an error message in the results container
     * Hides the loading indicator
     * 
     * @param {string} message - The error message to display
     */
    function showError(message) {
        results.textContent = `Error: ${message}`;
        loading.style.display = 'none';
    }
    
    /**
     * Processes the API response and displays the results
     * Parses the JSON and formats it for display
     * 
     * @async
     * @param {Response} response - The fetch Response object
     */
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
    
    /**
     * INITIALIZATION
     * Automatically run on page load
     */
    
    // Initialize the camera by default
    initCamera();
});