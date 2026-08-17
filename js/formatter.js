"use strict";

import { safeParseJSON } from "./utils.js";


export function formatJSON(
    text,
    indentation = 2
) {

    const result =
        safeParseJSON(text);

    if (!result.success) {

        throw result.error;
    }

    return JSON.stringify(
        result.data,
        null,
        indentation
    );
}


export function minifyJSON(text) {

    const result =
        safeParseJSON(text);

    if (!result.success) {

        throw result.error;
    }

    return JSON.stringify(
        result.data
    );
}


export function stringifyJSON(
    data,
    indentation = 2
) {

    return JSON.stringify(
        data,
        null,
        indentation
    );
}
