import {
  isRequiredTitle,
  isTextHeaderItem,
  getAssignmentIdFromModuleItem,
  getRequiredItemsForModule,
  analyzeModules
} from "./progress/engine.js";
import { canvasFetch, canvasFetchAll } from "./api/canvas.js";
import { detectRoleFromPermissions } from "./api/roles.js";
import { loadRules, saveRules, loadUiState, saveUiState } from "./storage/rules.js";
import {
  getStatusInfo,
  renderItem,
  renderModule,
  renderTracker
} from "./ui/panel.js";
export function initializeApp() {
  "use strict";

  const EXTENSION_ID = "cpt-progress-tracker";
  const TAB_ID = "cpt-progress-tab";
  const PASSING_PERCENT = 80;
  const REQUIRED_KEYWORDS = ["training", "lab", "important", "assessment"];
  const DEBUG_MODE = true;

  let appState = {
    courseId: null,
    data: null,
    modules: [],
    rules: {},
    showSettingsForModuleId: null,
    collapsed: false,
    role: "student"
  };

  function getCourseIdFromUrl() {
    const match = window.location.pathname.match(/\/courses\/(\d+)\/modules/);
    return match ? match[1] : null;
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function removeExistingUI() {
    document.getElementById(EXTENSION_ID)?.remove();
    document.getElementById(TAB_ID)?.remove();
  }
  
  function renderProgressTracker(wrapper, courseId, data, analyzedModules) {
    renderTracker({
      wrapper,
      courseId,
      data,
      analyzedModules,
      isInstructor: userIsInstructor(),
      showSettingsForModuleId: appState.showSettingsForModuleId,
      renderSettingsPanel,
      renderItem,
      escapeHtml,
      bindEvents,
      debugMode: DEBUG_MODE,
      passingPercent: PASSING_PERCENT
    });
  }

  function userIsInstructor() {
    return appState.role === "instructor";
  }

  function getRuleForModule(moduleId) {
    return appState.rules[String(moduleId)] || null;
  }

 

  function createShell() {
    removeExistingUI();

    if (appState.collapsed) {
      createCollapsedTab();
      return null;
    }

    const wrapper = document.createElement("aside");
    wrapper.id = EXTENSION_ID;
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

  function createCollapsedTab() {
    const tab = document.createElement("button");
    tab.id = TAB_ID;
    tab.type = "button";
    tab.innerHTML = `<span>Progress</span><strong>›</strong>`;
    tab.title = "Open Module Progress";
    tab.addEventListener("click", async () => {
      appState.collapsed = false;
      await saveUiState(appState.courseId, appState.collapsed);
      await reloadDataAndRender();
    });
    document.body.appendChild(tab);
  }

  function bindHeaderButtons() {
    document.getElementById("cpt-refresh")?.addEventListener("click", init);
    document.getElementById("cpt-collapse")?.addEventListener("click", async () => {
      appState.collapsed = true;
      await saveUiState(appState.courseId, appState.collapsed);
      removeExistingUI();
      createCollapsedTab();
    });
  }

  function renderError(wrapper, error) {
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

  async function getCanvasData(courseId) {
    const start = performance.now();

    const [user, course, modules] = await Promise.all([
      canvasFetch("/api/v1/users/self/profile").catch(() => ({ name: "current user" })),
      canvasFetch(`/api/v1/courses/${courseId}?include[]=permissions&include[]=enrollments`).catch(() => ({})),
      canvasFetchAll(`/api/v1/courses/${courseId}/modules?per_page=100`)
    ]);

    const role = detectRoleFromPermissions(course);
    appState.role = role;

    const moduleItemsByModuleId = {};
    await Promise.all(modules.map(async (module) => {
      moduleItemsByModuleId[module.id] =
        await canvasFetchAll(`/api/v1/courses/${courseId}/modules/${module.id}/items?per_page=100`);
    }));

    const requiredItems = modules.flatMap((module) =>
      getRequiredItemsForModule(module, moduleItemsByModuleId[module.id] || [], appState.rules, REQUIRED_KEYWORDS)
    );

    const assignmentIds = Array.from(
      new Set(requiredItems.map(getAssignmentIdFromModuleItem).filter(Boolean))
    );

    const [assignments, submissions] = await Promise.all([
      assignmentIds.length
        ? Promise.all(assignmentIds.map((id) =>
          canvasFetch(`/api/v1/courses/${courseId}/assignments/${id}`).catch((error) => ({
            id,
              _cpt_error: error.message
            }))
          ))
         : Promise.resolve([]),

      assignmentIds.length
        ? Promise.all(assignmentIds.map((id) =>
            canvasFetch(`/api/v1/courses/${courseId}/assignments/${id}/submissions/self`).catch((error) => ({
              assignment_id: id,
              _cpt_error: error.message
            }))
          ))
        : Promise.resolve([])
    ]);

    return {
      user,
      course,
      role,
      modules,
      moduleItemsByModuleId,
      assignmentIds,
      assignmentMap: new Map(assignments.map((a) => [Number(a.id), a])),
      submissionMap: new Map(submissions.map((s) => [Number(s.assignment_id), s])),
      elapsedMs: Math.round(performance.now() - start)
    };
  }


  function renderSettingsPanel(moduleId, data) {
  return renderSettingsPanelHtml({
    moduleId,
    data,
    rules: appState.rules,
    requiredKeywords: REQUIRED_KEYWORDS,
    isTextHeaderItem,
    isRequiredTitle,
    cleanText,
    escapeHtml
  });
}

  
  function bindEvents(wrapper) {
    bindHeaderButtons();

    wrapper.querySelectorAll(".cpt-settings-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        appState.showSettingsForModuleId = button.dataset.moduleId;
        rerender();
      });
    });

    wrapper.querySelector(".cpt-close-settings")?.addEventListener("click", () => {
      appState.showSettingsForModuleId = null;
      rerender();
    });

    wrapper.querySelector(".cpt-save-rules")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const moduleId = button.dataset.moduleId;
      const panel = wrapper.querySelector(`.cpt-settings-panel[data-module-id="${moduleId}"]`);
      const selectedIds = Array.from(panel.querySelectorAll(".cpt-rule-checkbox:checked"))
        .map((checkbox) => checkbox.value);

      appState.rules[String(moduleId)] = {
        mode: "custom",
        requiredItemIds: selectedIds,
        updatedAt: new Date().toISOString()
      };

      await saveRules(appState.courseId, appState.rules);
      appState.showSettingsForModuleId = null;
      await reloadDataAndRender();
    });

    wrapper.querySelector(".cpt-reset-rules")?.addEventListener("click", async (event) => {
      const moduleId = event.currentTarget.dataset.moduleId;
      delete appState.rules[String(moduleId)];
      await saveRules(appState.courseId, appState.rules);
      appState.showSettingsForModuleId = null;
      await reloadDataAndRender();
    });
  }

  function rerender() {
    const wrapper = document.getElementById(EXTENSION_ID);
    appState.modules = analyzeModules(
      appState.data,
      appState.rules,
      REQUIRED_KEYWORDS,
      PASSING_PERCENT
    );
    renderProgressTracker(wrapper, appState.courseId, appState.data, appState.modules);
  }

  async function reloadDataAndRender() {
    const wrapper = createShell();
    if (!wrapper && appState.collapsed) return;

    appState.data = await getCanvasData(appState.courseId);
    appState.modules = analyzeModules(
      appState.data,
      appState.rules,
      REQUIRED_KEYWORDS,
      PASSING_PERCENT
    );
    renderProgressTracker(wrapper, appState.courseId, appState.data, appState.modules);
  }

  async function init() {
    const courseId = getCourseIdFromUrl();

    if (!courseId) {
      const wrapper = createShell();
      renderError(wrapper, new Error("Could not determine course ID from URL."));
      return;
    }

    appState.courseId = courseId;
    const uiState = await loadUiState(courseId);
    appState.collapsed = Boolean(uiState.collapsed);

    const wrapper = createShell();
    if (!wrapper && appState.collapsed) return;

    try {
      appState.rules = await loadRules(courseId);
      appState.data = await getCanvasData(courseId);
     appState.modules = analyzeModules(
      appState.data,
      appState.rules,
      REQUIRED_KEYWORDS,
      PASSING_PERCENT
    );
renderProgressTracker(wrapper, courseId, appState.data, appState.modules);
    } catch (error) {
      renderError(wrapper, error);
    }
  }

  setTimeout(init, 1000);
}
