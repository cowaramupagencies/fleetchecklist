/**
 * Build flat results array from template; merge saved by itemId.
 */

export function buildResultsFromTemplate(template, savedResults) {
  const byId = {};
  for (const r of savedResults || []) {
    byId[r.itemId] = r;
  }
  const out = [];
  const cats = [...(template.categories || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const cat of cats) {
    const items = [...(cat.items || [])]
      .filter((i) => i.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const item of items) {
      const prev = byId[item.id];
      out.push({
        categoryId: cat.id,
        categoryName: cat.name,
        itemId: item.id,
        itemLabel: item.label,
        state: prev?.state ?? 'unchecked',
        note: prev?.note ?? '',
        photoUrl: prev?.photoUrl ?? '',
      });
    }
  }
  return out;
}
