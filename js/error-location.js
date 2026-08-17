"use strict";


export function extractPosition(
    message
) {

    if (!message) {
        return null;
    }

    const patterns = [

        /position\s+(\d+)/i,

        /at position\s+(\d+)/i,

        /column\s+(\d+)/i
    ];

    for (const pattern of patterns) {

        const match =
            message.match(pattern);

        if (match) {

            return Number(
                match[1]
            );
        }
    }

    return null;
}


export function getLineColumn(
    text,
    position
) {

    if (
        !text ||
        position === null ||
        position === undefined
    ) {
        return {
            line: null,
            column: null
        };
    }

    const safePosition =
        Math.max(
            0,
            Math.min(
                position,
                text.length
            )
        );

    const before =
        text.substring(
            0,
            safePosition
        );

    const lines =
        before.split(/\r\n|\r|\n/);

    return {
        line: lines.length,
        column:
            lines[lines.length - 1].length + 1
    };
}


export function getContext(
    text,
    errorLine,
    radius = 5
) {

    if (!text || !errorLine) {
        return "";
    }

    const lines =
        text.split(/\r\n|\r|\n/);

    const errorIndex =
        errorLine - 1;

    const start =
        Math.max(
            0,
            errorIndex - radius
        );

    const end =
        Math.min(
            lines.length,
            errorIndex + radius + 1
        );

    const output = [];

    for (
        let i = start;
        i < end;
        i++
    ) {

        const lineNumber =
            i + 1;

        const marker =
            lineNumber === errorLine
                ? "  <--- ERROR"
                : "";

        output.push(
            `${String(lineNumber).padStart(6, " ")} | ` +
            `${lines[i]}${marker}`
        );
    }

    return output.join("\n");
}


export function locateJSONError(
    error,
    text
) {

    const message =
        error?.message ||
        String(error);

    let position =
        extractPosition(message);

    /*
     * Firefox may report line/column differently.
     * We still return the message if no position exists.
     */

    if (position === null) {

        return {
            message,
            position: null,
            line: null,
            column: null,
            context: ""
        };
    }

    const location =
        getLineColumn(
            text,
            position
        );

    return {
        message,
        position,
        line: location.line,
        column: location.column,
        context:
            getContext(
                text,
                location.line
            )
    };
}
