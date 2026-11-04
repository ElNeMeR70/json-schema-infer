#!/usr/bin/env node
const fs = require("fs");
let raw = process.argv.slice(2).join(" ").trim();
if (!raw || raw === "-h" || raw === "--help") {
  console.log("Usage: json-schema-infer '<json-string>' or <file.json>");
  process.exit(raw ? 0 : 1);
}
if (fs.existsSync(raw)) {
  raw = fs.readFileSync(raw, "utf8");
}
try {
  const data = JSON.parse(raw);
  function infer(val) {
    if (val === null) return { type: "null" };
    if (Array.isArray(val)) {
      return { type: "array", items: val.length ? infer(val[0]) : {} };
    }
    const t = typeof val;
    if (t === "object") {
      const props = {};
      for (const [k, v] of Object.entries(val)) props[k] = infer(v);
      return { type: "object", properties: props, required: Object.keys(props) };
    }
    return { type: t === "number" ? (Number.isInteger(val) ? "integer" : "number") : t };
  }
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    ...infer(data)
  };
  console.log(JSON.stringify(schema, null, 2));
} catch (e) {
  console.error("Invalid JSON: " + e.message);
  process.exit(1);
}
