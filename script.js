let currentClassName = "";
let currentClassCode = "";
let currentEmail = "";

// ========== TEACHER FUNCTIONS ==========
function teacherLogin() {
    currentClassName = document.getElementById("className").value.trim();
    currentClassCode = document.getElementById("classCode").value.trim();
    currentEmail = document.getElementById("teacherEmail").value.trim();

    if (!currentClassName || !currentClassCode || !currentEmail) {
        alert("❌ Please fill all fields: Email, Class Name, Class Code");
        return;
    }

    document.getElementById("login-section").style.display = "none";
    document.getElementById("teacher-dashboard").style.display = "block";
    
    document.getElementById("class-badge").textContent = `${currentClassName} (${currentClassCode})`;
    document.getElementById("recordDate").value = new Date().toISOString().split('T')[0];
    
    loadStudentsToday();
    document.getElementById("rollNumber").focus();
}

function addStudent() {
    let name = document.getElementById("studentName").value.trim();
    let roll = document.getElementById("studentRoll").value.trim();
    let gender = document.getElementById("studentGender").value;

    if (!name || !roll || !gender) {
        alert("❌ Please fill Name, Roll Number, AND Gender");
        return;
    }

    fetch("/add_student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name, roll_number: roll, gender,
            class_name: currentClassName,
            class_code: currentClassCode,
            email: currentEmail
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            showAlert(`✅ ${gender === 'Male' ? 'Boy' : 'Girl'} added successfully!`, "success");
            clearStudentForm();
            loadStudentsToday();
        } else {
            showAlert(data.message || "Error adding student", "danger");
        }
    })
    .catch(err => showAlert("❌ Network error", "danger"));
}

function loadStudentsToday() {
    fetch(`/get_students?class_name=${encodeURIComponent(currentClassName)}&class_code=${encodeURIComponent(currentClassCode)}`)
    .then(res => res.json())
    .then(students => {
        let list = document.getElementById("student-list");
        list.innerHTML = "";
        
        if (students.length === 0) {
            list.innerHTML = '<li class="list-group-item text-muted text-center py-2 small">No students added yet</li>';
            return;
        }

        students.slice(-5).forEach(student => {
            let genderEmoji = student.gender === 'Male' ? '👦' : '👧';
            let li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between py-1 small";
            li.innerHTML = `
                <span>${genderEmoji} ${student.name} (${student.roll_number})</span>
                <span class="badge bg-success">OK</span>
            `;
            list.appendChild(li);
        });
    });
}

function savePerformance() {
    let rollNumber = document.getElementById("rollNumber").value.trim();
    let date = document.getElementById("recordDate").value;
    let attendance = document.getElementById("attendance").value;

    if (!rollNumber || !date || !attendance) {
        showAlert("❌ Roll Number, Date, Attendance are required!", "warning");
        return;
    }

    // Show loading
    document.querySelector("button[onclick='savePerformance()']").innerHTML = "⏳ Saving...";
    document.querySelector("button[onclick='savePerformance()']").disabled = true;

    let formData = new FormData();
    formData.append("roll_number", rollNumber);
    formData.append("class_name", currentClassName);
    formData.append("class_code", currentClassCode);
    formData.append("date", date);
    formData.append("behavioural", document.getElementById("behavioural").value);
    formData.append("assessment_marks", document.getElementById("assessmentMarks").value);
    formData.append("attendance", attendance);
    formData.append("overall_notes", document.getElementById("overallNotes").value);
    formData.append("teacher_email", currentEmail);

    let files = document.getElementById("recordImages").files;
    for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
    }

    fetch("/add_performance", { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
        document.querySelector("button[onclick='savePerformance()']").innerHTML = "💾 Save Performance Record";
        document.querySelector("button[onclick='savePerformance()']").disabled = false;

        if (data.status === "success") {
            showSuccessMessage();
            clearPerformanceForm();
        } else {
            showAlert(data.message || "Error saving record", "danger");
        }
    })
    .catch(err => {
        document.querySelector("button[onclick='savePerformance()']").innerHTML = "💾 Save Performance Record";
        document.querySelector("button[onclick='savePerformance()']").disabled = false;
        showAlert("❌ Network error", "danger");
    });
}

// ⭐ NEW: Success Message Functions
function showSuccessMessage() {
    document.getElementById("performance-form").style.display = "none";
    document.getElementById("success-message").style.display = "block";
}

function addAnotherRecord() {
    document.getElementById("success-message").style.display = "none";
    document.getElementById("performance-form").style.display = "block";
    document.getElementById("rollNumber").focus();
}

function exitToDashboard() {
    document.getElementById("success-message").style.display = "none";
    document.getElementById("performance-form").style.display = "block";
    clearPerformanceForm();
    loadStudentsToday();
}

// Helper functions
function clearPerformanceForm() {
    document.getElementById("rollNumber").value = "";
    document.getElementById("behavioural").value = "";
    document.getElementById("assessmentMarks").value = "";
    document.getElementById("attendance").value = "";
    document.getElementById("overallNotes").value = "";
    document.getElementById("recordImages").value = "";
    document.getElementById("recordDate").value = new Date().toISOString().split('T')[0];
}

function clearStudentForm() {
    document.getElementById("studentName").value = "";
    document.getElementById("studentRoll").value = "";
    document.getElementById("studentGender").value = "";
}

function showAlert(message, type) {
    // Simple alert at top
    let alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alert.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}

// Principal functions (same as before)
function principalLogin() {
    let className = document.getElementById("principalClassName").value.trim();
    let classCode = document.getElementById("principalClassCode").value.trim();

    if (!className || !classCode) {
        alert("❌ Enter Class Name & Code");
        return;
    }

    document.getElementById("principal-login").style.display = "none";
    document.getElementById("principal-dashboard").style.display = "block";
    
    document.getElementById("principal-class-title").textContent = className;
    document.getElementById("principal-class-badge").textContent = classCode;
    
    loadPrincipalRecords(className, classCode);
}

function loadPrincipalRecords(className, classCode) {
    fetch(`/get_performance?class_name=${encodeURIComponent(className)}&class_code=${encodeURIComponent(classCode)}`)
    .then(res => res.json())
    .then(records => {
        let container = document.getElementById("records-container");
        if (records.length === 0) {
            container.innerHTML = `<div class="col-12 text-center py-5"><h5>📭 No records found</h5><p class="text-muted">Teacher add kare records</p></div>`;
            return;
        }
        container.innerHTML = records.map(r => `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-light">
                        <strong>${r.student_name || 'Roll: ' + r.roll_number}</strong>
                        <span class="badge bg-primary ms-2">${r.roll_number}</span>
                    </div>
                    <div class="card-body">
                        <div class="mb-2"><strong>📅 Date:</strong> ${r.date}</div>
                        <div class="mb-2"><strong>✅ Attendance:</strong> <span class="badge ${r.attendance === 'Present' ? 'bg-success' : 'bg-warning'}">${r.attendance}</span></div>
                        ${r.behavioural ? `<div class="mb-2"><strong>🎭 Behaviour:</strong> ${r.behavioural}</div>` : ''}
                        ${r.assessment_marks ? `<div class="mb-2"><strong>📚 Marks:</strong> ${r.assessment_marks}</div>` : ''}
                        <div class="mb-2"><strong>📝 Notes:</strong> ${r.overall_notes || 'N/A'}</div>
                        ${r.image ? `<div><small class="text-muted">📸 ${r.image.split(',').length} images</small></div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    });
}
