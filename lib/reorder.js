export function reorder(fields, fromIndex, toIndex) {
  if (!Array.isArray(fields)) {
    return [];
  }
  const result = [...fields];
  
  if (
    typeof fromIndex !== "number" ||
    typeof toIndex !== "number" ||
    fromIndex < 0 ||
    fromIndex >= result.length ||
    toIndex < 0 ||
    toIndex >= result.length
  ) {
    return result;
  }

  if (fromIndex === toIndex) {
    return result;
  }

  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}
