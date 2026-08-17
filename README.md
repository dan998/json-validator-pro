# JSON Validator Pro

A browser-based JSON validation, repair, formatting, preview, statistics, clipboard, and file-management tool.

JSON Validator Pro is designed to work entirely in the browser without requiring a backend server.

It can be used to:

- Select any `.json` file
- Validate JSON syntax
- Locate JSON errors
- Display line and column information
- Show surrounding JSON context
- Perform safe JSON repairs
- Remove BOM characters
- Remove JSON comments
- Remove trailing commas
- Format valid JSON
- Preview JSON data
- Display JSON statistics
- Copy JSON to the clipboard
- Download corrected JSON
- Preserve the original filename
- Generate a corrected filename based on the file selected
- Work locally through a browser
- Run from Termux
- Be hosted on GitHub Pages or another static hosting service

---

# Project Structure

```text
json-validator-pro/
│
├── README.md
│
├── index.html
│
├── css/
│   └── validator.css
│
└── js/
    ├── app.js
    ├── clipboard.js
    ├── dom.js
    ├── download.js
    ├── error-location.js
    ├── file-handler.js
    ├── file-system.js
    ├── filename.js
    ├── formatter.js
    ├── preview.js
    ├── repair-engine.js
    ├── state.js
    ├── statistics.js
    ├── ui.js
    ├── utils.js
    └── validator.js


---

Main Features

1. JSON File Selection

The application allows the user to select a JSON file from the device.

The application does not assume that the file is named:

countries.json

Instead, it uses the actual filename selected by the user.

For example:

countries.json
users.json
products.json
settings.json
data.json
config.json
my-project.json

The application detects the selected filename dynamically.


---

2. JSON Validation

The validator checks whether the selected file contains valid JSON.

Valid JSON:

{
  "name": "Guyana",
  "capital": "Georgetown"
}

Invalid JSON:

{
  "name": "Guyana",
  "capital": "Georgetown",
}

The second example contains a trailing comma.

The application attempts to identify the error and provide useful information.


---

3. Error Location

When JSON is invalid, JSON Validator Pro attempts to display:

Error message

Character position

Line number

Column number

Surrounding JSON

Error line


Example:

Invalid JSON

Unexpected token } in JSON at position 248

Error location

Character position: 248
Line: 14
Column: 5

The surrounding JSON is displayed so the user can identify the problem.


---

4. Safe JSON Repair

The repair engine performs only controlled repairs.

The goal is to fix common JSON syntax problems without intentionally changing the underlying data.

Supported safe repairs include:

Remove BOM

A UTF-8 Byte Order Mark can appear at the beginning of a JSON file.

The repair engine can remove it.


---

Remove comments

JSON does not officially support comments.

For example:

{
  "name": "Guyana",
  // Country name
  "capital": "Georgetown"
}

The repair engine can remove the comment.


---

Remove trailing commas

Example:

{
  "name": "Guyana",
}

becomes:

{
  "name": "Guyana"
}

Arrays are also supported.

Example:

[
  "Guyana",
  "Brazil",
  "Suriname",
]

becomes:

[
  "Guyana",
  "Brazil",
  "Suriname"
]


---

5. Repair Validation

The application does not consider a repair successful simply because text was modified.

After repairing the JSON, it attempts to parse the repaired content again using:

JSON.parse()

If parsing succeeds, the repaired JSON is considered valid.

If parsing fails, the application reports that automatic repair was not sufficient.

This prevents the application from presenting invalid JSON as successfully repaired.


---

6. Filename Preservation

One of the important design goals of this project is that filenames are handled dynamically.

The application must not contain hard-coded logic such as:

link.download = "countries-corrected.json";

Instead, if the user selects:

users.json

the corrected file should become:

users-corrected.json

If the user selects:

products.json

the corrected file should become:

products-corrected.json

If the user selects:

my-data.json

the corrected file should become:

my-data-corrected.json

The filename module is responsible for this behavior.


---

7. Original Filename Extension

The filename system removes the original .json extension before creating the corrected filename.

Example:

users.json

becomes:

users-corrected.json

It does not produce:

users.json-corrected.json


---

8. File System Support

The project includes:

js/file-system.js

This module handles browser file-system functionality where supported.

Modern browsers may provide APIs that allow a web application to request permission to write to a selected file.

However, browser and Android support varies.

The application must respect browser security restrictions.

A website cannot arbitrarily overwrite files on a user's device without permission.


---

9. Download Corrected File

If direct file replacement is unavailable, the application can create a new corrected file.

For example:

users.json

can produce:

users-corrected.json

The corrected file is generated using a browser Blob.

The application then creates a temporary download URL.


---

10. JSON Formatting

Valid JSON can be formatted into a readable structure.

Example:

{"name":"Guyana","capital":"Georgetown","population":800000}

can become:

{
  "name": "Guyana",
  "capital": "Georgetown",
  "population": 800000
}

Formatting improves readability without intentionally changing the JSON data.


---

11. JSON Preview

The preview module displays JSON data in a readable form.

It can be used to inspect:

Objects

Arrays

Strings

Numbers

Boolean values

Null values

Nested structures



---

12. JSON Statistics

The statistics module can calculate useful information about the JSON.

Depending on the implementation, statistics may include:

File size

Character count

Number of objects

Number of arrays

Number of keys

Number of strings

Number of numbers

Number of booleans

Number of null values

Array length

Nesting depth



---

13. Clipboard

The clipboard module provides functionality for copying JSON.

Example:

Copy JSON

The application attempts to use the browser Clipboard API.

If the browser does not provide clipboard access, the application should display an appropriate message.


---

14. Browser-Based Architecture

JSON Validator Pro is a client-side application.

The basic architecture is:

User
 │
 ▼
Browser
 │
 ├── index.html
 │
 ├── validator.css
 │
 └── JavaScript modules
       │
       ├── File handling
       ├── Validation
       ├── Error detection
       ├── Repair
       ├── Formatting
       ├── Preview
       ├── Statistics
       ├── Clipboard
       └── Download

No database is required.

No server-side JSON processing is required.


---

15. Privacy

The application is designed to process JSON files locally in the browser.

The selected JSON file is read by JavaScript running in the browser.

The project does not require uploading the JSON file to a server for normal validation and repair.

This is useful for files that should remain on the user's device.

Users should still review the source code and hosting environment before using the application with sensitive information.


---

JavaScript Modules

app.js

Main application controller.

Responsible for initializing the application and connecting the different modules.


---

state.js

Stores application state.

Examples include:

Selected file

Original JSON

Corrected JSON

Validation status

Repair status

Current filename


Keeping state in one module prevents unrelated modules from maintaining conflicting copies of application data.


---

dom.js

Contains references and helpers for working with HTML elements.

This keeps DOM manipulation separate from application logic.


---

file-handler.js

Handles:

File selection

Reading files

File input events

Selected file information


The selected file is read dynamically.


---

validator.js

Responsible for JSON syntax validation.

It uses JavaScript's JSON parser to determine whether the content is valid.


---

error-location.js

Responsible for locating errors.

It handles:

Character position

Line number

Column number

Error context

Surrounding lines



---

repair-engine.js

Contains the safe repair logic.

It handles repairs such as:

BOM removal

Comment removal

Trailing comma removal


After repair, the result is parsed again.


---

formatter.js

Responsible for converting parsed JSON into readable formatted JSON.

Example:

JSON.stringify(data, null, 2)


---

clipboard.js

Handles copying JSON to the user's clipboard.


---

download.js

Creates downloadable corrected JSON files.

The filename is generated dynamically based on the original selected file.


---

file-system.js

Handles browser file-system APIs where supported.

It is separated from downloading so the application can distinguish between:

Save/overwrite existing file

and:

Download a corrected copy


---

filename.js

Responsible for filename operations.

Examples:

users.json
        ↓
users-corrected.json

countries.json
        ↓
countries-corrected.json

my-data.json
        ↓
my-data-corrected.json

No filename should be hard-coded to a specific project file.


---

statistics.js

Calculates JSON statistics.


---

preview.js

Displays parsed JSON for inspection.


---

ui.js

Handles user-interface updates.

Examples:

Success messages

Error messages

Warning messages

Loading states

Statistics display

Preview display



---

utils.js

Contains reusable helper functions.

Examples:

HTML escaping

String utilities

General-purpose helper functions



---

Running With Termux

Install Python:

pkg update
pkg install python

Go into the project:

cd ~/json-validator-pro

Start a local HTTP server:

python -m http.server 8080

Then open:

http://localhost:8080

in a browser.


---

Running With Node.js

Node.js can also be installed in Termux:

pkg install nodejs

JavaScript syntax can then be checked with:

for f in js/*.js; do
    echo "===== $f ====="
    node --check "$f"
done

Every JavaScript file should pass without a SyntaxError.


---

Checking the Project Files

From the project directory:

find . -type f | sort

Expected files:

./README.md
./css/validator.css
./index.html
./js/app.js
./js/clipboard.js
./js/dom.js
./js/download.js
./js/error-location.js
./js/file-handler.js
./js/file-system.js
./js/filename.js
./js/formatter.js
./js/preview.js
./js/repair-engine.js
./js/state.js
./js/statistics.js
./js/ui.js
./js/utils.js
./js/validator.js


---

Testing

A simple invalid JSON file can be created with:

cat > test.json <<'EOF'
{
  "name": "Guyana",
  "capital": "Georgetown",
  "items": [
    1,
    2,
    3,
  ]
}
EOF

Select test.json in the application.

The application should detect the trailing comma.

After repair, the corrected filename should be based on the selected file:

test-corrected.json

It should NOT always create:

countries-corrected.json


---

Example Filename Tests

Selected File	Corrected File

countries.json	countries-corrected.json
users.json	users-corrected.json
products.json	products-corrected.json
settings.json	settings-corrected.json
data.json	data-corrected.json
my-project.json	my-project-corrected.json



---

Important Browser Limitation

Browsers intentionally restrict access to the user's filesystem.

A normal web page cannot silently modify arbitrary files on an Android device.

Therefore:

Select File
      ↓
Request permission when supported
      ↓
Try to write updated content

If the browser does not support direct writing, the application should use:

Download Corrected Copy

instead.

This is a browser security restriction, not a JSON Validator Pro error.


---

GitHub

The project can be stored in a Git repository.

Initialize Git:

cd ~/json-validator-pro
git init

Configure your Git identity if needed:

git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

Add the files:

git add .

Create the first commit:

git commit -m "Initial JSON Validator Pro"

Rename the main branch:

git branch -M main

Add the GitHub repository:

git remote add origin YOUR_GITHUB_REPOSITORY_URL

Push:

git push -u origin main

Replace:

YOUR_GITHUB_REPOSITORY_URL

with the URL of your own GitHub repository.


---

GitHub Pages

Because JSON Validator Pro is a static HTML/CSS/JavaScript application, it can be hosted using GitHub Pages.

The project does not require:

PHP

Node.js server

MySQL

PostgreSQL

Google Apps Script

API server


for its basic functionality.

The browser executes the application directly.


---

Security

JSON Validator Pro should never use:

eval()

to parse JSON.

JSON should be parsed with:

JSON.parse()

and generated with:

JSON.stringify()

This project is intended to keep JSON processing inside the browser.


---

Safe Repair Philosophy

Automatic repair should be conservative.

The application should not blindly guess the user's intended data.

Safe repairs include obvious syntax corrections such as:

BOM
comments
trailing commas

More complicated corruption may require manual correction.

Examples include:

Missing quotation marks
Missing commas
Missing closing braces
Missing closing brackets
Incorrect nesting
Corrupted strings
Invalid escape sequences

When the application cannot safely determine the intended structure, it should report the problem rather than silently inventing data.


---

Project Goals

The long-term goal of JSON Validator Pro is to provide a complete browser-based JSON utility containing:

Validation

Error location

Safe repair

Formatting

Preview

Statistics

Clipboard support

Download support

File-system integration

Dynamic filename handling

Local processing

Mobile support

Desktop support

Static hosting support



---

License

Add your preferred license before publishing the project publicly.

For example:

MIT License

if you want to release the project under the MIT License.


---

Author

JSON Validator Pro

Created as a modular browser-based JSON utility.


---

Status

Development project.

The application is being developed as a modular system so individual features can be improved without putting all functionality into one large JavaScript file.

Save it:

```text
CTRL + O
ENTER
CTRL + X

Then verify it

Run:

ls -lh README.md

And:

head -20 README.md

You should see the beginning of the GitHub documentation.

Then your project will have:

json-validator-pro/
├── README.md
├── index.html
├── css/
│   └── validator.css
└── js/
    ├── app.js
    ├── clipboard.js
    ├── dom.js
    ├── download.js
    ├── error-location.js
    ├── file-handler.js
    ├── file-system.js
    ├── filename.js
    ├── formatter.js
    ├── preview.js
    ├── repair-engine.js
    ├── state.js
    ├── statistics.js
    ├── ui.js
    ├── utils.js
    └── validator.js
