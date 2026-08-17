"use strict";


export async function copyToClipboard(
    text
) {

    if (!text) {

        throw new Error(
            "There is no JSON content to copy."
        );
    }

    if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
            "function"
    ) {

        await navigator.clipboard.writeText(
            text
        );

        return true;
    }

    /*
     * Fallback for older browsers.
     */

    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.value = text;

    textarea.style.position =
        "fixed";

    textarea.style.opacity =
        "0";

    document.body.appendChild(
        textarea
    );

    textarea.select();

    const success =
        document.execCommand(
            "copy"
        );

    textarea.remove();

    if (!success) {

        throw new Error(
            "Clipboard access was denied."
        );
    }

    return true;
}
