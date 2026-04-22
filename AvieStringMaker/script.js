const defaultValues = {
  html: {
    avatarUrl: "https://live.staticflickr.com/65535/55222749198_d36e7f95af.jpg",
    displayName: "The Jessicorn Huntress",
    avatarHeight: "325",
    avatarAlign: "left",
    appendName: true,
  },
  bbcode: {
    avatarUrl: "https://live.staticflickr.com/65535/55046803351_1d8679bf7c.jpg",
    displayName: "The Jessicorn Huntress",
    avatarHeight: "330",
    avatarAlign: "left",
    appendName: true,
  },
};

const form = document.querySelector("#builder-form");
const avatarUrlInput = document.querySelector("#avatar-url");
const displayNameInput = document.querySelector("#display-name");
const avatarHeightInput = document.querySelector("#avatar-height");
const avatarAlignInput = document.querySelector("#avatar-align");
const appendNameInput = document.querySelector("#append-name");
const output = document.querySelector("#output");
const preview = document.querySelector("#preview");
const statusMessage = document.querySelector("#status-message");
const copyButton = document.querySelector("#copy-button");
const resetButton = document.querySelector("#reset-button");
const modeButtons = document.querySelectorAll(".mode-button");
const previewModeLabel = document.querySelector("#preview-mode-label");
const heroExample = document.querySelector("#hero-example");

let currentMode = "html";

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function normalizeUrl(value) {
  return value.trim();
}

function buildOutput({ mode, avatarUrl, displayName, avatarHeight, avatarAlign, appendName }) {
  const safeUrl = normalizeUrl(avatarUrl);
  const safeName = displayName.trim();
  const safeHeight = String(avatarHeight).trim();
  const safeAlign = avatarAlign.trim();
  const suffix = appendName && safeName ? ` ${safeName}` : "";

  if (mode === "html") {
    return `<img height="${safeHeight}" align="${safeAlign}" src="${safeUrl}">${suffix}`;
  }

  return `[img height="${safeHeight}" align="${safeAlign}"]${safeUrl}[/img]${suffix}`;
}

function renderPreview({ mode, avatarUrl, displayName, avatarHeight, avatarAlign, appendName }) {
  const safeUrl = normalizeUrl(avatarUrl);
  const safeName = escapeHtml(displayName.trim());
  const safeHeight = Number.parseInt(avatarHeight, 10) || 0;
  const floatStyle =
    avatarAlign === "center"
      ? "display:block;margin:0 auto 1rem;"
      : `float:${avatarAlign};margin:${avatarAlign === "left" ? "0 1rem 1rem 0" : "0 0 1rem 1rem"};`;

  const caption = appendName && safeName ? `<span class="preview-caption">${safeName}</span>` : "";

  if (!safeUrl) {
    preview.innerHTML = `<div class="preview-empty">Your avatar preview will show up here once you add an image URL.</div>`;
    return;
  }

  preview.innerHTML = `
    <div class="preview-render">
      <img src="${escapeHtml(safeUrl)}" alt="${safeName || "Avatar preview"}" height="${safeHeight || 325}" style="${floatStyle}" />
      ${caption}
    </div>
  `;

  if (mode === "bbcode") {
    const label = appendName && safeName ? safeName : "BBCode";
    preview.innerHTML += `<p class="status-message">Preview is rendered as HTML so you can sanity-check the image and layout for ${label}.</p>`;
  }
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#a43d2e" : "var(--success)";
}

function validateFields() {
  const avatarUrl = normalizeUrl(avatarUrlInput.value);
  const displayName = displayNameInput.value.trim();
  const avatarHeight = avatarHeightInput.value.trim();

  if (!avatarUrl) {
    setStatus("Add an avatar image URL to generate the string.", true);
    avatarUrlInput.focus();
    return false;
  }

  if (!displayName && appendNameInput.checked) {
    setStatus("Add a display name or uncheck the option to append it.", true);
    displayNameInput.focus();
    return false;
  }

  if (!avatarHeight || Number(avatarHeight) <= 0) {
    setStatus("Height should be a positive number.", true);
    avatarHeightInput.focus();
    return false;
  }

  return true;
}

function getFormValues() {
  return {
    mode: currentMode,
    avatarUrl: avatarUrlInput.value,
    displayName: displayNameInput.value,
    avatarHeight: avatarHeightInput.value,
    avatarAlign: avatarAlignInput.value,
    appendName: appendNameInput.checked,
  };
}

function generate() {
  if (!validateFields()) {
    return;
  }

  const values = getFormValues();
  output.value = buildOutput(values);
  renderPreview(values);
  setStatus(`Generated ${currentMode.toUpperCase()} output.`);
}

function applyMode(mode) {
  currentMode = mode;
  const defaults = defaultValues[mode];

  avatarUrlInput.value = defaults.avatarUrl;
  displayNameInput.value = defaults.displayName;
  avatarHeightInput.value = defaults.avatarHeight;
  avatarAlignInput.value = defaults.avatarAlign;
  appendNameInput.checked = defaults.appendName;

  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  previewModeLabel.textContent =
    mode === "html" ? "HTML (Downstairs) Preview" : "BBCode (Upstairs) Preview";
  heroExample.textContent = buildOutput({ mode, ...defaults });
  generate();
}

async function copyOutput() {
  if (!output.value.trim()) {
    setStatus("Generate a string before copying.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(output.value);
    setStatus("Output copied to clipboard.");
  } catch (error) {
    setStatus("Clipboard access was blocked. You can still select and copy the text manually.", true);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});

copyButton.addEventListener("click", copyOutput);

resetButton.addEventListener("click", () => {
  applyMode(currentMode);
  setStatus("Fields reset to the default example.");
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyMode(button.dataset.mode);
  });
});

[avatarUrlInput, displayNameInput, avatarHeightInput, avatarAlignInput, appendNameInput].forEach((field) => {
  field.addEventListener("input", () => {
    const values = getFormValues();
    heroExample.textContent = buildOutput(values);
    renderPreview(values);
  });

  field.addEventListener("change", () => {
    const values = getFormValues();
    heroExample.textContent = buildOutput(values);
    renderPreview(values);
  });
});

applyMode(currentMode);
