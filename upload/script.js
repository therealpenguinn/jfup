document.addEventListener("DOMContentLoaded", function () {
    const typeSelect = document.getElementById("typeSelect");
    const fileUpload = document.getElementById("fileUpload");
    const uploadBtn = document.getElementById("uploadBtn");
    const progressBar = document.getElementById("uploadProgress");
    const dropZone = document.getElementById("dropZone");
    const selectedFiles = document.getElementById("selectedFiles");

    const username = sessionStorage.getItem('username');
    const usertype = sessionStorage.getItem('usertype');
    const branch = sessionStorage.getItem('branch');

    if (!username || !usertype || !branch) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }

    // Show Admin Panel button only for Admin users
    if (usertype === 'Admin') {
        const adminPanelButton = document.getElementById('adminPanelButton');
        adminPanelButton.style.display = 'block';

        document.getElementById('adminPanelBtn').addEventListener('click', () => {
            window.location.href = 'table.html';
        });
    }

    function updateFileSelection() {
        const files = fileUpload.files;
        selectedFiles.textContent = files.length > 0
            ? `Selected ${files.length} file(s): ${Array.from(files).map(f => f.name).join(', ')}`
            : '';
    }

    dropZone.addEventListener("click", () => fileUpload.click());
    fileUpload.addEventListener("change", updateFileSelection);

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        fileUpload.files = e.dataTransfer.files;
        updateFileSelection();
    });

    uploadBtn.addEventListener("click", function () {
        const files = fileUpload.files;
        if (files.length === 0) {
            alert("Please select a file to upload.");
            return;
        }

        const selectedType = typeSelect.value;
        if (!selectedType) {
            alert("Please select a file type.");
            return;
        }

        const folderName = document.getElementById("folderName").value.trim();
        if (!folderName || !/^[a-zA-Z0-9-_]+\-\d{2}\-\d{2}\-\d{2}$/.test(folderName)) {
            alert("Please enter a valid folder name in the format Name-dd-mm-yy.");
            return;
        }

        // Determine the upload path based on the branch, selected file type, and folder name
        const basePath = `upload/${branch}-${selectedType}/${folderName}`;

        let formData = new FormData();
        formData.append("path", basePath);
        Array.from(files).forEach(file => formData.append("files", file));

        progressBar.value = 0;
        progressBar.style.display = "block";

        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/upload", true);

        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                let percent = (event.loaded / event.total) * 100;
                progressBar.value = percent;
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                progressBar.value = 100;
                alert("Upload successful!");
            } else {
                progressBar.value = 0;
                alert("Upload failed: " + xhr.responseText);
            }
        };

        xhr.onerror = function () {
            progressBar.value = 0;
            alert("Error uploading files.");
        };

        xhr.send(formData);
    });
});
