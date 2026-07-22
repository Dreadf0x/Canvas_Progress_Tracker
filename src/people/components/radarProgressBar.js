function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTooltipItems(items = []) {
  return `
    <ul class="cpt-radar-tooltip-list">
      ${items
        .map(
          (item) => `
            <li class="cpt-radar-tooltip-item">
              ${escapeHtml(
                item.name || "Unnamed item"
              )}
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

export function renderRadarProgressBar({
  percent = null,
  tooltipTitle = "",
  items = [],
  completeMessage = "All required items complete"
} = {}) {
  if (
    percent === null ||
    percent === undefined
  ) {
    return `
      <span class="cpt-radar-empty">
        —
      </span>
    `;
  }

  const safePercent = Math.max(
    0,
    Math.min(100, Number(percent) || 0)
  );

  const tooltipBody = items.length
    ? renderTooltipItems(items)
    : `
      <div class="cpt-radar-tooltip-complete">
        ${escapeHtml(completeMessage)}
      </div>
    `;

  const accessibleLabel = items.length
    ? `${tooltipTitle}. ${items.length} item${
        items.length === 1 ? "" : "s"
      }.`
    : `${tooltipTitle}. ${completeMessage}.`;

  return `
    <div
      class="cpt-radar-progress-wrapper"
      tabindex="0"
      aria-label="${escapeHtml(
        accessibleLabel
      )}"
    >
      <div class="cpt-radar-progress">
        <div
          class="cpt-radar-progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${safePercent}"
        >
          <div
            class="cpt-radar-progress-fill"
            style="width: ${safePercent}%"
          ></div>
        </div>

        <span class="cpt-radar-progress-label">
          ${safePercent}%
        </span>
      </div>

      <div
        class="cpt-radar-progress-tooltip"
        role="tooltip"
      >
        <div class="cpt-radar-tooltip-title">
          ${escapeHtml(tooltipTitle)}
        </div>

        ${tooltipBody}
      </div>
    </div>
  `;
}