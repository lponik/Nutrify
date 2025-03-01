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

    // Profile tab functionality
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    
    // Load existing profile data
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (profile.username) usernameInput.value = profile.username;
    if (profile.email) emailInput.value = profile.email;
    
    // Save profile
    saveProfileBtn.addEventListener('click', function() {
        const newProfile = {
            username: usernameInput.value,
            email: emailInput.value
        };
        
        localStorage.setItem('userProfile', JSON.stringify(newProfile));
        alert('Profile saved successfully!');
    });

    // Food log tab functionality
    const logDateInput = document.getElementById('log-date');
    const foodLogContainer = document.getElementById('food-log-container');
    
    // Load food log for selected date
    logDateInput.addEventListener('change', loadFoodLog);
    
    function loadFoodLog() {
        const selectedDate = logDateInput.value;
        const foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
        
        // Filter for entries on the selected date
        const dateEntries = foodLog.filter(entry => {
            if (!entry.timestamp) return false;
            return entry.timestamp.startsWith(selectedDate);
        });
        
        // Render food log entries
        if (dateEntries.length > 0) {
            let html = '<ul class="food-log-list">';
            
            dateEntries.forEach((entry, index) => {
                const time = new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                html += `
                    <li class="food-log-item">
                        <div class="food-log-time">${time}</div>
                        <div class="food-log-name">${entry.name || 'Unknown food'}</div>
                        <div class="food-log-nutrients">
                            <span>${entry.calories || 0} kcal</span>
                            <span>${entry.protein || 0}g protein</span>
                            <span>${entry.carbs || 0}g carbs</span>
                            <span>${entry.fat || 0}g fat</span>
                        </div>
                        <button class="delete-log-btn" data-index="${index}">Remove</button>
                    </li>
                `;
            });
            
            html += '</ul>';
            foodLogContainer.innerHTML = html;
            
            // Add delete functionality
            document.querySelectorAll('.delete-log-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    const foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
                    foodLog.splice(index, 1);
                    localStorage.setItem('foodLog', JSON.stringify(foodLog));
                    loadFoodLog(); // Reload the food log
                });
            });
        } else {
            foodLogContainer.innerHTML = '<p class="empty-message">No food entries found for this date.</p>';
        }
    }
    
    // Goals tab functionality
    const goalCaloriesInput = document.getElementById('goal-calories');
    const goalProteinInput = document.getElementById('goal-protein');
    const goalCarbsInput = document.getElementById('goal-carbs');
    const goalFatInput = document.getElementById('goal-fat');
    const saveGoalsBtn = document.getElementById('save-goals-btn');
    
    // Load existing goals
    const goals = JSON.parse(localStorage.getItem('nutrientGoals') || '{}');
    if (goals.calories) goalCaloriesInput.value = goals.calories;
    if (goals.protein) goalProteinInput.value = goals.protein;
    if (goals.carbs) goalCarbsInput.value = goals.carbs;
    if (goals.fat) goalFatInput.value = goals.fat;
    
    // Save goals
    saveGoalsBtn.addEventListener('click', function() {
        const newGoals = {
            calories: parseInt(goalCaloriesInput.value) || 2000,
            protein: parseInt(goalProteinInput.value) || 50,
            carbs: parseInt(goalCarbsInput.value) || 300,
            fat: parseInt(goalFatInput.value) || 70
        };
        
        localStorage.setItem('nutrientGoals', JSON.stringify(newGoals));
        alert('Nutrient goals saved successfully!');
    });
    
    // Initialize food log on page load
    loadFoodLog();
});