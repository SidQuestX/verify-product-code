// Product Authenticity Checker - Enhanced with Form Submission & Redirect Logic

// Configuration
const CONFIG = {
  EXPIRED_CODES: [
    "4526580",
    "exp123",
    "old456",
    "invalid1",
    "bad999",
    "expired2024",
  ],
  FRESH_CODES: [
    "abc123",
    "valid456",
    "fresh789",
    "new2024",
    "authentic1",
    "verified2025",
  ],
  MIN_CODE_LENGTH: 6,
  MAX_CODE_LENGTH: 20,
  VERIFICATION_DELAY: 2000,
  SUCCESS_PAGE: "result.html", //"success.html",
  ERROR_PAGE: "result.html", //"error.html",
  HOME_PAGE: "index.html",
};

// DOM Elements Cache
const elements = {
  form: null,
  productCodeInput: null,
  submitBtn: null,
  loading: null,
  btnText: null,
  codeError: null,
};

// Validation Functions
const validation = {
  // Validate product code format
  validateProductCode: function (code) {
    if (!code || typeof code !== "string") {
      return false;
    }

    const trimmedCode = code.trim();

    // Check length
    if (
      trimmedCode.length < CONFIG.MIN_CODE_LENGTH ||
      trimmedCode.length > CONFIG.MAX_CODE_LENGTH
    ) {
      return false;
    }

    // Check if alphanumeric only
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(trimmedCode);
  },

  // Check if code is valid or expired
  validateCodeStatus: function (code) {
    const upperCode = code.toUpperCase().trim();

    // Check against known fresh codes
    const isFresh = CONFIG.FRESH_CODES.some(
      (validCode) => upperCode === validCode.toUpperCase()
    );
    if (isFresh) {
      return { isValid: true, reason: "fresh_code" };
    }

    // Check against known expired codes
    const isExpired = CONFIG.EXPIRED_CODES.some(
      (expiredCode) => upperCode === expiredCode.toUpperCase()
    );
    if (isExpired) {
      // Still valid for redirect, but marked as expired
      return { isValid: true, reason: "expired_code" };
    }
    // Unknown codes → invalid
    return { isValid: false, reason: "invalid_code" };
  },
};

// Page Navigation & Redirect Handler
const redirectHandler = {
  // Redirect to success page
  redirectToSuccess: function (productCode, productStatus) {
    destroySessionStorageData();
    console.log(
      `✅ Product code ${productCode} is ${productStatus} - redirecting to success page`
    );

    sessionStorage.setItem(
      "couponData",
      JSON.stringify({ code: productCode, status: productStatus })
    );

    // Add transition effect
    this.addPageTransition(() => {
      // In a real application, this would redirect to the success page
      window.location.href = CONFIG.SUCCESS_PAGE;

      // For demo purposes, show success message
      //this.showSuccessResult(productCode);
    });
  },

  // Redirect to error page
  redirectToError: function (productCode, productStatus) {
    destroySessionStorageData();
    console.log(
      `❌ Product code ${productCode} is ${productStatus} - redirecting to error page`
    );
    sessionStorage.setItem(
      "couponData",
      JSON.stringify({ code: productCode, status: productStatus })
    );
    // Add transition effect
    this.addPageTransition(() => {
      // In a real application, this would redirect to the error page
      window.location.href = CONFIG.ERROR_PAGE;

      // For demo purposes, show error message
      //this.showErrorResult(productCode);
    });
  },

  // Redirect to home page
  redirectToHome: function () {
    destroySessionStorageData();
    console.log("🏠 Redirecting to home page");

    // Add loading effect
    const backBtn = event.target;
    if (backBtn) {
      const originalText = backBtn.textContent;
      backBtn.textContent = "Redirecting...";
      backBtn.disabled = true;
    }

    setTimeout(() => {
      // In a real application:
      window.location.href = CONFIG.HOME_PAGE;

      // For demo purposes, reset the form
      //this.resetToHome();
    }, 300);
  },

  // Add page transition effect
  addPageTransition: function (callback) {
    const container = document.querySelector(".container") || document.body;
    container.style.transition = "opacity 0.3s ease-out";
    container.style.opacity = "0.5";

    setTimeout(() => {
      if (callback) callback();
      container.style.opacity = "1";
    }, 300);
  },
};

// Mobile and Touch Enhancements
const mobileHandler = {
  // Check if device is mobile
  isMobile: function () {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  },

  // Handle mobile-specific behaviors
  init: function () {
    if (this.isMobile()) {
      this.preventZoom();
      this.addTouchFeedback();
      this.optimizeForMobile();
    }
  },

  // Prevent zoom on input focus (iOS)
  preventZoom: function () {
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        if (input.style.fontSize !== "16px") {
          input.style.fontSize = "16px";
        }
      });
    });
  },

  // Add touch feedback for buttons
  addTouchFeedback: function () {
    const touchElements = document.querySelectorAll(
      ".submit-btn, .back-btn, .contact-btn, .social-icon"
    );

    touchElements.forEach((element) => {
      element.addEventListener("touchstart", function () {
        this.style.transform = "scale(0.95)";
      });

      element.addEventListener("touchend", function () {
        this.style.transform = "";
      });
    });
  },

  // Mobile-specific optimizations
  optimizeForMobile: function () {
    // Increase tap target sizes
    const buttons = document.querySelectorAll(
      ".submit-btn, .back-btn, .contact-btn"
    );
    buttons.forEach((button) => {
      button.style.minHeight = "44px";
    });

    // Improve scrolling for result pages
    const container = document.querySelector(".container");
    if (container && window.innerHeight < 600) {
      container.style.maxHeight = "90vh";
      container.style.overflowY = "auto";
    }

    // Add haptic feedback support (if available)
    this.addHapticFeedback();
  },

  // Add haptic feedback for supported devices
  addHapticFeedback: function () {
    if ("vibrate" in navigator) {
      const buttons = document.querySelectorAll(
        ".submit-btn, .back-btn, .contact-btn"
      );
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          navigator.vibrate(50); // Short vibration
        });
      });
    }
  },
};

// Enhanced Form Handler with Submission Logic
const formHandler = {
  // Initialize form
  init: function () {
    this.cacheElements();
    this.bindEvents();
    this.focusInput();
    this.setupMobileKeyboard();
  },

  // Cache DOM elements
  cacheElements: function () {
    elements.form = document.getElementById("verificationForm");
    elements.productCodeInput = document.getElementById("productCode");
    elements.submitBtn = document.getElementById("submitBtn");
    elements.loading = document.getElementById("loading");
    elements.btnText = document.getElementById("btnText");
    elements.codeError = document.getElementById("codeError");
  },

  // Bind event listeners
  bindEvents: function () {
    if (elements.form) {
      // MAIN FORM SUBMISSION HANDLER
      elements.form.addEventListener("submit", this.handleSubmit.bind(this));
    }

    if (elements.productCodeInput) {
      elements.productCodeInput.addEventListener(
        "input",
        this.handleInput.bind(this)
      );
      elements.productCodeInput.addEventListener(
        "keypress",
        this.handleKeyPress.bind(this)
      );

      // Mobile-specific events
      if (mobileHandler.isMobile()) {
        elements.productCodeInput.addEventListener(
          "blur",
          this.handleMobileBlur.bind(this)
        );
      }
    }
  },

  // MAIN FORM SUBMISSION HANDLER
  handleSubmit: function (e) {
    e.preventDefault();

    console.log("🔄 Form submitted - starting verification process");

    const productCode = elements.productCodeInput.value.trim();

    // Reset previous errors
    this.resetErrors();

    // Validate input
    if (!validation.validateProductCode(productCode)) {
      this.showError(
        "Please enter a valid product code (6-20 alphanumeric characters)"
      );
      return;
    }

    // Start verification process with redirect logic
    this.startVerificationWithRedirect(productCode);
  },

  // Enhanced verification process with redirect logic
  startVerificationWithRedirect: function (productCode) {
    console.log(`🔍 Starting verification for code: ${productCode}`);

    // Show loading state
    this.setLoadingState(true);

    // Prevent multiple submissions
    if (elements.productCodeInput) {
      elements.productCodeInput.blur();
    }

    // Simulate API verification call
    setTimeout(() => {
      const validationResult = validation.validateCodeStatus(productCode);
      const isInvalid = !validationResult.isValid;

      console.log(`📋 Validation result:`, validationResult);
      destroySessionStorageData();

      // REDIRECT LOGIC BASED ON VERIFICATION RESULT
      if (isInvalid) {
        // Redirect to error page for expired/invalid codes
        redirectHandler.redirectToError(productCode);
      } else {
        // Redirect to success page for valid codes
        redirectHandler.redirectToSuccess(productCode,validationResult.reason);
      }

      // Reset loading state
      this.setLoadingState(false);
    }, CONFIG.VERIFICATION_DELAY);
  },

  // Setup mobile keyboard optimizations
  setupMobileKeyboard: function () {
    if (mobileHandler.isMobile() && elements.productCodeInput) {
      // Set inputmode for better mobile keyboard
      elements.productCodeInput.setAttribute("inputmode", "text");
      elements.productCodeInput.setAttribute("autocapitalize", "characters");
      elements.productCodeInput.setAttribute("autocomplete", "off");
      elements.productCodeInput.setAttribute("autocorrect", "off");
      elements.productCodeInput.setAttribute("spellcheck", "false");
    }
  },

  // Enhanced input handling for mobile
  handleInput: function (e) {
    let value = e.target.value;

    // Remove non-alphanumeric characters
    value = value.replace(/[^a-zA-Z0-9]/g, "");

    // Convert to uppercase for consistency
    value = value.toUpperCase();

    // Update input value
    e.target.value = value;

    // Reset errors if user is typing
    if (value.length > 0) {
      this.resetErrors();
    }

    // Mobile: Auto-submit if max length reached and valid
    if (
      mobileHandler.isMobile() &&
      value.length === CONFIG.MAX_CODE_LENGTH &&
      validation.validateProductCode(value)
    ) {
      setTimeout(() => {
        if (elements.submitBtn && !elements.submitBtn.disabled) {
          elements.submitBtn.click();
        }
      }, 500);
    }
  },

  handleKeyPress: function (e) {
    // Allow only alphanumeric characters, backspace, delete, etc.
    const allowedKeys = /^[a-zA-Z0-9]$/;
    const controlKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Enter",
    ];

    if (!allowedKeys.test(e.key) && !controlKeys.includes(e.key)) {
      e.preventDefault();
    }
  },

  // Handle mobile keyboard dismissal
  handleMobileBlur: function (e) {
    // Small delay to allow for button clicks
    setTimeout(() => {
      const value = e.target.value.trim();
      if (value && validation.validateProductCode(value)) {
        this.resetErrors();
      }
    }, 100);
  },

  setLoadingState: function (isLoading) {
    if (!elements.submitBtn || !elements.loading || !elements.btnText) return;

    elements.submitBtn.disabled = isLoading;
    elements.loading.style.display = isLoading ? "inline-block" : "none";
    elements.btnText.textContent = isLoading
      ? "VERIFYING..."
      : "VERIFY PRODUCT";

    // Add visual feedback for mobile
    if (isLoading && mobileHandler.isMobile()) {
      elements.submitBtn.style.opacity = "0.7";
    } else {
      elements.submitBtn.style.opacity = "";
    }
  },

  // Mobile-optimized error display
  showError: function (message) {
    if (elements.productCodeInput && elements.codeError) {
      elements.productCodeInput.classList.add("error");
      elements.codeError.textContent = message;
      elements.codeError.style.display = "block";

      // On mobile, scroll error into view
      if (mobileHandler.isMobile()) {
        setTimeout(() => {
          elements.codeError.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }

      elements.productCodeInput.focus();
    }
  },

  resetErrors: function () {
    if (elements.productCodeInput && elements.codeError) {
      elements.productCodeInput.classList.remove("error");
      elements.codeError.style.display = "none";
    }
  },

  focusInput: function () {
    if (elements.productCodeInput && !mobileHandler.isMobile()) {
      // Don't auto-focus on mobile to prevent keyboard popup
      elements.productCodeInput.focus();
    }
  },
};

function destroySessionStorageData() {
  // sessionStorage.removeItem("couponData");
  sessionStorage.clear();
}

// Result Page Handler
const resultHandler = {
  // Initialize result page
  init: function () {
    this.addPageAnimations();
  },

  // Add page animations
  addPageAnimations: function () {
    const container = document.querySelector(".result-container");
    if (container) {
      container.classList.add("fade-in");
    }
  },
};

// Navigation Functions
function goBack() {
  redirectHandler.redirectToHome();
}

// Ripple Effect for Buttons
function addRippleEffect() {
  const buttons = document.querySelectorAll(
    ".submit-btn, .back-btn, .contact-btn"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                  position: absolute;
                  border-radius: 50%;
                  background: rgba(255, 255, 255, 0.3);
                  transform: scale(0);
                  animation: ripple 0.6s linear;
                  left: ${x}px;
                  top: ${y}px;
                  width: ${size}px;
                  height: ${size}px;
              `;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add ripple animation
  const style = document.createElement("style");
  style.textContent = `
          @keyframes ripple {
              to {
                  transform: scale(4);
                  opacity: 0;
              }
          }
          
          .result-container {
              padding: 2rem;
              text-align: center;
          }
          
          .result-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
          }
          
          .result-icon.error {
              color: #ff6b6b;
          }
          
          .result-title {
              font-size: 1.5rem;
              margin-bottom: 2rem;
              color: #333;
          }
          
          .result-details {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 1.5rem;
              margin-bottom: 2rem;
              text-align: left;
          }
          
          .result-details p {
              margin: 0.5rem 0;
          }
          
          .status-valid {
              color: #28a745;
              font-weight: bold;
          }
          
          .status-invalid {
              color: #dc3545;
              font-weight: bold;
          }
          
          .warning-message {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 1rem;
              margin-bottom: 2rem;
              text-align: left;
          }
          
          .warning-message ul {
              margin: 0.5rem 0;
              padding-left: 1.5rem;
          }
          
          .result-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
          }
          
          .back-btn, .contact-btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-weight: bold;
              text-decoration: none;
              display: inline-block;
              position: relative;
              overflow: hidden;
              transition: all 0.3s ease;
          }
          
          .back-btn {
              background: #007bff;
              color: white;
          }
          
          .contact-btn {
              background: #28a745;
              color: white;
          }
          
          .back-btn:hover, .contact-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
      `;
  document.head.appendChild(style);
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Product Authenticity Checker initialized");

  // Initialize form handler
  formHandler.init();

  // Initialize mobile enhancements
  mobileHandler.init();

  // Add ripple effects
  addRippleEffect();

  // Initialize result handler if on result page
  if (document.querySelector(".result-container")) {
    resultHandler.init();
  }
});
