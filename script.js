
// Page Register
var register = document.getElementsByClassName("register");
if (register.length > 0) {
    register[0].addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("register details");
        const name = e.target[0].value;
        const username = e.target[1].value;
        const email = e.target[2].value;
        const pass = e.target[3].value;
        const rePass = e.target[4].value;
        const role = e.target[5].value;

        registerRequest(name, username, email, pass, rePass, role)
        // console.log(e.target[0].value);
        // console.log(e.target[1].value);
        // console.log(e.target[2].value);
        // get username, password, role and make fetch request
    });
}

async function registerRequest(name, username, email, pass, rePass, role) {
    if (pass != rePass) {
        alert("password does not match re-password");
    } else {
        const response = await fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            Path:     "/",        // This applies to all requests to localhost
            Secure:   false,      // For localhost, you can leave this as false (since you're not using HTTPS)
            HttpOnly: true,       // Make sure the cookie can't be accessed via JavaScript
            // SameSite: http.SameSiteLaxMode, // Adjust this based on your needs
            body: JSON.stringify({ 
                name: name, 
                username: username, 
                email: email, 
                password: pass, 
                re_password: rePass, 
                role: role 
            })
        });
    
        if (response.ok) {
            alert('Registration successful!');
            window.location.href = "login.html"
            // window.location.href = 'admin.html';
        } else {
            alert('Registration failed');
        }
    }
}


// Page log in
var login = document.getElementsByClassName("login");
if (login.length > 0) {
    login[0].addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("login details");

        loginRequest(e.target[0].value, e.target[1].value, e.target[2].value);
    });
}

// make post request for login
async function loginRequest(username, pass, role) {
    const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        Path:     "/",        // This applies to all requests to localhost
        Secure:   false,      // For localhost, you can leave this as false (since you're not using HTTPS)
        HttpOnly: true,       // Make sure the cookie can't be accessed via JavaScript
        // SameSite: http.SameSiteLaxMode, // Adjust this based on your needs
        body: JSON.stringify({ username: username, password: pass, role:role })
    });

    if (response.ok) {
        alert('Login successful!');
        window.location.href = 'admin.html';
    } else {
        alert('Registration failed');
        console.log(response);
    }
}

// make post request for register

// admin pages
var admin = document.getElementsByClassName("admin");
if (admin.length > 0) { // make request to get data
    window.addEventListener("load", (e) => {
        // console.log("page loaded");
        // getPatientsData(e);
    })
}

// get admin data
async function getPatientsData(e) {
    const response = await fetch('http://localhost:8080/patients', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    if (response.ok) {
        alert('Registration successful!');
        // window.location.href = 'admin.html';
    } else {
        console.log(response);
        alert('Registration failed');
    }
}


// set width
// Select the input and select elements
const input = document.querySelector('input');
const select = document.querySelector('select');

if (input || select) {
    // Get the computed width of the input element
    const inputWidth = window.getComputedStyle(input).width;
    
    // Set the width of the select element to match the input
    select.style.width = inputWidth;
} 


// const openButton = document.getElementById('openButton');
// const closeButton = document.getElementById('closeButton');


// openButton.addEventListener('click', () => {
// });

// closeButton.addEventListener('click', () => {
// });

function openPopup(e) {
    e.preventDefault();
    const popupDiv = document.getElementById('popupDiv');
    if (popupDiv) {
        popupDiv.style.display = 'block';
    }
}

function closePopup(e) {
    e.preventDefault();
    const popupDiv = document.getElementById('popupDiv');
    if (popupDiv) {
        popupDiv.style.display = 'none';
    }
}

