import { renderRadarSummaryCard } from "./components/radarSummaryCard.js";
import { renderStudentRadarTable } from "./components/studentRadarTable.js";
import { renderRequiredItemsPanel } from "./components/requiredItemsPanel.js";

function getEmptySummaryGroups() {
  return {
    onTrack: [],
    watchList: [],
    atRisk: [],
    inactive: [],
    endDateAlert: []
  };
}

export function renderStudentRadar({
  students = [],
  assignments = [],
  selectedAssignmentIds = [],
  endDates = {},
  summaryGroups = getEmptySummaryGroups(),
  loading = false,
  error = null
} = {}) {
  return `
    <div class="cpt-student-radar">

      <div class="cpt-overall">
        <div class="cpt-module-topline">
          <div class="cpt-radar-heading">
            <span class="cpt-module-title">
              Wayfinder Student Radar
            </span>

            <button
              type="button"
              id="cpt-radar-required-button"
              class="cpt-radar-required-button"
            >
              Required Items (${selectedAssignmentIds.length})
            </button>
          </div>

          ${renderRequiredItemsPanel({
            assignments,
            selectedIds: selectedAssignmentIds
          })}
        </div>
      </div>

      <div class="cpt-summary cpt-radar-summary">
        ${renderRadarSummaryCard({
          label: "On Track",
          students: summaryGroups.onTrack,
          emptyMessage: "No unfinished students were active within the last 5 days."
        })}

        ${renderRadarSummaryCard({
          label: "Watch List",
          students: summaryGroups.watchList,
          emptyMessage: "No unfinished students have been inactive for 5–9 days."
        })}

        ${renderRadarSummaryCard({
          label: "At Risk",
          students: summaryGroups.atRisk,
          emptyMessage: "No unfinished students have been inactive for 10–99 days."
        })}

        ${renderRadarSummaryCard({
          label: "Inactive",
          students: summaryGroups.inactive,
          emptyMessage: "No unfinished students have been inactive for 100+ days."
        })}

        ${renderRadarSummaryCard({
          label: "End Date Alert",
          students: summaryGroups.endDateAlert,
          emptyMessage: "No unfinished students are within 10 days of their end date."
        })}
      </div>

      <div class="cpt-radar-filters">
        <label class="cpt-radar-filter">
          <input
            type="checkbox"
            id="cpt-hide-inactive"
            checked
          >
          <span>Hide inactive 100+ days</span>
        </label>

        <label class="cpt-radar-filter">
          <input
            type="checkbox"
            id="cpt-hide-complete"
            checked
          >
          <span>Hide 100% submitted and graded</span>
        </label>
      </div>

      <div class="cpt-body">
        ${renderStudentRadarTable({
          students,
          endDates,
          loading,
          error
        })}
      </div>

    </div>
  `;
}