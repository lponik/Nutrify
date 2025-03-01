// This file contains JavaScript code for capturing food images and interacting with the Gemini API.

document.getElementById('capture-button').addEventListener('click', function() {
    const imageInput = document.getElementById('image-input');
    const file = imageInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        fetch('/api/food/capture', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayNutrientInfo(data.nutrients);
            } else {
                alert('Error capturing food image: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        alert('Please select an image to capture.');
    }
});

function displayNutrientInfo(nutrients) {
    const nutrientDisplay = document.getElementById('nutrient-info');
    nutrientDisplay.innerHTML = '';

    nutrients.forEach(nutrient => {
        const nutrientElement = document.createElement('div');
        nutrientElement.textContent = `${nutrient.name}: ${nutrient.amount} ${nutrient.unit}`;
        nutrientDisplay.appendChild(nutrientElement);
    });
}