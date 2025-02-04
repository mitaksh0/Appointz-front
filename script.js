
// admin info 
var adminInfoGlobal;
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
        } else {
            alert('Registration failed');
        }
    }
}


// Page log in
var login = document.getElementsByClassName("login");
if (login.length > 0) {
    login[0].addEventListener('submit',async (e) => {
        e.preventDefault();
        const loginInfo = {
            username: e.target[0].value,
            password: e.target[1].value,
            role: e.target[2].value
        }
        const url = "http://localhost:8080/login";
        const res = await makeAPIRequest(loginInfo, 'POST', url);
        if (!res || (res.status_code != 200 && res.status_code != 201) ) {
            alert(res.message);
        } else {
            window.location.href = 'admin.html';
        }
    });
}


const logout = document.getElementById("logout");
if (logout) {
    logout.addEventListener('click', async(e) => {
        const url = "http://localhost:8080/logout";
        const res = await makeAPIRequest({}, 'DELETE', url);

        if (!res || (res.status_code != 200 && res.status_code != 201)) {
            alert(res.message);
        } else {
            window.location.href = 'login.html';
        }
    })
}

// set width
// Select the input and select elements
const input = document.querySelector('input');
const select = document.querySelector('select');

if (input && select) {
    // Get the computed width of the input element
    const inputWidth = window.getComputedStyle(input).width;
    
    // Set the width of the select element to match the input
    select.style.width = inputWidth;
} 


// make post request for register

// admin pages
var admin = document.getElementsByClassName("admin");
if (admin.length > 0) { // make request to get data
    window.addEventListener("load", async (e) => {

        // get admin info, if not authorized return to home page
        var url = "http://localhost:8080/admin";
        const adminRes = await makeAPIRequest({}, 'GET', url);
        if (!adminRes || (adminRes.status_code != 200 && adminRes.status_code != 201 )) {
            alert(adminRes.message);
        } else {
            const adminInfo = document.getElementById("admin-info");
            adminInfo.innerText = `Welcome, ${adminRes.message.name} (${adminRes.message.type})`;
            adminInfoGlobal = adminRes.message;
            if (adminInfoGlobal.type == "doctor") {
                const buttons = document.querySelectorAll('.admin-access');

                buttons.forEach(button => button.remove());
            }
        }

        url = "http://localhost:8080/appointments";
        var res = await makeAPIRequest({}, 'GET', url);
        if (!res || (res.status_code != 200 && res.status_code != 201 )) {
            alert(res.message);
        } else {
            // fill data
            const appBody = document.getElementById("appointments-body");
            if (appBody) {
                var htmlText = ``;
                
                res.message.forEach(e => {
                    var docInfo = 'Not Assigned';
                    if (e.doctor_info && e.doctor_info.name != "") {
                        docInfo = `Dr. ${e.doctor_info.name}`;
                    }

                    htmlText += `
                    <tr>
                    <td>${e.appointment_date} ${e.appointment_time}</td>
                    <td>${e.patient_info.first_name} ${e.patient_info.last_name} (${e.patient_info.gender})</td>
                    <td>${docInfo}</td>
                    <td>${e.reception_info.name}</td>
                    <td>${e.notes}</td>
                    <td>
                        <div>
                            <button class="btn-form edit-appointment" app-id=${e.id}>Edit</button>
                            <button class="btn-form delete admin-access" app-id=${e.id} onclick="deleteAppointment(event)">Delete</button>
                        </div>
                    </td>
                    </tr>
                    `
                })

                appBody.innerHTML = htmlText;
            }

            const appointmentDiv = document.querySelectorAll('.edit-appointment');
            if (appointmentDiv.length > 0) {
                appointmentDiv.forEach(e => {
                    e.addEventListener('click', async (elem)=> {
                        const popupDiv = document.getElementById("popup-edit-appointment");
                        popupDiv.style.display = 'block';

                        // fill the relevant details of appointment
                        const id = elem.target.getAttribute("app-id");
                        var url = `http://localhost:8080/appointments?id=${id}`;
                        var appInfo = await makeAPIRequest({}, 'GET', url);
                        if (!appInfo || (appInfo.status_code != 200 && appInfo.status_code != 201 )) {
                            alert(appInfo.message);
                        } else {
                            // Set data attribute for the button
                            const buttons = popupDiv.querySelectorAll("button");
                            if (buttons.length > 1) {
                                buttons[1].setAttribute("data-app-id", appInfo.message.id);
                            }

                            // Set value of all input elements
                            const inputs = popupDiv.querySelectorAll("input");
                            if (inputs.length == 4) {
                                inputs[0].value = appInfo.message.appointment_date;
                                inputs[1].value = convertTo24Hour(appInfo.message.appointment_time);
                                inputs[2].value = appInfo.message.notes;
                                inputs[3].value = appInfo.message.reception_info.name;
                            }

                            // set value options of patients and doctors
                            const selects = popupDiv.querySelectorAll("select");

                            // select the correct option 
                            // get patients data
                            url = "http://localhost:8080/patients";
                            const patientInfo = await makeAPIRequest({}, 'GET', url);
                            if (!patientInfo || (patientInfo.status_code != 200 && patientInfo.status_code != 201 )) {
                                alert(patientInfo.message);
                            } else if (patientInfo.message.length > 0) {
                                var setHTML = `<option value="" disabled selected>Select</option>`;

                                patientInfo.message.forEach((e) => {
                                    setHTML += `<option value=${e.id}>${e.first_name} ${e.last_name}</option>`;
                                })

                                selects[0].innerHTML = setHTML;
                            }

                            // get all doctors
                            url = `http://localhost:8080/users?role=doctor`;
                            const docInto = await makeAPIRequest({}, "GET" , url);
                            if (!docInto || (docInto.status_code != 200 && docInto.status_code != 201)) {
                                alert(docInto.message);
                            } else {
                                // edit-appointment-patient-select
                                var setHTML = `<option value="" disabled selected>Select</option>`;

                                docInto.message.forEach((e) => {
                                    setHTML += `<option value=${e.id}>Dr. ${e.name}</option>`;
                                })

                                selects[1].innerHTML = setHTML;
                            }

                            // mark correct option selected
                            for (let option of selects[0].options) {
                                if (option.value == appInfo.message.patient_info.id) {
                                  option.selected = true;
                                  selects[0].options.selected = false;
                                  break;
                                }
                            }

                            for (let option of selects[1].options) {
                                if (option.value == appInfo.message.doctor_info.id) {
                                  option.selected = true;
                                  selects[0].options.selected = false;
                                  break;
                                }
                            }
                        }
                    })
                })
            }

            if (adminInfoGlobal.type == "doctor") {
                const buttons = document.querySelectorAll('.admin-access');

                buttons.forEach(button => button.remove());
            }
        }
    })
}

// update appointment
async function updateAppointForm(event) {
    event.preventDefault(); // Prevent the form from refreshing the page
  
    const button = event.target.querySelector('button'); // Find the button inside the form
    const appId = button.getAttribute('data-app-id'); // Get the app-id attribute
   
    const appointment = {
        patient_id: event.target[0].value,
        doctor_id: event.target[1].value,
        appointment_date: event.target[2].value,
        appointment_time: event.target[3].value,
        notes: event.target[4].value
    }
    url = `http://localhost:8080/appointments?id=${appId}`;
    res = await makeAPIRequest(appointment, 'PUT', url);
    if (!res || (res.status_code != 200 && res.status_code != 201 )) {
        alert(res.message);
    } else {
        location.reload();
    }
  }

// delete appointment
async function deleteAppointment(e) {
    const id = e.target.getAttribute("app-id");
    url = `http://localhost:8080/appointments?id=${id}`;
    res = await makeAPIRequest({}, 'DELETE', url);
    if (!res || (res.status_code != 200 && res.status_code != 201 )) {
        alert(res.message);
    } else {
        location.reload();
    }
}

// popup management
function closePopup(e) {
    // e.preventDefault();
    // const popupDiv = document.getElementById('popupDiv');
    const button = e.target;
    const popupDiv = button.closest('.popupDiv');
    if (popupDiv) {
        popupDiv.style.display = 'none';
    }
}



// CRUD on Patients and Appointments
// same popup
// if add patient/appointment is clicked, relevant form fields will be populated
// if edit, update patient clicked, their custom form fields will be populated along with the data filled

// create
const addPatient = document.getElementById("add-patient");
if (addPatient) {
    addPatient.addEventListener('click', (e)=> {
        const patientDiv = document.getElementById('popup-add-patient');
        if (patientDiv) {
            patientDiv.style.display = 'block';
        }
    })
}

// read + update + delete
const editPatient = document.getElementById("edit-patient");
// const editPatient = document.getElementById("edit-patient");
if (editPatient) {
    editPatient.addEventListener('click', async (e) => {
        const patientDiv = document.getElementById('popup-edit-patient');
        if (patientDiv) {
            patientDiv.style.display = 'block';

            const editPatientSelect = patientDiv.querySelectorAll("select");
            if (editPatientSelect.length > 0) {
                // get patients data
                const url = "http://localhost:8080/patients";
                const res = await makeAPIRequest({}, 'GET', url);
                if (!res || (res.status_code != 200 && res.status_code != 201 )) {
                    alert(res.message);
                } else if (res.message.length > 0) {
                    var setHTML = `<option value="" disabled selected>Select</option>`

                    res.message.forEach((e) => {
                        setHTML += `<option value=${e.id}>${e.first_name} ${e.last_name}</option>`
                    })

                    editPatientSelect[0].innerHTML = setHTML;
                }
            }
        }
    })
}

const editSelect = document.getElementById("edit-patient-select");
if (editSelect) {
    editSelect.addEventListener('change',async (e)=> {
        const patientId = e.target.value;
        // get patient info from id
        const url = "http://localhost:8080/patients" + `?id=${patientId}`;
        const res = await makeAPIRequest({}, 'GET', url);
        if (!res || (res.status_code != 200 && res.status_code != 201 )) {
            alert(res.message);
        } else {
            // fill form with the res.message data
            const formParent = document.getElementById("popup-edit-patient")
            if (formParent) {
                const forms = formParent.getElementsByTagName("form");
                if (forms.length > 0) {
                    const inputs = forms[0].getElementsByTagName("input");
                    if (inputs.length == 6) {
                        inputs[0].value = res.message.first_name;
                        inputs[1].value = res.message.last_name;
                        inputs[2].value = res.message.gender;
                        inputs[3].value = res.message.contact;
                        inputs[4].value = res.message.address;
                        inputs[5].value = res.message.date_of_birth;
                    }
                }
            }
        }
    })
}

// update patient
const updatePatient = document.getElementById("update-patient");
if (updatePatient) {
    updatePatient.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectElemenet = document.getElementById("edit-patient-select");
        if (selectElemenet) {
            addPatientForm(e, "PUT", selectElemenet.value)
        }
    })

    // delete
    updatePatient.addEventListener('reset', async (e) => {
        e.preventDefault();
        const selectElemenet = document.getElementById("edit-patient-select");
        if (selectElemenet) {
            const patientId = selectElemenet.value;
            var url = `http://localhost:8080/patients?id=${patientId}`;
            const res = await makeAPIRequest({}, "DELETE" , url);
            if (!res || (res.status_code != 200 && res.status_code != 201)) {
                alert(res.message);
            } else {
                location.reload();
            }
        }
        // addPatientForm(e, method, id)
    })
}

// create
const addAppointment = document.getElementById("add-appointment");
if (addAppointment) {
    addAppointment.addEventListener('click',async (e) => {
        const addAppointmentDiv = document.getElementById("popup-add-appointment"); 
        
        // get list of patients and doctors and fill dropdown
        var url = `http://localhost:8080/users?role=doctor`;
        var res = await makeAPIRequest({}, "GET" , url);
        if (!res || (res.status_code != 200 && res.status_code != 201)) {
            alert(res.message);
        } else {
            // edit-appointment-patient-select
            var setHTML = `<option value="" disabled selected>Select</option>`

            res.message.forEach((e) => {
                setHTML += `<option value=${e.id}>Dr. ${e.name}</option>`
            })

            const addAppointmentDoctor = document.getElementById("edit-doctor-select")
            if (addAppointmentDoctor) {
                addAppointmentDoctor.innerHTML = setHTML
            }
        }

        url = "http://localhost:8080/patients";
        res = await makeAPIRequest({}, 'GET', url);
        if (!res || (res.status_code != 200 && res.status_code != 201 )) {
            alert(res.message);
        } else if (res.message.length > 0) {
            var setHTML = `<option value="" disabled selected>Select</option>`

            res.message.forEach((e) => {
                setHTML += `<option value=${e.id}>${e.first_name} ${e.last_name}</option>`
            })

            const addAppointmentPatient = document.getElementById("edit-appointment-patient-select")
            if (addAppointmentPatient) {
                addAppointmentPatient.innerHTML = setHTML
            }
        }

        addAppointmentDiv.style.display = 'block';
    })
}

async function addAppointForm(e) {
    e.preventDefault();
    const appointment = {
        patient_id: e.target[0].value,
        doctor_id: e.target[1].value,
        appointment_date: e.target[2].value,
        appointment_time: e.target[3].value,
        notes: e.target[4].value
    }
    url = "http://localhost:8080/appointments";
    res = await makeAPIRequest(appointment, 'POST', url);
    if (!res || (res.status_code != 200 && res.status_code != 201 )) {
        alert(res.message);
    } else {
        location.reload();
    }
}

// read + update + delete
const appointmentDiv = document.getElementsByClassName('edit-appointment');
if (appointmentDiv.length > 0) {
    appointmentDiv.forEach(e => {
        e.addEventListener('click', ()=> {
            e.style.display = 'block';
        })
    })
}

async function addPatientForm(e, method, id) {
    e.preventDefault();
    const patient = {
        first_name: e.target[0].value,
        last_name: e.target[1].value,
        gender: e.target[2].value,
        contact: e.target[3].value,
        address: e.target[4].value,
        date_of_birth: e.target[5].value
    }

    var url = "http://localhost:8080/patients";

    if (id > 0) {
        url += `?id=${id}`;
    }

    const res = await makeAPIRequest(patient, method, url);
    if (!res || (res.status_code != 200 && res.status_code != 201)) {
        alert(res.message);
    } else {
        location.reload();
    }
}

async function makeAPIRequest(data, method, url) {

    try {
        var response;
        
        if (method == "GET") {
            response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                Path:     "/",        // This applies to all requests to localhost
                Secure:   false,      // For localhost, you can leave this as false (since you're not using HTTPS)
                HttpOnly: true,       // Make sure the cookie can't be accessed via JavaScript
                // SameSite: http.SameSiteLaxMode, // Adjust this based on your needs
            });
        } else {
            response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                Path:     "/",        // This applies to all requests to localhost
                Secure:   false,      // For localhost, you can leave this as false (since you're not using HTTPS)
                HttpOnly: true,       // Make sure the cookie can't be accessed via JavaScript
                // SameSite: http.SameSiteLaxMode, // Adjust this based on your needs
                body: JSON.stringify(data)
            });
        }
    
        // Await the response JSON and return it directly
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error("Error:", error);
        return null;  // Return null in case of an error
    }

}


function convertTo24Hour(time) {
    const [timePart, meridian] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
  
    if (meridian === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridian === "AM" && hours === 12) {
      hours = 0;
    }
  
    // Ensure two-digit formatting
    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
  
    return `${hours}:${minutes}`;
  }