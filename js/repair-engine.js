"use strict";

import { validateText } from "./validator.js";


/*
============================================================
JSON VALIDATOR PRO
repair-engine.js
============================================================

Purpose:

Safely repair common JSON syntax problems.

Supported:

✓ UTF-8 BOM
✓ // comments
✓ /* comments *\/
✓ trailing commas
✓ missing commas between object properties
✓ missing commas between array values
✓ final JSON validation
✓ formatted corrected output

IMPORTANT:

The repaired JSON is NEVER accepted until JSON.parse()
successfully validates the final result.
============================================================
*/


/* =========================================================
   REMOVE BOM
========================================================= */

export function removeBOM(text) {

    text =
        String(text ?? "");


    if (
        text.length > 0 &&
        text.charCodeAt(0) === 0xFEFF
    ) {

        return {

            text:
                text.slice(1),

            changed:
                true,

            description:
                "Removed UTF-8 BOM"

        };
    }


    return {

        text,

        changed:
            false,

        description:
            "No BOM found"

    };
}


/* =========================================================
   REMOVE JSON COMMENTS
========================================================= */

export function removeJSONComments(text) {

    let output =
        "";

    let inString =
        false;

    let escaped =
        false;

    let changed =
        false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const next =
            text[i + 1];


        /*
        ------------------------------------------------------
        Escaped character inside string
        ------------------------------------------------------
        */

        if (escaped) {

            output +=
                char;

            escaped =
                false;

            continue;
        }


        /*
        ------------------------------------------------------
        Backslash inside string
        ------------------------------------------------------
        */

        if (
            char === "\\" &&
            inString
        ) {

            output +=
                char;

            escaped =
                true;

            continue;
        }


        /*
        ------------------------------------------------------
        Quote
        ------------------------------------------------------
        */

        if (
            char === '"'
        ) {

            inString =
                !inString;

            output +=
                char;

            continue;
        }


        /*
        ------------------------------------------------------
        Single-line comment
        ------------------------------------------------------
        */

        if (
            !inString &&
            char === "/" &&
            next === "/"
        ) {

            changed =
                true;


            while (
                i < text.length &&
                text[i] !== "\n"
            ) {

                i++;
            }


            if (
                i < text.length
            ) {

                output +=
                    "\n";
            }


            continue;
        }


        /*
        ------------------------------------------------------
        Multi-line comment
        ------------------------------------------------------
        */

        if (
            !inString &&
            char === "/" &&
            next === "*"
        ) {

            changed =
                true;


            i +=
                2;


            while (
                i < text.length
            ) {

                if (
                    text[i] === "*" &&
                    text[i + 1] === "/"
                ) {

                    i++;

                    break;
                }


                /*
                Preserve line numbers.
                */

                if (
                    text[i] === "\n"
                ) {

                    output +=
                        "\n";
                }


                i++;
            }


            continue;
        }


        output +=
            char;
    }


    return {

        text:
            output,

        changed,

        description:
            "Removed JSON comments"

    };
}


/* =========================================================
   REMOVE TRAILING COMMAS
========================================================= */

export function removeTrailingCommas(text) {

    let output =
        "";

    let inString =
        false;

    let escaped =
        false;

    let changed =
        false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];


        /*
        ------------------------------------------------------
        Escaped character
        ------------------------------------------------------
        */

        if (escaped) {

            output +=
                char;

            escaped =
                false;

            continue;
        }


        /*
        ------------------------------------------------------
        Backslash
        ------------------------------------------------------
        */

        if (
            char === "\\" &&
            inString
        ) {

            output +=
                char;

            escaped =
                true;

            continue;
        }


        /*
        ------------------------------------------------------
        Quote
        ------------------------------------------------------
        */

        if (
            char === '"'
        ) {

            inString =
                !inString;

            output +=
                char;

            continue;
        }


        /*
        ------------------------------------------------------
        Comma followed by } or ]
        ------------------------------------------------------
        */

        if (
            char === "," &&
            !inString
        ) {

            let next =
                i + 1;


            while (
                next < text.length &&
                /\s/.test(
                    text[next]
                )
            ) {

                next++;
            }


            if (
                text[next] === "}" ||
                text[next] === "]"
            ) {

                changed =
                    true;

                continue;
            }
        }


        output +=
            char;
    }


    return {

        text:
            output,

        changed,

        description:
            "Removed trailing commas"

    };
}


/* =========================================================
   FIND STRING END
========================================================= */

function findStringEnd(
    text,
    start
) {

    let escaped =
        false;


    for (
        let i = start + 1;
        i < text.length;
        i++
    ) {

        const char =
            text[i];


        if (escaped) {

            escaped =
                false;

            continue;
        }


        if (
            char === "\\"
        ) {

            escaped =
                true;

            continue;
        }


        if (
            char === '"'
        ) {

            return i;
        }
    }


    return -1;
}


/* =========================================================
   FIND NEXT NON-WHITESPACE
========================================================= */

function nextNonWhitespace(
    text,
    start
) {

    let i =
        start;


    while (
        i < text.length &&
        /\s/.test(
            text[i]
        )
    ) {

        i++;
    }


    return i;
}


/* =========================================================
   FIND PREVIOUS NON-WHITESPACE
========================================================= */

function previousNonWhitespace(
    text,
    start
) {

    let i =
        start;


    while (
        i >= 0 &&
        /\s/.test(
            text[i]
        )
    ) {

        i--;
    }


    return i;
}


/* =========================================================
   ADD MISSING COMMAS
========================================================= */

export function addMissingCommas(
    text
) {

    let output =
        "";

    let changed =
        false;

    const changes =
        [];

    let inString =
        false;

    let escaped =
        false;


    /*
    ----------------------------------------------------------
    Scan character by character.

    Example:

    {
      "name": "Guyana"
      "code": "GYD"
    }

    becomes:

    {
      "name": "Guyana",
      "code": "GYD"
    }
    ----------------------------------------------------------
    */

    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];


        /*
        ------------------------------------------------------
        Inside string
        ------------------------------------------------------
        */

        if (
            inString
        ) {

            output +=
                char;


            if (
                escaped
            ) {

                escaped =
                    false;

                continue;
            }


            if (
                char === "\\"
            ) {

                escaped =
                    true;

                continue;
            }


            if (
                char === '"'
            ) {

                inString =
                    false;
            }


            continue;
        }


        /*
        ------------------------------------------------------
        Start string
        ------------------------------------------------------
        */

        if (
            char === '"'
        ) {

            inString =
                true;

            output +=
                char;

            continue;
        }


        /*
        ------------------------------------------------------
        Newline
        ------------------------------------------------------
        */

        if (
            char === "\n" ||
            char === "\r"
        ) {

            /*
            Preserve newline.
            */

            output +=
                char;


            /*
            Handle CRLF.
            */

            if (
                char === "\r" &&
                text[i + 1] === "\n"
            ) {

                i++;

                output +=
                    "\n";
            }


            /*
            --------------------------------------------------
            Find next meaningful character.
            --------------------------------------------------
            */

            const next =
                nextNonWhitespace(
                    text,
                    i + 1
                );


            /*
            --------------------------------------------------
            Find previous meaningful character.
            --------------------------------------------------
            */

            const previous =
                previousNonWhitespace(
                    output,
                    output.length - 1
                );


            /*
            --------------------------------------------------
            Next line starts with a quoted property key.
            --------------------------------------------------
            */

            if (
                next < text.length &&
                text[next] === '"'
            ) {

                const keyEnd =
                    findStringEnd(
                        text,
                        next
                    );


                if (
                    keyEnd !== -1
                ) {

                    const afterKey =
                        nextNonWhitespace(
                            text,
                            keyEnd + 1
                        );


                    /*
                    ------------------------------------------------
                    Confirm:

                    "property":

                    ------------------------------------------------
                    */

                    if (
                        text[afterKey] === ":"
                    ) {

                        /*
                        ------------------------------------------------
                        Only add comma if previous meaningful
                        character is a possible JSON value.

                        Don't modify:

                        {
                        [
                        :
                        ,
                        ------------------------------------------------
                        */

                        if (
                            previous >= 0 &&
                            output[previous] !== "{" &&
                            output[previous] !== "[" &&
                            output[previous] !== ":" &&
                            output[previous] !== ","
                        ) {

                            /*
                            --------------------------------------------
                            Avoid duplicate comma.
                            --------------------------------------------
                            */

                            if (
                                output[previous] !== ","
                            ) {

                                /*
                                ----------------------------------------
                                Insert comma immediately before newline.
                                ----------------------------------------
                                */

                                const newlineLength =
                                    (
                                        char === "\r" &&
                                        text[i + 1] === "\n"
                                    )
                                        ? 2
                                        : 1;


                                /*
                                We already placed newline into output.

                                Remove it, insert comma, restore newline.
                                */

                                output =
                                    output.slice(
                                        0,
                                        output.length -
                                        newlineLength
                                    ) +
                                    "," +
                                    output.slice(
                                        output.length -
                                        newlineLength
                                    );


                                changed =
                                    true;


                                changes.push(
                                    "Inserted missing comma before JSON property"
                                );
                            }
                        }
                    }
                }
            }


            continue;
        }


        /*
        ------------------------------------------------------
        Normal character
        ------------------------------------------------------
        */

        output +=
            char;
    }


    return {

        text:
            output,

        changed,

        changes,

        description:
            "Added missing commas"

    };
}


/* =========================================================
   ADD MISSING ARRAY COMMAS
========================================================= */

export function addMissingArrayCommas(
    text
) {

    let output =
        "";

    let changed =
        false;

    const changes =
        [];

    let inString =
        false;

    let escaped =
        false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];


        /*
        ------------------------------------------------------
        Strings
        ------------------------------------------------------
        */

        if (
            inString
        ) {

            output +=
                char;


            if (
                escaped
            ) {

                escaped =
                    false;

                continue;
            }


            if (
                char === "\\"
            ) {

                escaped =
                    true;

                continue;
            }


            if (
                char === '"'
            ) {

                inString =
                    false;
            }


            continue;
        }


        /*
        ------------------------------------------------------
        Start string
        ------------------------------------------------------
        */

        if (
            char === '"'
        ) {

            inString =
                true;

            output +=
                char;

            continue;
        }


        /*
        ------------------------------------------------------
        Newline
        ------------------------------------------------------
        */

        if (
            char === "\n"
        ) {

            output +=
                char;


            const next =
                nextNonWhitespace(
                    text,
                    i + 1
                );


            const previous =
                previousNonWhitespace(
                    output,
                    output.length - 2
                );


            /*
            --------------------------------------------------
            If next line begins a new array value, insert comma.

            Example:

            [
              "one"
              "two"
            ]

            becomes:

            [
              "one",
              "two"
            ]
            --------------------------------------------------
            */

            if (
                next < text.length &&
                (
                    text[next] === '"' ||
                    text[next] === "{" ||
                    text[next] === "[" ||
                    text[next] === "-" ||
                    /[0-9]/.test(
                        text[next]
                    ) ||
                    text.startsWith(
                        "true",
                        next
                    ) ||
                    text.startsWith(
                        "false",
                        next
                    ) ||
                    text.startsWith(
                        "null",
                        next
                    )
                )
            ) {

                if (
                    previous !== "[" &&
                    previous !== "," &&
                    previous !== ":"
                ) {

                    if (
                        output[output.length - 2] !== ","
                    ) {

                        output =
                            output.slice(
                                0,
                                output.length - 1
                            ) +
                            "," +
                            output.slice(
                                output.length - 1
                            );


                        changed =
                            true;


                        changes.push(
                            "Inserted missing comma between array values"
                        );
                    }
                }
            }


            continue;
        }


        output +=
            char;
    }


    return {

        text:
            output,

        changed,

        changes,

        description:
            "Added missing array commas"

    };
}


/* =========================================================
   TRY JSON PARSE
========================================================= */

function tryParse(
    text
) {

    try {

        const data =
            JSON.parse(
                text
            );


        return {

            valid:
                true,

            data,

            error:
                null

        };

    } catch (
        error
    ) {

        return {

            valid:
                false,

            data:
                null,

            error

        };
    }
}


/* =========================================================
   FORMAT JSON
========================================================= */

function formatJSON(
    data
) {

    return JSON.stringify(
        data,
        null,
        2
    );
}


/* =========================================================
   SUCCESS RESULT
========================================================= */

function successResult(
    text,
    data,
    actions,
    changes,
    originalText
) {

    let formatted;


    try {

        formatted =
            formatJSON(
                data
            );

    } catch (
        error
    ) {

        formatted =
            text;
    }


    return {

        success:
            true,

        valid:
            true,

        changed:
            formatted !== originalText,

        text:
            formatted,

        repairedText:
            formatted,

        correctedText:
            formatted,

        data,

        actions,

        changes,

        error:
            null

    };
}


/* =========================================================
   REPAIR JSON
========================================================= */

export function repairJSON(
    originalText
) {

    const original =
        String(
            originalText ?? ""
        );


    const actions =
        [];

    const changes =
        [];


    let repaired =
        original;


    /*
    ----------------------------------------------------------
    Empty file
    ----------------------------------------------------------
    */

    if (
        repaired.trim() === ""
    ) {

        return {

            success:
                false,

            valid:
                false,

            changed:
                false,

            text:
                repaired,

            repairedText:
                repaired,

            correctedText:
                "",

            data:
                null,

            actions,

            changes,

            error:
                new Error(
                    "The JSON file is empty."
                )

        };
    }


    /*
    ----------------------------------------------------------
    First check original JSON.
    ----------------------------------------------------------
    */

    let result =
        tryParse(
            repaired
        );


    if (
        result.valid
    ) {

        return successResult(
            repaired,
            result.data,
            actions,
            changes,
            original
        );
    }


    /*
    ----------------------------------------------------------
    STEP 1
    Remove BOM.
    ----------------------------------------------------------
    */

    const bom =
        removeBOM(
            repaired
        );


    repaired =
        bom.text;


    if (
        bom.changed
    ) {

        actions.push(
            bom.description
        );
    }


    result =
        tryParse(
            repaired
        );


    if (
        result.valid
    ) {

        return successResult(
            repaired,
            result.data,
            actions,
            changes,
            original
        );
    }


    /*
    ----------------------------------------------------------
    STEP 2
    Remove comments.
    ----------------------------------------------------------
    */

    const comments =
        removeJSONComments(
            repaired
        );


    repaired =
        comments.text;


    if (
        comments.changed
    ) {

        actions.push(
            comments.description
        );
    }


    result =
        tryParse(
            repaired
        );


    if (
        result.valid
    ) {

        return successResult(
            repaired,
            result.data,
            actions,
            changes,
            original
        );
    }


    /*
    ----------------------------------------------------------
    STEP 3
    Remove trailing commas.
    ----------------------------------------------------------
    */

    const trailing =
        removeTrailingCommas(
            repaired
        );


    repaired =
        trailing.text;


    if (
        trailing.changed
    ) {

        actions.push(
            trailing.description
        );
    }


    result =
        tryParse(
            repaired
        );


    if (
        result.valid
    ) {

        return successResult(
            repaired,
            result.data,
            actions,
            changes,
            original
        );
    }


    /*
    ----------------------------------------------------------
    STEP 4
    Add missing object-property commas.
    ----------------------------------------------------------
    */

    const missing =
        addMissingCommas(
            repaired
        );


    repaired =
        missing.text;


    if (
        missing.changed
    ) {

        actions.push(
            missing.description
        );


        changes.push(
            ...missing.changes
        );
    }


    result =
        tryParse(
            repaired
        );


    if (
        result.valid
    ) {

        return successResult(
            repaired,
            result.data,
            actions,
            changes,
            original
        );
    }


    /*
    ----------------------------------------------------------
    STEP 5
    Add missing array commas.
    ----------------------------------------------------------
    */

    const arrayCommas =
        addMissingArrayCommas(
            repaired
        );


    repaired =
        arrayCommas.text;


    if (
        arrayCommas.changed
    ) {

        actions.push(
            arrayCommas.description
        );


        changes.push(
            ...arrayCommas.changes
        );
    }


    /*
    ----------------------------------------------------------
    FINAL VALIDATION
    ----------------------------------------------------------
    */

    result =
        tryParse(
            repaired
        );


    if (
        result.valid
    ) {

        return successResult(
            repaired,
            result.data,
            actions,
            changes,
            original
        );
    }


    /*
    ----------------------------------------------------------
    REPAIR FAILED.

    Do not claim success.
    ----------------------------------------------------------
    */

    return {

        success:
            false,

        valid:
            false,

        changed:
            repaired !== original,

        text:
            repaired,

        repairedText:
            repaired,

        correctedText:
            "",

        data:
            null,

        actions,

        changes,

        error:
            result.error

    };
}


/* =========================================================
   VALIDATE REPAIRED JSON
========================================================= */

export function validateRepairedJSON(
    text
) {

    /*
    ----------------------------------------------------------
    Prefer project's validator.
    ----------------------------------------------------------
    */

    try {

        const result =
            validateText(
                text
            );


        if (
            result &&
            typeof result === "object"
        ) {

            return result;
        }

    } catch (
        error
    ) {

        /*
        Fall back to JSON.parse below.
        */
    }


    /*
    ----------------------------------------------------------
    Native JSON validation fallback.
    ----------------------------------------------------------
    */

    try {

        const data =
            JSON.parse(
                text
            );


        return {

            valid:
                true,

            data,

            error:
                null

        };

    } catch (
        error
    ) {

        return {

            valid:
                false,

            data:
                null,

            error

        };
    }
}


/* =========================================================
   CHECK IF TEXT IS VALID JSON
========================================================= */

export function isValidJSON(
    text
) {

    try {

        JSON.parse(
            text
        );

        return true;

    } catch (
        error
    ) {

        return false;
    }
}


/* =========================================================
   GET REPAIR SUMMARY
========================================================= */

export function getRepairSummary(
    result
) {

    if (
        !result
    ) {

        return {

            success:
                false,

            message:
                "No repair result was returned."

        };
    }


    if (
        result.success &&
        result.valid
    ) {

        return {

            success:
                true,

            message:
                "JSON successfully repaired.",

            actions:
                result.actions || [],

            changes:
                result.changes || []

        };
    }


    return {

        success:
            false,

        message:
            result.error
                ? result.error.message
                : "Automatic repair failed.",

        actions:
            result.actions || [],

        changes:
            result.changes || []

    };
}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {

    removeBOM,

    removeJSONComments,

    removeTrailingCommas,

    addMissingCommas,

    addMissingArrayCommas,

    repairJSON,

    validateRepairedJSON,

    isValidJSON,

    getRepairSummary

};