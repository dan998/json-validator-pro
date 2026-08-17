"use strict";

/*
 * Central application state.
 *
 * Nothing in this file manipulates the DOM.
 */

export const state = {
    selectedFile: null,

    /*
     * File System Access API handle.
     * This allows us to write back to the
     * exact file selected by the user.
     */
    fileHandle: null,

    originalText: "",

    correctedText: "",

    parsedData: null,

    isValid: false,

    isRepaired: false,

    isFormatted: false,

    lastError: null,

    repairActions: [],

    statistics: null,

    upgradeSupported: false,

    isUpgraded: false
};


export function resetState() {

    state.selectedFile = null;
    state.fileHandle = null;

    state.originalText = "";
    state.correctedText = "";

    state.parsedData = null;

    state.isValid = false;
    state.isRepaired = false;
    state.isFormatted = false;

    state.lastError = null;

    state.repairActions = [];

    state.statistics = null;

    state.isUpgraded = false;
}


export function hasFile() {
    return !!state.selectedFile;
}


export function getActiveText() {

    if (state.correctedText) {
        return state.correctedText;
    }

    return state.originalText;
}
