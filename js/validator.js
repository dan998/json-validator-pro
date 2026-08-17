"use strict";

import { state } from "./state.js";
import { safeParseJSON } from "./utils.js";


export function validateText(text) {

    const result =
        safeParseJSON(text);

    if (result.success) {

        state.isValid = true;
        state.parsedData = result.data;
        state.lastError = null;

        return {
            valid: true,
            data: result.data,
            error: null
        };
    }

    state.isValid = false;
    state.parsedData = null;
    state.lastError = result.error;

    return {
        valid: false,
        data: null,
        error: result.error
    };
}


export function validateCurrentJSON() {

    const text =
        state.correctedText ||
        state.originalText;

    return validateText(text);
}
