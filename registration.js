// registration.js - Fully Tested & Hardened Version
const form = document.getElementById("registrationForm");
const nameInput = document.getElementById("name");
const gmailInput = document.getElementById("gmail");
const collegeInput = document.getElementById("college");
const areaInput = document.getElementById("area");
const phoneInput = document.getElementById("phone");
const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("successMessage");

function showError(input, errorId, message) {
    const error = document.getElementById(errorId);
    if (error) error.textContent = message;
    input.classList.add("invalid");
    input.classList.remove("valid");
    input.setAttribute("aria-invalid", "true");
}

function showValid(input, errorId) {
    const error = document.getElementById(errorId);
    if (error) error.textContent = "";
    input.classList.remove("invalid");
    input.classList.add("valid");
    input.setAttribute("aria-invalid", "false");
}

function validateName() {
    const name = nameInput.value.trim();
    const pattern = /^[A-Za-z][A-Za-z .'-]{1,49}$/;

    if (name === "") {
        showError(nameInput, "nameError", "Please enter your full name.");
        return false;
    }
    if (!pattern.test(name)) {
        showError(nameInput, "nameError", "Enter a valid name (2-50 letters/spaces).");
        return false;
    }
    showValid(nameInput, "nameError");
    return true;
}

// BUG-03 Fix: Case-insensitive /i regex flag for Gmail address validation
function validateGmail() {
    const gmail = gmailInput.value.trim();
    const pattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

    if (gmail === "") {
        showError(gmailInput, "gmailError", "Please enter your Gmail address.");
        return false;
    }
    if (!pattern.test(gmail)) {
        showError(gmailInput, "gmailError", "Enter a valid Gmail address (e.g. user@gmail.com).");
        return false;
    }
    showValid(gmailInput, "gmailError");
    return true;
}

function validateCollege() {
    const college = collegeInput.value.trim();
    const pattern = /^[A-Za-z0-9][A-Za-z0-9 .,'&()/-]{1,99}$/;

    if (college === "") {
        showError(collegeInput, "collegeError", "Please enter your college name.");
        return false;
    }
    if (!pattern.test(college)) {
        showError(collegeInput, "collegeError", "Enter a valid college name (2-100 characters).");
        return false;
    }
    showValid(collegeInput, "collegeError");
    return true;
}

function validateArea() {
    const area = areaInput.value.trim();
    const pattern = /^[A-Za-z][A-Za-z .,'-]{1,79}$/;

    if (area === "") {
        showError(areaInput, "areaError", "Please enter your area or city.");
        return false;
    }
    if (!pattern.test(area)) {
        showError(areaInput, "areaError", "Enter a valid area or city name.");
        return false;
    }
    showValid(areaInput, "areaError");
    return true;
}

function validatePhone() {
    const phone = phoneInput.value.trim();
    const pattern = /^[6-9][0-9]{9}$/;

    if (phone === "") {
        showError(phoneInput, "phoneError", "Please enter your mobile number.");
        return false;
    }
    if (!pattern.test(phone)) {
        showError(phoneInput, "phoneError", "Enter a valid 10-digit mobile number (starts with 6-9).");
        return false;
    }
    showValid(phoneInput, "phoneError");
    return true;
}

// Live Validation Listeners
nameInput.addEventListener("input", validateName);
gmailInput.addEventListener("input", validateGmail);
collegeInput.addEventListener("input", validateCollege);
areaInput.addEventListener("input", validateArea);

// Numeric enforcement for mobile phone
phoneInput.addEventListener("input", function () {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    validatePhone();
});

// Form Submission Event Handler
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nameValid = validateName();
    const gmailValid = validateGmail();
    const collegeValid = validateCollege();
    const areaValid = validateArea();
    const phoneValid = validatePhone();

    if (nameValid && gmailValid && collegeValid && areaValid && phoneValid) {
        form.querySelectorAll(".form-group").forEach(group => {
            group.hidden = true;
        });
        submitBtn.hidden = true;
        successMessage.hidden = false;
        successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
        const firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) {
            firstInvalid.focus();
        }
    }
});
