import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;
try {
  const dbPath = path.join(__dirname, "../db.json");
  db = JSON.parse(readFileSync(dbPath, "utf-8"));
} catch (e) {
  db = { courses: [], sessions: [], users: [], slots: [], assessments: [], creditTransactions: [] };
}

export default function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Parse the URL path: /api/courses, /api/courses/123, etc.
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace(/^\/api\//, "").split("/").filter(Boolean);
  const collection = pathParts[0];
  const id = pathParts[1];

  if (!collection || !db[collection]) {
    return res.status(404).json({ error: "Collection not found", available: Object.keys(db) });
  }

  const items = db[collection];

  if (req.method === "GET") {
    if (id) {
      const item = items.find((i) => i.id === id || i.id === String(id));
      if (!item) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(item);
    }

    // Support query filtering
    let filtered = [...items];
    for (const [key, value] of url.searchParams.entries()) {
      filtered = filtered.filter((item) => {
        const itemVal = item[key];
        if (itemVal === undefined) return true;
        if (typeof itemVal === "boolean") return String(itemVal) === value;
        return String(itemVal) === value;
      });
    }
    return res.status(200).json(filtered);
  }

  if (req.method === "POST") {
    const newItem = { ...req.body, id: generateId() };
    return res.status(201).json(newItem);
  }

  if (req.method === "PATCH" || req.method === "PUT") {
    const item = items.find((i) => i.id === id || i.id === String(id));
    if (!item) return res.status(404).json({ error: "Not found" });
    const updated = { ...item, ...req.body };
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    return res.status(200).json({});
  }

  return res.status(405).json({ error: "Method not allowed" });
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}