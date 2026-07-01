export function renderSettingsPanel({
  moduleId,
  data,
  rules,
  requiredKeywords,
  isTextHeaderItem,
  isRequiredTitle,
  cleanText,
  escapeHtml
}) {
  const module = data.modules.find((m) => String(m.id) === String(moduleId));
  if (!module) return "";

  const items = data.moduleItemsByModuleId[module.id] || [];
  const rule = rules[String(module.id)] || null;

  const selectedIds = new Set(
    rule && rule.mode === "custom"
      ? (rule.requiredItemIds || []).map(String)
      : items
          .filter((item) => !isTextHeaderItem(item) && isRequiredTitle(item.title, requiredKeywords))
          .map((item) => String(item.id))
  );

  const itemRows = items
    .map((item) => {
      const isHeader = isTextHeaderItem(item);
      const checked = selectedIds.has(String(item.id)) ? "checked" : "";
      const disabled = isHeader ? "disabled" : "";
      const labelSuffix = isHeader ? "Text Header - ignored" : item.type || "Item";

      return `
        <label class="cpt-rule-item ${isHeader ? "cpt-rule-disabled" : ""}">
          <input type="checkbox" class="cpt-rule-checkbox" value="${item.id}" ${checked} ${disabled}>
          <span>
            <strong>${escapeHtml(cleanText(item.title || "Untitled item"))}</strong>
            <small>${escapeHtml(labelSuffix)}</small>
          </span>
        </label>
      `;
    })
    .join("");

  return `
    <section class="cpt-settings-panel" data-module-id="${module.id}">
      <div class="cpt-settings-head">
        <div>
          <strong>Requirements</strong>
          <span>${escapeHtml(module.name)}</span>
        </div>
        <button class="cpt-close-settings" type="button">×</button>
      </div>
      <p>Select the items that count toward completion for this module.</p>
      <div class="cpt-rule-list">${itemRows}</div>
      <div class="cpt-settings-actions">
        <button class="cpt-save-rules" type="button" data-module-id="${module.id}">Save Custom Rules</button>
        <button class="cpt-reset-rules" type="button" data-module-id="${module.id}">Use Keyword Rules</button>
      </div>
    </section>
  `;
}
