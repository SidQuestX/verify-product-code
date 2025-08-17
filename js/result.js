// Get product data
window.onload = () => {
    const productData = JSON.parse(sessionStorage.getItem("couponData"));
    if (productData && productData.code) {
      console.log(productData.status);

      console.log(productData.code);
      document.getElementById("productCodeDisplay").textContent =
        productData.code || "N/A";
    } else {
      window.location.href = "index.html";
    }

    const productStatusEl = document.getElementById("productStatus");
    const resultIconBox = document.querySelector(".result-icon");
    const resultIconEl = document.querySelector(".result-icon .icon-symbol");
    const resultTitle = document.querySelector(".result-title");
    const resultMessage = document.querySelector(".result-message");

    // Example status from your API
    const status = productData.status; // "fresh_code", "expired_code", "invalid"

    // Reset previous classes
    productStatusEl.className = "";
    resultIconBox.classList.remove("verified", "invalid", "expired");
    resultTitle.classList.remove(
      "verified-title",
      "expired-title",
      "invalid-title"
    );

    // Add new class + text
    if (status === "fresh_code") {
      productStatusEl.classList.add("status-verified");
      productStatusEl.textContent = "Verified & Authentic";
      resultIconBox.classList.add("verified");
      resultIconEl.textContent = "✓"; // green check
      resultTitle.textContent = "100% Genuine Product";
      resultMessage.textContent =
        "Congratulations! Your product has been successfully verified as authentic and genuine.";
    } else if (status === "expired_code") {
      productStatusEl.classList.add("status-expired");
      productStatusEl.textContent = "Expired Code";
      resultIconBox.classList.add("expired");
      resultIconEl.textContent = "⏳"; // hourglass
      resultTitle.classList.add("expired-title");
      resultTitle.textContent = "Expired Code";
      resultMessage.textContent =
        "This code was genuine but has already been used earlier. Please check with the retailer if needed.";
    } else {
      productStatusEl.classList.add("status-invalid");
      productStatusEl.textContent = "Invalid Code";
      resultIconBox.classList.add("invalid");
      resultIconEl.textContent = "⚠️"; // warning
      resultTitle.classList.add("invalid-title");
      resultTitle.textContent = "Invalid Code";
      resultMessage.textContent =
        "Sorry! The code you entered is invalid. Please try again or contact support.";
    }
  };