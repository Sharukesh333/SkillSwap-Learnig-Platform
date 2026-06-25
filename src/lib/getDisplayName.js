/**
 * Returns a clean display name for the user.
 * Priority: display_name saved at signup → full_name (letters only) → "User"
 */
export function getDisplayName(user) {
  if (!user) return "User";
  // Use explicitly saved display name from signup form
  if (user.display_name && user.display_name.trim()) return user.display_name.trim();
  // Fall back to full_name but strip out numbers/IDs (keep only letters, spaces, dots)
  if (user.full_name) {
    const cleaned = user.full_name.replace(/[^a-zA-Z\s.'-]/g, "").trim();
    if (cleaned.length > 0) return cleaned;
  }
  return "User";
}