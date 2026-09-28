
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function searchCondition(search, fields) {
  const q = String(search || "").trim();
  if (!q || !fields.length) return null;
  const rx = new RegExp(escapeRegex(q), "i");
  return { $or: fields.map((f) => ({ [f]: rx })) };
}

module.exports = { searchCondition, escapeRegex };
