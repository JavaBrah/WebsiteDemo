// Ensure the script runs after the DOM is fully loaded

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("user-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Retrieve values from the form
        let personFirstName = document.getElementById("First-Name").value.trim();
        let personLastName = document.getElementById("Last-Name").value.trim();
        let visitReason = document.getElementById("visit-reason").value.trim();

        // Validate inputs
        if (personFirstName === "" || personLastName === "" || visitReason === "") {
            alert("Please fill in all fields.");
            return;
        }
        

        // Display greeting message on the page
        greeting(personFirstName, personLastName, visitReason);
    });
});

// Function to display the greeting message on the page
function greeting(firstName, lastName, visitReason) {
    let message = `Hello, ${firstName} ${lastName}! Thank you for visiting. Reason: ${visitReason}`;

    // Select the placeholder paragraph
    let messageContainer = document.getElementById("greeting-message");

    // Update the paragraph with the greeting message
    messageContainer.textContent = message;
}