


export function getStatusInfo(item) {
  switch (item.status) {
    case "passed":
      return { icon: "✓", label: "Passed", className: "cpt-item-complete" };
    case "below_passing":
      return { icon: "!", label: "Below 80%", className: "cpt-item-warning" };
    case "waiting":
      return { icon: "…", label: "Waiting for grade", className: "cpt-item-waiting" };
    case "missing":
      return { icon: "○", label: "Missing", className: "cpt-item-incomplete" };
    case "not_scorable":
      return { icon: "?", label: "Not scorable", className: "cpt-item-muted" };
    default:
      return { icon: "!", label: "Error", className: "cpt-item-error" };
  }
}

export function renderItem(item, escapeHtml) {
  const statusInfo = getStatusInfo(item);
  const gradeText = item.percent === null ? "" : ` <span class="cpt-grade">(${item.percent}%)</span>`;

  return `
    <li class="${statusInfo.className}">
      <span class="cpt-icon">${statusInfo.icon}</span>
      <span>
        <strong>${escapeHtml(item.title)}</strong>${gradeText}
        <small>${escapeHtml(statusInfo.label)} · ${escapeHtml(item.detail || "")}</small>
      </span>
    </li>
  `;
}


export function renderModule(
  module,
  index,
  isInstructor,
  settingsPanel,
  renderItem,
  escapeHtml
) {
  const itemList = module.items.length
    ? module.items.map((item) => renderItem(item, escapeHtml)).join("")
    : `<li class="cpt-item-muted">No required items found.</li>`;

  const ruleBadge = isInstructor
    ? `<span class="cpt-rule-badge">${module.ruleMode === "custom" ? "Custom" : "Keyword"}</span>`
    : "";

  const settingsButton = isInstructor
    ? `<button class="cpt-settings-btn" type="button" data-module-id="${module.id}" title="Set requirements">⚙</button>`
    : "";

  return `
    <details class="cpt-module-row" ${index === 0 ? "open" : ""}>
      <summary>
        ${isInstructor ? `<div class="cpt-module-actions">${ruleBadge}${settingsButton}</div>` : ""}
        <div class="cpt-module-topline">
          <span class="cpt-module-title">${escapeHtml(module.name)}</span>
          <span class="cpt-module-percent">${module.percent}%</span>
        </div>
        <div class="cpt-bar">
          <div class="cpt-bar-fill" style="width:${module.percent}%"></div>
        </div>
        <div class="cpt-status">
          ${module.complete}/${module.total} required passed
        </div>
      </summary>

      ${settingsPanel}

      <ul class="cpt-item-list">
        ${itemList}
      </ul>
    </details>
  `;
}

export function renderTracker({
  wrapper,
  courseId,
  data,
  analyzedModules,
  isInstructor,
  showSettingsForModuleId,
  renderSettingsPanel,
  renderItem,
  escapeHtml,
  bindEvents,
  debugMode,
  passingPercent,
  theme,
  themes
}) {
  if (!wrapper) return;

  const allAnalyzedItems = analyzedModules.flatMap((m) => m.items);
  const overallTotal = allAnalyzedItems.length;
  const overallComplete = allAnalyzedItems.filter((i) => i.complete).length;
  const overallPercent =
    overallTotal === 0 ? 0 : Math.round((overallComplete / overallTotal) * 100);

  const waitingCount = allAnalyzedItems.filter((i) => i.status === "waiting").length;
  const belowCount = allAnalyzedItems.filter((i) => i.status === "below_passing").length;
  const missingCount = allAnalyzedItems.filter((i) => i.status === "missing").length;
  const customRuleCount = analyzedModules.filter((m) => m.ruleMode === "custom").length;

  const moduleRows = analyzedModules
    .map((module, index) => {
      const settingsPanel =
        isInstructor && String(showSettingsForModuleId) === String(module.id)
          ? renderSettingsPanel(module.id, data)
          : "";

      return renderModule(
        module,
        index,
        isInstructor,
        settingsPanel,
        renderItem,
        escapeHtml
      );
    })
    .join("");

  const debugPanel =
    isInstructor && debugMode
      ? `
      <details class="cpt-debug">
        <summary>Developer</summary>
        <dl>
          <div><dt>Detected Role</dt><dd>${escapeHtml(data.role)}</dd></div>
          <div><dt>API Status</dt><dd>Connected</dd></div>
          <div><dt>Modules</dt><dd>${data.modules.length}</dd></div>
          <div><dt>Custom Rule Modules</dt><dd>${customRuleCount}</dd></div>
          <div><dt>Module Items</dt><dd>${Object.values(data.moduleItemsByModuleId).flat().length}</dd></div>
          <div><dt>Required Items</dt><dd>${overallTotal}</dd></div>
          <div><dt>Passed</dt><dd>${overallComplete}</dd></div>
          <div><dt>Waiting</dt><dd>${waitingCount}</dd></div>
          <div><dt>Below 80%</dt><dd>${belowCount}</dd></div>
          <div><dt>Missing</dt><dd>${missingCount}</dd></div>
          <div><dt>Load Time</dt><dd>${data.elapsedMs} ms</dd></div>
        </dl>
      </details>
    `
      : "";

  
  wrapper.innerHTML = `
    <div class="cpt-header">
      <div class="cpt-header-title">
        <img
          class="cpt-header-logo"
          src="${chrome.runtime.getURL("assets/branding/Wayfinder_White.svg")}"
          alt=""
        >
        <div class="cpt-header-copy">
          <h2>Wayfinder</h2>
        </div>
      </div>

      <div class="cpt-header-actions">    

        <button id="cpt-theme-button" type="button" title="Appearance">
          ⚙
        </button>
        <div id="cpt-theme-menu" class="cpt-theme-menu" hidden>
          <button type="button" data-theme="ubtech">UBTech</button>
          <button type="button" data-theme="slate">Slate</button>
          <button type="button" data-theme="forest">Forest</button>
          <button type="button" data-theme="dark">Dark</button>
          <button type="button" data-theme="midnight">Midnight</button>
          <button type="button" data-theme="highcontrast">High Contrast</button>
        </div>
        <button id="cpt-collapse" type="button" title="Collapse panel">–</button>
        <button id="cpt-refresh" type="button" title="Refresh progress">↻</button>
      </div>
    </div>

    <div class="cpt-overall">
      <div class="cpt-module-topline">
        <span class="cpt-module-title">Overall Progress</span>
        <span class="cpt-module-percent">${overallPercent}%</span>
      </div>
      <div class="cpt-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${overallPercent}">
        <div class="cpt-bar-fill" style="width: ${overallPercent}%"></div>
      </div>
      <div class="cpt-status">${overallComplete}/${overallTotal} Completed</div>
    </div>

    <div class="cpt-summary">

      <div class="cpt-stat-card">
        <div class="cpt-stat-number">${overallComplete}</div>
        <div class="cpt-stat-label">Completed</div>
      </div>

      <div class="cpt-stat-card">
        <div class="cpt-stat-number">${waitingCount}</div>
        <div class="cpt-stat-label">Awaiting Grade</div>
      </div>

      <div class="cpt-stat-card">
        <div class="cpt-stat-number">${missingCount}</div>
        <div class="cpt-stat-label">Missing</div>
      </div>

      <div class="cpt-stat-card">
        <div class="cpt-stat-number">${belowCount}</div>
        <div class="cpt-stat-label">Below 80%</div>
      </div>

    </div>

    <div class="cpt-body">${moduleRows}</div>

    ${debugPanel}

    <div class="cpt-footer">
      Course ${escapeHtml(courseId)} · ${escapeHtml(data.user.name || data.user.login_id || "current user")}
    </div>
  `;

  bindEvents(wrapper);
}