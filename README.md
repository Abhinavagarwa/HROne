# HROne
Drag-free field builder – add String, Number, or Nested fields easily
What the Code is doing:
-Each field has:
    -key: editable field name
    -type: "String" | "Number" | "Nested"
    -children: nested fields (if type is Nested)
-Clicking Add Field appends a new field of that type.
-Nested fields can be collapsed/expanded.
-JSON output is updated in real-time and can be copied with one click.

JSON schema builder is a dynamic React app that lets the user build schema by entering the value for string,number and nested it has some basic features and also we have made an live json viewer which can be seen by clicking on json preview the default value for number is 42 and for string is "". Nested is also supported. It supports copying JSON and UI toggles like collapse/expand, making schema creation intuitive and developer-friendly.