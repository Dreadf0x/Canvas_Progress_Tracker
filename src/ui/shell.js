export function removeExistingUI(extensionId, tabId) {
  document.getElementById(extensionId)?.remove();
  document.getElementById(tabId)?.remove();
}

export function createShell({
  extensionId,
  tabId,
  collapsed,
  createCollapsedTab,
  bindHeaderButtons
}) {
  removeExistingUI(extensionId, tabId);

  if (collapsed) {
    createCollapsedTab();
    return null;
  }

  const wrapper = document.createElement("aside");
  wrapper.id = extensionId;
  wrapper.setAttribute("aria-label", "Canvas module progress tracker");

  wrapper.innerHTML = `
    <div class="cpt-header">
      <div>
        <strong>Module Progress</strong>
        <span>Loading...</span>
      </div>
      <div class="cpt-header-actions">
        <button id="cpt-collapse" type="button" title="Collapse panel">–</button>
        <button id="cpt-refresh" type="button" title="Refresh progress">↻</button>
      </div>
    </div>
    <div class="cpt-loading">Loading Canvas progress...</div>
  `;

  document.body.appendChild(wrapper);
  bindHeaderButtons();
  return wrapper;
}

export function createCollapsedTab({ tabId, onOpen }) {
  const tab = document.createElement("button");
  tab.id = tabId;
  tab.type = "button";
  tab.innerHTML = `<span>Progress</span><strong>›</strong>`;
  tab.title = "Open Module Progress";
  tab.addEventListener("click", onOpen);
  document.body.appendChild(tab);
}

export function renderError({ wrapper, error, escapeHtml, bindHeaderButtons }) {
  if (!wrapper) return;

  wrapper.innerHTML = `
    <div class="cpt-header">
      <div>
        <strong>Module Progress</strong>
        <span>Error</span>
      </div>
      <div class="cpt-header-actions">
        <button id="cpt-collapse" type="button" title="Collapse panel">–</button>
        <button id="cpt-refresh" type="button" title="Refresh progress">↻</button>
      </div>
    </div>
    <div class="cpt-error">
      <strong>Could not load Canvas API data.</strong>
      <p>${escapeHtml(error.message)}</p>
      <p>Make sure you are not in Canvas Student View.</p>
    </div>
  `;

  bindHeaderButtons();
}