import { Client, Account } from "appwrite";

const client = new Client();
client.setEndpoint("https://fra.cloud.appwrite.io/v1").setProject("67dfdda6003a5bb1f898");

const account = new Account(client);

document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const messageElement = document.getElementById("message");

    // Clear previous messages
    messageElement.textContent = "";
    messageElement.style.color = "red";

    if (password !== confirmPassword) {
        messageElement.textContent = "Passwords do not match.";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");
    const secret = urlParams.get("secret");

    if (!userId || !secret) {
        messageElement.textContent = "Invalid reset link.";
        return;
    }

    try {
        await account.updateRecovery(userId, secret, password, confirmPassword);
        messageElement.style.color = "green";
        messageElement.textContent = "Password reset successful. You can now log in.";
    } catch (error) {
        console.error("Error resetting password:", error);
        messageElement.textContent = `Error: ${error.message || "Failed to reset password. Please try again."}`;
    }
});