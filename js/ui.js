"use strict";

import { dom } from "./dom.js";
import { state } from "./state.js";
import {
    escapeHTML,
    formatBytes
} from "./utils.js";


export function setStatus(
    message,
    type = "ready"
) {

    dom.appStatus.textContent =
        message;

    dom.appStatus.className =
        "app-status";

    if (type === "success") {

        dom.appStatus.style.color =
            "#86efac";

    } else if (type === "error") {

        dom.appStatus.style.color =
            "#fca5a5";

    } else if (type === "warning") {

        dom.appStatus.style.color =
            "#fde68a";
    }
}


export function showSelectedFile(
    file
) {

    dom.selectedFilePanel
        .classList.remove("hidden");

    dom.selectedFileName.textContent =
        file.name;

    dom.selectedFileDetails.textContent =
        `${formatBytes(file.size)} • ${file.type || "application/json"}`;

    dom.upgradeFilename.textContent =
        file.name;

    dom.upgradeSection
        .classList.remove("hidden");
}


export function hideSelectedFile() {

    dom.selectedFilePanel
        .classList.add("hidden");

    dom.fileInfoSection
        .classList.add("hidden");

    dom.previewSection
        .classList.add("hidden");

    dom.errorSection
        .classList.add("hidden");

    dom.repairSection
        .classList.add("hidden");

    dom.upgradeSection
        .classList.add("hidden");

    dom.selectedFileName.textContent =
        "No file selected";

    dom.selectedFileDetails.textContent =
        "-";
}


export function showSuccess(
    title,
    message
) {

    dom.result.className =
        "result success";

    dom.result.innerHTML = `

        <div class="result-icon">
            ✓
        </div>

        <div>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>
    `;
}


export function showError(
    title,
    message
) {

    dom.result.className =
        "result error";

    dom.result.innerHTML = `

        <div class="result-icon">
            ✕
        </div>

        <div>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>
    `;
}


export function showWarning(
    title,
    message
) {

    dom.result.className =
        "result warning";

    dom.result.innerHTML = `

        <div class="result-icon">
            ⚠
        </div>

        <div>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>
    `;
}


export function showNeutral(
    title,
    message
) {

    dom.result.className =
        "result neutral";

    dom.result.innerHTML = `

        <div class="result-icon">
            ℹ️
        </div>

        <div>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>
    `;
}


export function showStatistics(
    statistics
) {

    dom.fileInfoSection
        .classList.remove("hidden");

    dom.statFilename.textContent =
        statistics.filename;

    dom.statFileSize.textContent =
        formatBytes(
            statistics.size
        );

    dom.statCharacters.textContent =
        statistics.characters.toLocaleString();

    dom.statLines.textContent =
        statistics.lines.toLocaleString();

    dom.statJsonType.textContent =
        statistics.jsonType;

    dom.statItems.textContent =
        statistics.items.toLocaleString();
}


export function showErrorLocation(
    location
) {

    dom.errorSection
        .classList.remove("hidden");

    dom.errorPosition.textContent =
        location.position ??
        "Unavailable";

    dom.errorLine.textContent =
        location.line ??
        "Unavailable";

    dom.errorColumn.textContent =
        location.column ??
        "Unavailable";

    dom.errorContext.textContent =
        location.context ||
        "The browser did not provide an exact character position.";
}


export function hideErrorLocation() {

    dom.errorSection
        .classList.add("hidden");

    dom.errorContext.textContent =
        "";
}


export function showRepairReport(
    actions
) {

    dom.repairSection
        .classList.remove("hidden");

    if (!actions.length) {

        dom.repairReport.innerHTML = `
            <strong>
                No automatic syntax changes were required.
            </strong>
        `;

        return;
    }

    const list =
        actions
            .map(
                action =>
                    `<li>${escapeHTML(action)}</li>`
            )
            .join("");

    dom.repairReport.innerHTML = `

        <strong>
            Safe repairs performed:
        </strong>

        <ul>
            ${list}
        </ul>
    `;
}


export function hideRepairReport() {

    dom.repairSection
        .classList.add("hidden");

    dom.repairReport.innerHTML =
        "";
}


export function showUpgradeStatus(
    message,
    success = false
) {

    dom.upgradeStatus.textContent =
        message;

    dom.upgradeStatus.style.color =
        success
            ? "#86efac"
            : "#facc15";
}


export function setButtonsEnabled(
    enabled
) {

    dom.validateBtn.disabled =
        !enabled;

    dom.repairBtn.disabled =
        !enabled;

    dom.formatBtn.disabled =
        !enabled;

    dom.copyBtn.disabled =
        !enabled;

    dom.downloadBtn.disabled =
        !enabled;

    dom.upgradeBtn.disabled =
        !enabled;
}


export function resetUI() {

    hideSelectedFile();

    hideErrorLocation();

    hideRepairReport();

    showNeutral(
        "No JSON file selected",
        "Select a JSON file to begin."
    );

    dom.fileInfoSection
        .classList.add("hidden");

    dom.upgradeSection
        .classList.add("hidden");

    setButtonsEnabled(false);

    setStatus(
        "Ready"
    );
}
