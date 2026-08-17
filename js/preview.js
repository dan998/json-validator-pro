"use strict";

import { dom } from "./dom.js";
import { escapeHTML } from "./utils.js";


export function showPreview(
    text
) {

    if (!text) {

        dom.previewSection
            .classList.add("hidden");

        dom.jsonPreview.textContent = "";

        return;
    }

    dom.previewSection
        .classList.remove("hidden");

    dom.jsonPreview.textContent =
        text;
}


export function clearPreview() {

    dom.previewSection
        .classList.add("hidden");

    dom.jsonPreview.textContent = "";
}


export function showErrorContext(
    context
) {

    if (!context) {

        dom.errorContext.textContent =
            "No exact character location was provided by this browser.";

        return;
    }

    dom.errorContext.textContent =
        context;
}
