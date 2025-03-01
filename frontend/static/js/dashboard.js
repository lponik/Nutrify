document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const foodDescription = document.getElementById('food-description');
    const resultsContainer = document.getElementById('results-container');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');

    // Get references to all input fields
    const caloriesConsumed = document.getElementById('calories-consumed');
    const caloriesGoal = document.getElementById('calories-goal');
    const proteinConsumed = document.getElementById('protein-consumed');
    const proteinGoal = document.getElementById('protein-goal');
    const carbsConsumed = document.getElementById('carbs-consumed');
    const carbsGoal = document.getElementById('carbs-goal');
    const fatConsumed = document.getElementById('fat-consumed');
    const fatGoal = document.getElementById('fat-goal');
    
    if (caloriesConsumed) console.log('Calories consumed input found');
    else console.warn('Calories consumed input NOT found');
    
    // Debugging to verify elements are found
    console.log("Found input elements:", {
        caloriesConsumed: !!caloriesConsumed,
        caloriesGoal: !!caloriesGoal,
        proteinConsumed: !!proteinConsumed,
        proteinGoal: !!proteinGoal,
        carbsConsumed: !!carbsConsumed,
        carbsGoal: !!carbsGoal,
        fatConsumed: !!fatConsumed,
        fatGoal: !!fatGoal
    });
    
    // Make sure we only add listeners if elements exist
    if (caloriesConsumed) caloriesConsumed.addEventListener('input', updateCaloriesProgress);
    if (caloriesGoal) caloriesGoal.addEventListener('input', updateCaloriesProgress);
    if (proteinConsumed) proteinConsumed.addEventListener('input', updateProteinProgress);
    if (proteinGoal) proteinGoal.addEventListener('input', updateProteinProgress);
    if (carbsConsumed) carbsConsumed.addEventListener('input', updateCarbsProgress);
    if (carbsGoal) carbsGoal.addEventListener('input', updateCarbsProgress);
    if (fatConsumed) fatConsumed.addEventListener('input', updateFatProgress);
    if (fatGoal) fatGoal.addEventListener('input', updateFatProgress);
    
    // Get references to progress bars and text elements
    const caloriesProgress = document.getElementById('calories-progress');
    const caloriesText = document.getElementById('calories-text');
    const proteinProgress = document.getElementById('protein-progress');
    const proteinText = document.getElementById('protein-text');
    const carbsProgress = document.getElementById('carbs-progress');
    const carbsText = document.getElementById('carbs-text');
    const fatProgress = document.getElementById('fat-progress');
    const fatText = document.getElementById('fat-text');
    
    // Date picker
    const dateInput = document.getElementById('dashboard-date');
    
    // Save button
    const saveButton = document.getElementById('save-nutrition');
    
    // Load saved data when date changes
    dateInput.addEventListener('change', loadNutritionData);
    
    // Save button click event
    saveButton.addEventListener('click', saveNutritionData);
    
    // Initial load of data
    loadNutritionData();
    
    // Update progress functions
    function updateCaloriesProgress() {
        const consumed = parseFloat(caloriesConsumed.value) || 0;
        const goal = parseFloat(caloriesGoal.value) || 1;
        const percentage = Math.min(100, (consumed / goal) * 100);
        
        caloriesProgress.style.width = `${percentage}%`;
        caloriesText.textContent = `${consumed} / ${goal} kcal`;
        
        // Color coding based on percentage
        if (percentage >= 100) {
            caloriesProgress.style.backgroundColor = '#FF5252';
        } else if (percentage >= 90) {
            caloriesProgress.style.backgroundColor = '#FFC107';
        } else {
            caloriesProgress.style.backgroundColor = '#4CAF50';
        }
    }
    
    function updateProteinProgress() {
        const consumed = parseFloat(proteinConsumed.value) || 0;
        const goal = parseFloat(proteinGoal.value) || 1;
        const percentage = Math.min(100, (consumed / goal) * 100);
        
        proteinProgress.style.width = `${percentage}%`;
        proteinText.textContent = `${consumed} / ${goal} g`;
        
        if (percentage >= 100) {
            proteinProgress.style.backgroundColor = '#4CAF50';
        } else if (percentage >= 80) {
            proteinProgress.style.backgroundColor = '#8BC34A';
        } else {
            proteinProgress.style.backgroundColor = '#64B5F6';
        }
    }
    
    function updateCarbsProgress() {
        const consumed = parseFloat(carbsConsumed.value) || 0;
        const goal = parseFloat(carbsGoal.value) || 1;
        const percentage = Math.min(100, (consumed / goal) * 100);
        
        carbsProgress.style.width = `${percentage}%`;
        carbsText.textContent = `${consumed} / ${goal} g`;
        
        if (percentage >= 100) {
            carbsProgress.style.backgroundColor = '#FF9800';
        } else {
            carbsProgress.style.backgroundColor = '#FF9800';
        }
    }
    
    function updateFatProgress() {
        const consumed = parseFloat(fatConsumed.value) || 0;
        const goal = parseFloat(fatGoal.value) || 1;
        const percentage = Math.min(100, (consumed / goal) * 100);
        
        fatProgress.style.width = `${percentage}%`;
        fatText.textContent = `${consumed} / ${goal} g`;
        
        if (percentage >= 100) {
            fatProgress.style.backgroundColor = '#E040FB';
        } else {
            fatProgress.style.backgroundColor = '#E040FB';
        }
    }
    
    // Enhanced saveNutritionData function with better feedback
    function saveNutritionData() {
        console.log('Save button clicked'); // Debugging
        
        const date = dateInput.value;
        if (!date) {
            showMessage('Please select a date first', 'error');
            return;
        }
        
        const nutritionData = {
            calories: {
                consumed: parseFloat(caloriesConsumed.value) || 0,
                goal: parseFloat(caloriesGoal.value) || 2000
            },
            protein: {
                consumed: parseFloat(proteinConsumed.value) || 0,
                goal: parseFloat(proteinGoal.value) || 50
            },
            carbs: {
                consumed: parseFloat(carbsConsumed.value) || 0,
                goal: parseFloat(carbsGoal.value) || 250
            },
            fat: {
                consumed: parseFloat(fatConsumed.value) || 0,
                goal: parseFloat(fatGoal.value) || 70
            }
        };
        
        console.log('Saving data:', nutritionData); // Debug log
        
        // Save to localStorage under the date key
        const savedData = JSON.parse(localStorage.getItem('nutritionTrackerData') || '{}');
        savedData[date] = nutritionData;
        localStorage.setItem('nutritionTrackerData', JSON.stringify(savedData));
        
        // Show success message
        showMessage('Nutrition data saved successfully!', 'success');
        
        // Update progress bars to reflect saved data
        updateCaloriesProgress();
        updateProteinProgress();
        updateCarbsProgress();
        updateFatProgress();
    }
    
    function loadNutritionData() {
        const date = dateInput.value;
        const savedData = JSON.parse(localStorage.getItem('nutritionTrackerData') || '{}');
        
        if (savedData[date]) {
            const data = savedData[date];
            
            // Set input values
            caloriesConsumed.value = data.calories.consumed;
            caloriesGoal.value = data.calories.goal;
            proteinConsumed.value = data.protein.consumed;
            proteinGoal.value = data.protein.goal;
            carbsConsumed.value = data.carbs.consumed;
            carbsGoal.value = data.carbs.goal;
            fatConsumed.value = data.fat.consumed;
            fatGoal.value = data.fat.goal;
        } else {
            // Reset to defaults if no data for this date
            caloriesConsumed.value = 0;
            caloriesGoal.value = 2000;
            proteinConsumed.value = 0;
            proteinGoal.value = 50;
            carbsConsumed.value = 0;
            carbsGoal.value = 250;
            fatConsumed.value = 0;
            fatGoal.value = 70;
        }
        
        // Update all progress bars
        updateCaloriesProgress();
        updateProteinProgress();
        updateCarbsProgress();
        updateFatProgress();
    }
    
    function showMessage(message, type = 'success') {
        // Create or update message element
        let messageElement = document.getElementById('message-popup');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'message-popup';
            document.body.appendChild(messageElement);
        }
        
        // Remove any existing classes
        messageElement.className = '';
        
        // Add new classes
        if (type === 'error') {
            messageElement.classList.add('error');
        }
        
        messageElement.textContent = message;
        messageElement.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }
    
    // Fix for the sendToServer function that's causing issues
    function sendToServer(date, nutritionData) {
        fetch('/api/nutrition/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: date,
                data: nutritionData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Data saved to server');
            } else {
                console.error('Failed to save to server');
            }
        })
        .catch(error => console.error('Error:', error));
    }

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