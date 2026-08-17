"use strict";

import { state, resetState } from "./state.js";

import {
    initializeDOM,
    dom
} from "./dom.js";

import {
    selectJSONFile,
    readSelectedFile,
    clearSelectedFile,
    canUpgradeOriginalFile
} from "./file-handler.js";

import {
    validateText
} from "./validator.js";

import {
    locateJSONError
} from "./error-location.js";

import {
    repairJSON
} from "./repair-engine.js";

import {
    formatJSON
} from "./formatter.js";

import {
    copyToClipboard
} from "./clipboard.js";

import {
    downloadJSON
} from "./download.js";

import {
    upgradeOriginalFile,
    isUpgradeSupported
} from "./file-system.js";

import {
    calculateStatistics
} from "./statistics.js";

import {
    showPreview,
    clearPreview
} from "./preview.js";

import {
    showSelectedFile,
    hideSelectedFile,
    showSuccess,
    showError,
    showWarning,
    showNeutral,
    showStatistics,
    showErrorLocation,
    hideErrorLocation,
    showRepairReport,
    hideRepairReport,
    showUpgradeStatus,
    setButtonsEnabled,
    setStatus,
    resetUI
} from "./ui.js";


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    initializeDOM();

    resetUI();

    registerEvents();

    setupDragAndDrop();

    state.upgradeSupported =
        isUpgradeSupported();

    console.log(
        "[JSON Validator Pro] Application ready."
    );
}


/* =========================================================
   EVENTS
========================================================= */

function registerEvents() {

    dom.selectFileBtn.addEventListener(
        "click",
        handleSelectFile
    );

    dom.validateBtn.addEventListener(
        "click",
        handleValidate
    );

    dom.repairBtn.addEventListener(
        "click",
        handleRepair
    );

    dom.formatBtn.addEventListener(
        "click",
        handleFormat
    );

    dom.copyBtn.addEventListener(
        "click",
        handleCopy
    );

    dom.downloadBtn.addEventListener(
        "click",
        handleDownload
    );

    dom.upgradeBtn.addEventListener(
        "click",
        handleUpgrade
    );

    dom.clearBtn.addEventListener(
        "click",
        handleClear
    );

    dom.removeFileBtn.addEventListener(
        "click",
        handleClear
    );
}


/* =========================================================
   FILE SELECTION
========================================================= */

async function handleSelectFile() {

    try {

        setStatus(
            "Opening file picker..."
        );

        const file =
            await selectJSONFile(
                dom.fileInput
            );

        if (!file) {

            setStatus(
                "Ready"
            );

            return;
        }

        await loadFile(file);

    } catch (error) {

        console.error(error);

        showError(
            "File Selection Error",
            error.message
        );

        setStatus(
            "File error",
            "error"
        );
    }
}


async function loadFile(file) {

    if (!file.name.toLowerCase().endsWith(".json")) {

        throw new Error(
            "The selected file is not a JSON file."
        );
    }

    state.selectedFile =
        file;

    state.originalText =
        await readSelectedFile();

    state.correctedText =
        "";

    state.parsedData =
        null;

    state.isValid =
        false;

    state.isRepaired =
        false;

    state.isFormatted =
        false;

    state.isUpgraded =
        false;

    state.lastError =
        null;

    state.repairActions =
        [];

    showSelectedFile(file);

    showStatistics(
        calculateStatistics(
            file,
            state.originalText,
            {}
        )
    );

    clearPreview();

    hideErrorLocation();

    hideRepairReport();

    showNeutral(
        "File selected",
        `Ready to validate ${file.name}.`
    );

    setButtonsEnabled(true);

    showUpgradeStatus(
        canUpgradeOriginalFile()
            ? "Ready to upgrade"
            : "Download-only mode"
    );

    setStatus(
        `Loaded: ${file.name}`,
        "success"
    );

    /*
     * Immediately preview the original file.
     */

    showPreview(
        state.originalText
    );
}


/* =========================================================
   VALIDATE
========================================================= */

async function handleValidate() {

    if (!ensureFile()) {
        return;
    }

    try {

        setStatus(
            "Validating..."
        );

        const text =
            state.correctedText ||
            state.originalText;

        const result =
            validateText(text);

        if (result.valid) {

            state.isValid =
                true;

            state.parsedData =
                result.data;

            state.lastError =
                null;

            const file =
                state.selectedFile;

            state.statistics =
                calculateStatistics(
                    file,
                    text,
                    result.data
                );

            showStatistics(
                state.statistics
            );

            showPreview(text);

            hideErrorLocation();

            showSuccess(
                "JSON is valid",
                `${file.name} contains valid JSON syntax.`
            );

            setStatus(
                "Valid JSON",
                "success"
            );

            return;
        }

        state.isValid =
            false;

        const location =
            locateJSONError(
                result.error,
                text
            );

        showError(
            "Invalid JSON",
            result.error.message
        );

        showErrorLocation(
            location
        );

        showPreview(text);

        setStatus(
            "Invalid JSON",
            "error"
        );

    } catch (error) {

        showError(
            "Validation Error",
            error.message
        );

        setStatus(
            "Validation error",
            "error"
        );
    }
}


/* =========================================================
   REPAIR
========================================================= */

async function handleRepair() {

    if (!ensureFile()) {
        return;
    }

    try {

        setStatus(
            "Repairing..."
        );

        const result =
            repairJSON(
                state.originalText
            );

        state.repairActions =
            result.actions;

        if (!result.success) {

            state.correctedText =
                "";

            state.isRepaired =
                false;

            const location =
                locateJSONError(
                    result.error,
                    result.text
                );

            showError(
                "Automatic repair failed",
                result.error.message
            );

            showErrorLocation(
                location
            );

            showRepairReport(
                result.actions
            );

            showPreview(
                result.text
            );

            setStatus(
                "Repair incomplete",
                "warning"
            );

            return;
        }

        state.correctedText =
            formatJSON(
                result.text,
                2
            );

        state.parsedData =
            result.data;

        state.isValid =
            true;

        state.isRepaired =
            true;

        state.isFormatted =
            true;

        state.lastError =
            null;

        hideErrorLocation();

        showRepairReport(
            result.actions
        );

        showPreview(
            state.correctedText
        );

        state.statistics =
            calculateStatistics(
                state.selectedFile,
                state.correctedText,
                result.data
            );

        showStatistics(
            state.statistics
        );

        showSuccess(
            "JSON successfully repaired",
            `${state.selectedFile.name} has been repaired in memory.`
        );

        setStatus(
            "Repair successful",
            "success"
        );

        showUpgradeStatus(
            canUpgradeOriginalFile()
                ? "Repaired and ready to upgrade"
                : "Repaired — download copy available"
        );

    } catch (error) {

        console.error(error);

        showError(
            "Repair Error",
            error.message
        );

        setStatus(
            "Repair error",
            "error"
        );
    }
}


/* =========================================================
   FORMAT
========================================================= */

async function handleFormat() {

    if (!ensureFile()) {
        return;
    }

    try {

        const text =
            state.correctedText ||
            state.originalText;

        const formatted =
            formatJSON(
                text,
                2
            );

        state.correctedText =
            formatted;

        state.isValid =
            true;

        state.isFormatted =
            true;

        state.parsedData =
            JSON.parse(
                formatted
            );

        showPreview(
            formatted
        );

        showStatistics(
            calculateStatistics(
                state.selectedFile,
                formatted,
                state.parsedData
            )
        );

        showSuccess(
            "JSON formatted",
            `${state.selectedFile.name} has been formatted successfully.`
        );

        setStatus(
            "Formatted",
            "success"
        );

        showUpgradeStatus(
            canUpgradeOriginalFile()
                ? "Formatted and ready to upgrade"
                : "Formatted — download copy available"
        );

    } catch (error) {

        const text =
            state.correctedText ||
            state.originalText;

        const location =
            locateJSONError(
                error,
                text
            );

        showError(
            "Cannot format invalid JSON",
            error.message
        );

        showErrorLocation(
            location
        );

        setStatus(
            "Format failed",
            "error"
        );
    }
}


/* =========================================================
   COPY
========================================================= */

async function handleCopy() {

    if (!ensureFile()) {
        return;
    }

    try {

        const text =
            state.correctedText ||
            state.originalText;

        await copyToClipboard(
            text
        );

        showSuccess(
            "Copied",
            "The current JSON has been copied to the clipboard."
        );

        setStatus(
            "Copied",
            "success"
        );

    } catch (error) {

        showError(
            "Copy failed",
            error.message
        );

        setStatus(
            "Copy failed",
            "error"
        );
    }
}


/* =========================================================
   DOWNLOAD CORRECTED COPY
========================================================= */

async function handleDownload() {

    if (!ensureFile()) {
        return;
    }

    try {

        const text =
            state.correctedText ||
            state.originalText;

        /*
         * Never allow invalid JSON to be downloaded
         * as a "corrected" file.
         */

        const validation =
            validateText(text);

        if (!validation.valid) {

            throw new Error(
                "The current JSON is still invalid. " +
                "Repair or fix it before downloading."
            );
        }

        const { downloadJSON } =
            await import(
                "./download.js"
            );

        downloadJSON(
            text,
            state.selectedFile.name
        );

        showSuccess(
            "Download started",
            `${state.selectedFile.name} was used to create the corrected filename.`
        );

        setStatus(
            "Download started",
            "success"
        );

    } catch (error) {

        showError(
            "Download failed",
            error.message
        );

        setStatus(
            "Download failed",
            "error"
        );
    }
}


/* =========================================================
   UPGRADE ORIGINAL FILE
========================================================= */

async function handleUpgrade() {

    /* =====================================================
       CHECK FILE
    ===================================================== */

    if (!ensureFile()) {
        return;
    }


    /* =====================================================
       CHECK WRITABLE FILE HANDLE
    ===================================================== */

    if (
        !state.fileHandle ||
        !isUpgradeSupported()
    ) {

        showWarning(
            "Direct upgrade unavailable",
            "This browser does not currently provide a writable " +
            "file handle for the selected file. " +
            "Use Download Corrected Copy instead."
        );

        showUpgradeStatus(
            "Download-only mode"
        );

        setStatus(
            "Direct upgrade unavailable",
            "warning"
        );

        return;
    }


    try {

        /* =================================================
           GET CORRECTED TEXT
        ================================================= */

        const text =
            typeof state.correctedText === "string" &&
            state.correctedText.length > 0
                ? state.correctedText
                : state.originalText;


        if (
            typeof text !== "string" ||
            text.length === 0
        ) {

            throw new Error(
                "There is no corrected JSON available to write."
            );
        }


        /* =================================================
           FINAL VALIDATION
        ================================================= */

        setStatus(
            "Checking corrected JSON..."
        );

        const validation =
            validateText(text);


        if (
            !validation ||
            !validation.valid
        ) {

            throw new Error(
                "The corrected JSON is still invalid. " +
                "The original file was NOT changed."
            );
        }


        /* =================================================
           SHOW WRITE STATUS
        ================================================= */

        setStatus(
            "Upgrading original file..."
        );

        showUpgradeStatus(
            "Writing corrected JSON..."
        );


        /* =================================================
           WRITE USING FILE-SYSTEM MODULE
           
           IMPORTANT:
           Do NOT call state.fileHandle.createWritable()
           here.

           upgradeOriginalFile() is responsible for:
           - permission
           - validation
           - createWritable()
           - write()
           - close()
           - error conversion
           - refreshing selectedFile
        ================================================= */

        await upgradeOriginalFile(
            text
        );


        /* =================================================
           USE REFRESHED FILE FROM file-system.js
        ================================================= */

        const updatedFile =
            state.selectedFile;


        if (!updatedFile) {

            throw new Error(
                "The file was written, but the updated file " +
                "could not be loaded."
            );
        }


        /* =================================================
           READ THE ACTUAL FILE AGAIN
           
           We intentionally use the File object returned
           by the file-system module rather than directly
           calling state.fileHandle.getFile() again here.
        ================================================= */

        const updatedText =
            await updatedFile.text();


        /* =================================================
           VERIFY WHAT WAS ACTUALLY WRITTEN
        ================================================= */

        const updatedValidation =
            validateText(
                updatedText
            );


        if (
            !updatedValidation ||
            !updatedValidation.valid
        ) {

            throw new Error(
                "The file was written, but the resulting file " +
                "could not be validated."
            );
        }


        /* =================================================
           UPDATE APPLICATION STATE
        ================================================= */

        state.selectedFile =
            updatedFile;

        state.originalText =
            updatedText;

        state.correctedText =
            updatedText;

        state.parsedData =
            updatedValidation.data;

        state.isValid =
            true;

        state.isUpgraded =
            true;

        state.lastError =
            null;


        /* =================================================
           UPDATE STATISTICS
        ================================================= */

        state.statistics =
            calculateStatistics(
                updatedFile,
                updatedText,
                updatedValidation.data
            );


        showSelectedFile(
            updatedFile
        );


        showPreview(
            updatedText
        );


        showStatistics(
            state.statistics
        );


        /* =================================================
           SUCCESS UI
        ================================================= */

        showSuccess(
            "Original file upgraded",
            `${updatedFile.name} was updated successfully.`
        );


        showUpgradeStatus(
            `Upgraded successfully: ${updatedFile.name}`,
            true
        );


        setStatus(
            `Upgraded: ${updatedFile.name}`,
            "success"
        );


    } catch (error) {

        /* =================================================
           ERROR HANDLING
        ================================================= */

        console.error(
            "Original file upgrade failed:",
            error
        );


        const message =
            error &&
            typeof error.message === "string" &&
            error.message.length > 0
                ? error.message
                : "The browser could not upgrade the original file.";


        showError(
            "Upgrade failed",
            `${message} The original file was not intentionally changed by this operation.`
        );


        showUpgradeStatus(
            "Upgrade failed"
        );


        setStatus(
            "Upgrade failed",
            "error"
        );
    }
}


/* =========================================================
   CLEAR
========================================================= */

function handleClear() {

    clearSelectedFile();

    resetState();

    dom.fileInput.value =
        "";

    clearPreview();

    resetUI();

    setStatus(
        "Ready"
    );
}


/* =========================================================
   ENSURE FILE
========================================================= */

function ensureFile() {

    if (!state.selectedFile) {

        showWarning(
            "No JSON file selected",
            "Please select a JSON file first."
        );

        return false;
    }

    return true;
}


/* =========================================================
   DRAG AND DROP
========================================================= */

function setupDragAndDrop() {

    const zone =
        dom.dropZone;

    zone.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            zone.classList.add(
                "drag-over"
            );
        }
    );

    zone.addEventListener(
        "dragleave",
        () => {

            zone.classList.remove(
                "drag-over"
            );
        }
    );

    zone.addEventListener(
        "drop",
        async event => {

            event.preventDefault();

            zone.classList.remove(
                "drag-over"
            );

            const file =
                event.dataTransfer
                    ?.files
                    ?. [0];

            if (!file) {
                return;
            }

            if (
                !file.name
                    .toLowerCase()
                    .endsWith(".json")
            ) {

                showError(
                    "Invalid file",
                    "Please drop a .json file."
                );

                return;
            }

            /*
             * Drag-and-drop gives us a File object,
             * but normally not a writable FileSystemFileHandle.
             */

            state.fileHandle =
                null;

            try {

                state.selectedFile =
                    file;

                state.originalText =
                    await file.text();

                state.correctedText =
                    "";

                state.isValid =
                    false;

                state.isRepaired =
                    false;

                state.isFormatted =
                    false;

                state.isUpgraded =
                    false;

                showSelectedFile(
                    file
                );

                showPreview(
                    state.originalText
                );

                showNeutral(
                    "File selected",
                    `Ready to validate ${file.name}.`
                );

                showUpgradeStatus(
                    "Download-only mode"
                );

                setButtonsEnabled(true);

                setStatus(
                    `Loaded: ${file.name}`,
                    "success"
                );

            } catch (error) {

                showError(
                    "Could not read file",
                    error.message
                );

                setStatus(
                    "File error",
                    "error"
                );
            }
        }
    );
}
