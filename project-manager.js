// project-manager.js - Fully Tested & Hardened Version
const projectsGrid = document.getElementById("projectsGrid");
const addProjectBtn = document.getElementById("addProjectBtn");

// LOCAL STORAGE INITIALIZATION
let projects = [];

try {
    const savedProjects = localStorage.getItem("portfolioProjects");
    projects = savedProjects ? JSON.parse(savedProjects) : [];
    if (!Array.isArray(projects)) {
        projects = [];
    }
} catch (error) {
    projects = [];
}

// FORM HTML MODAL INJECTION
const formContainer = document.createElement("div");
formContainer.className = "project-form-container";
formContainer.setAttribute("role", "dialog");
formContainer.setAttribute("aria-modal", "true");
formContainer.setAttribute("aria-labelledby", "formTitle");

formContainer.innerHTML = `
    <form class="project-form" id="projectForm" novalidate>
        <h2 id="formTitle">Add New Project</h2>

        <label for="projectName">Project Name *</label>
        <input type="text" id="projectName" required maxlength="100" placeholder="Enter project name">
        <small class="pm-error" id="nameErrorMsg" style="color: #ff6b6b; font-size: 12px; display: none; margin-top: -12px; margin-bottom: 12px;"></small>

        <label for="projectDescription">Project Description *</label>
        <textarea id="projectDescription" required maxlength="1000" placeholder="Describe your project"></textarea>
        <small class="pm-error" id="descErrorMsg" style="color: #ff6b6b; font-size: 12px; display: none; margin-top: -12px; margin-bottom: 12px;"></small>

        <label for="projectImage">Project Image URL</label>
        <input type="url" id="projectImage" placeholder="https://example.com/image.jpg">

        <label for="projectTechnologies">Technologies *</label>
        <input type="text" id="projectTechnologies" required maxlength="200" placeholder="React, Java, MySQL">
        <small class="pm-error" id="techErrorMsg" style="color: #ff6b6b; font-size: 12px; display: none; margin-top: -12px; margin-bottom: 12px;"></small>

        <label for="projectGithub">GitHub Link</label>
        <input type="url" id="projectGithub" placeholder="https://github.com/username/project">

        <label for="projectDemo">Live Demo Link</label>
        <input type="url" id="projectDemo" placeholder="https://yourproject.vercel.app">

        <div class="project-form-buttons">
            <button type="submit" class="save-project-btn">Save Project</button>
            <button type="button" class="cancel-project-btn" id="cancelProjectBtn">Cancel</button>
        </div>
    </form>
`;

document.body.appendChild(formContainer);

const projectForm = document.getElementById("projectForm");
const formTitle = document.getElementById("formTitle");
const projectName = document.getElementById("projectName");
const projectDescription = document.getElementById("projectDescription");
const projectImage = document.getElementById("projectImage");
const projectTechnologies = document.getElementById("projectTechnologies");
const projectGithub = document.getElementById("projectGithub");
const projectDemo = document.getElementById("projectDemo");
const cancelProjectBtn = document.getElementById("cancelProjectBtn");

let editingProjectId = null;

function saveProjects() {
    localStorage.setItem("portfolioProjects", JSON.stringify(projects));
}

function openProjectForm() {
    editingProjectId = null;
    projectForm.reset();
    clearFormErrors();
    formTitle.textContent = "Add New Project";
    formContainer.classList.add("active");
    projectName.focus();
}

function closeProjectForm() {
    formContainer.classList.remove("active");
    projectForm.reset();
    clearFormErrors();
    editingProjectId = null;
}

function clearFormErrors() {
    document.querySelectorAll(".pm-error").forEach(el => {
        el.textContent = "";
        el.style.display = "none";
    });
}

if (addProjectBtn) {
    addProjectBtn.addEventListener("click", openProjectForm);
}

if (cancelProjectBtn) {
    cancelProjectBtn.addEventListener("click", closeProjectForm);
}

// BUG-07 Fix: Dismiss modal on backdrop click
formContainer.addEventListener("click", function (event) {
    if (event.target === formContainer) {
        closeProjectForm();
    }
});

// BUG-07 Fix: Dismiss modal on Escape key press
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && formContainer.classList.contains("active")) {
        closeProjectForm();
    }
});

function setText(element, value) {
    element.textContent = value || "";
}

// BUG-06 Fix: Strict URL protocol validation (Anti-XSS enforcement)
function isValidHttpUrl(string) {
    if (!string) return false;
    try {
        const parsed = new URL(string, window.location.origin);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (_) {
        return false;
    }
}

function setSafeLink(anchor, url, label) {
    const trimmed = (url || "").trim();
    if (!isValidHttpUrl(trimmed)) {
        return false;
    }
    anchor.textContent = label;
    anchor.href = trimmed;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    return true;
}

function renderProjects() {
    if (!projectsGrid) return;
    projectsGrid.replaceChildren();

    projects.forEach(function (project) {
        const card = document.createElement("article");
        card.className = "project-card";

        // BUG-05 Fix: Render image only if non-empty and valid HTTP(S) URL
        if (project.image && project.image.trim() !== "" && isValidHttpUrl(project.image.trim())) {
            const image = document.createElement("img");
            image.alt = project.name || "Project image";
            image.loading = "lazy";
            image.src = project.image.trim();
            image.addEventListener("error", function () {
                image.remove();
            });
            card.appendChild(image);
        }

        const content = document.createElement("div");
        content.className = "project-content";

        const title = document.createElement("h3");
        setText(title, project.name);

        const description = document.createElement("p");
        setText(description, project.description);

        const technologies = document.createElement("div");
        technologies.className = "project-tech";
        setText(technologies, "Technologies: " + project.technologies);

        const links = document.createElement("div");
        links.className = "project-links";

        if (project.github) {
            const githubLink = document.createElement("a");
            if (setSafeLink(githubLink, project.github, "GitHub ↗")) {
                links.appendChild(githubLink);
            }
        }

        if (project.demo) {
            const demoLink = document.createElement("a");
            if (setSafeLink(demoLink, project.demo, "Live Demo ↗")) {
                links.appendChild(demoLink);
            }
        }

        const actions = document.createElement("div");
        actions.className = "project-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-project-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function () {
            editProject(project.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-project-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteProject(project.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(technologies);
        if (links.children.length > 0) {
            content.appendChild(links);
        }
        content.appendChild(actions);

        card.appendChild(content);
        projectsGrid.appendChild(card);
    });
}

// BUG-04 Fix: Check against whitespace-only submissions
projectForm.addEventListener("submit", function (event) {
    event.preventDefault();
    clearFormErrors();

    const name = projectName.value.trim();
    const description = projectDescription.value.trim();
    const image = projectImage.value.trim();
    const technologies = projectTechnologies.value.trim();
    const github = projectGithub.value.trim();
    const demo = projectDemo.value.trim();

    let hasError = false;

    if (!name) {
        const err = document.getElementById("nameErrorMsg");
        err.textContent = "Please enter a valid project name.";
        err.style.display = "block";
        hasError = true;
    }

    if (!description) {
        const err = document.getElementById("descErrorMsg");
        err.textContent = "Please enter a project description.";
        err.style.display = "block";
        hasError = true;
    }

    if (!technologies) {
        const err = document.getElementById("techErrorMsg");
        err.textContent = "Please specify technologies used.";
        err.style.display = "block";
        hasError = true;
    }

    if (hasError) return;

    const projectData = {
        id: editingProjectId || Date.now(),
        name: name,
        description: description,
        image: image,
        technologies: technologies,
        github: github,
        demo: demo
    };

    if (editingProjectId !== null) {
        projects = projects.map(p => p.id === editingProjectId ? projectData : p);
    } else {
        projects.push(projectData);
    }

    saveProjects();
    renderProjects();
    closeProjectForm();
});

function editProject(id) {
    const project = projects.find(item => item.id === id);
    if (!project) return;

    editingProjectId = id;
    clearFormErrors();

    projectName.value = project.name || "";
    projectDescription.value = project.description || "";
    projectImage.value = project.image || "";
    projectTechnologies.value = project.technologies || "";
    projectGithub.value = project.github || "";
    projectDemo.value = project.demo || "";

    formTitle.textContent = "Edit Project";
    formContainer.classList.add("active");
    projectName.focus();
}

function deleteProject(id) {
    const confirmDelete = confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;

    projects = projects.filter(p => p.id !== id);
    saveProjects();
    renderProjects();
}

renderProjects();
