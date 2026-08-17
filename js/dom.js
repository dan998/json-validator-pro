"use strict";

export const dom = {};


export function initializeDOM() {

    dom.fileInput =
        document.getElementById("fileInput");

    dom.selectFileBtn =
        document.getElementById("selectFileBtn");

    dom.dropZone =
        document.getElementById("dropZone");

    dom.selectedFilePanel =
        document.getElementById("selectedFilePanel");

    dom.selectedFileName =
        document.getElementById("selectedFileName");

    dom.selectedFileDetails =
        document.getElementById("selectedFileDetails");

    dom.removeFileBtn =
        document.getElementById("removeFileBtn");

    dom.validateBtn =
        document.getElementById("validateBtn");

    dom.repairBtn =
        document.getElementById("repairBtn");

    dom.formatBtn =
        document.getElementById("formatBtn");

    dom.copyBtn =
        document.getElementById("copyBtn");

    dom.downloadBtn =
        document.getElementById("downloadBtn");

    dom.upgradeBtn =
        document.getElementById("upgradeBtn");

    dom.clearBtn =
        document.getElementById("clearBtn");

    dom.result =
        document.getElementById("result");

    dom.errorSection =
        document.getElementById("errorSection");

    dom.errorPosition =
        document.getElementById("errorPosition");

    dom.errorLine =
        document.getElementById("errorLine");

    dom.errorColumn =
        document.getElementById("errorColumn");

    dom.errorContext =
        document.getElementById("errorContext");

    dom.fileInfoSection =
        document.getElementById("fileInfoSection");

    dom.statFilename =
        document.getElementById("statFilename");

    dom.statFileSize =
        document.getElementById("statFileSize");

    dom.statCharacters =
        document.getElementById("statCharacters");

    dom.statLines =
        document.getElementById("statLines");

    dom.statJsonType =
        document.getElementById("statJsonType");

    dom.statItems =
        document.getElementById("statItems");

    dom.previewSection =
        document.getElementById("previewSection");

    dom.jsonPreview =
        document.getElementById("jsonPreview");

    dom.repairSection =
        document.getElementById("repairSection");

    dom.repairReport =
        document.getElementById("repairReport");

    dom.upgradeSection =
        document.getElementById("upgradeSection");

    dom.upgradeFilename =
        document.getElementById("upgradeFilename");

    dom.upgradeStatus =
        document.getElementById("upgradeStatus");

    dom.appStatus =
        document.getElementById("appStatus");

    return dom;
}
