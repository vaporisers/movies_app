const client = new Appwrite.Client();
client.setEndpoint("https://fra.cloud.appwrite.io/v1").setProject("67dfdda6003a5bb1f898");

const account = new Appwrite.Account(client);

document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent page refresh

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const feedbackElement = document.getElementById("feedback");

    // Clear previous feedback
    feedbackElement.innerHTML = "";
    feedbackElement.style.color = "";

    if (password !== confirmPassword) {
        feedbackElement.innerHTML = `<span style="color: red;">&#10060; Passwords do not match.</span>`;
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");
    const secret = urlParams.get("secret");

    if (!userId || !secret) {
        feedbackElement.innerHTML = `<span style="color: red;">&#10060; Invalid reset link.</span>`;
        console.error("Invalid reset link: Missing userId or secret.");
        return;
    }

    try {
        console.log("Attempting password reset with:", { userId, secret });
        const response = await account.updateRecovery(userId, secret, password, confirmPassword);
        console.log("Password reset response:", response);

        feedbackElement.innerHTML = `<span style="color: green;">&#9989; Password reset successful. You can now log in.</span>`;
    } catch (error) {
        console.error("Error resetting password:", error);
        feedbackElement.innerHTML = `<span style="color: red;">&#10060; ${error.message || "Failed to reset password. Please try again."}</span>`;
    }
});