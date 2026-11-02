/**
 * Sorts forms by 'last updated' date, newest first.
 * Supports ISO date strings, Date objects, or timestamps.
 */
export function sortForms(forms) {
  if (!Array.isArray(forms)) return [];
  return [...forms].sort((a, b) => {
    const dateA = new Date(a.lastUpdated || 0);
    const dateB = new Date(b.lastUpdated || 0);
    return dateB - dateA;
  });
}

/**
 * Filters forms list by name dynamically (case-insensitive).
 */
export function searchForms(forms, query) {
  if (!Array.isArray(forms)) return [];
  if (!query || typeof query !== "string") return forms;
  const lowerQuery = query.toLowerCase().trim();
  return forms.filter((form) =>
    form.name && form.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Duplicates a form with standard name append (e.g. " (Copy)"),
 * sets a new unique ID, resets responseCount to 0, and updates timestamps.
 */
export function duplicateForm(forms, id) {
  if (!Array.isArray(forms)) return [];
  const index = forms.findIndex((f) => f.id === id);
  if (index === -1) return forms;

  const original = forms[index];
  const now = new Date().toISOString();
  const duplicate = {
    ...original,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${original.name} (Copy)`,
    responseCount: 0,
    created: now,
    lastUpdated: now,
  };

  const newForms = [...forms];
  // Insert duplicate right after original
  newForms.splice(index + 1, 0, duplicate);
  return newForms;
}

/**
 * Deletes a form from the list by ID.
 */
export function deleteForm(forms, id) {
  if (!Array.isArray(forms)) return [];
  return forms.filter((f) => f.id !== id);
}
