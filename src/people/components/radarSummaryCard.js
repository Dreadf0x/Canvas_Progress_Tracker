function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const MAX_TOOLTIP_ITEMS = 10;

function renderStudentList(
  students,
  emptyMessage
) {
  if (!students.length) {
    return `
      <div class="cpt-summary-tooltip-empty">
        ${escapeHtml(emptyMessage)}
      </div>
    `;
  }

  const visibleStudents = students.slice(
    0,
    MAX_TOOLTIP_ITEMS
  );

  const remainingCount = Math.max(
    0,
    students.length - MAX_TOOLTIP_ITEMS
  );

  return `
    <ul class="cpt-summary-tooltip-list">
      ${visibleStudents
        .map(
          (student) => `
            <li class="cpt-summary-tooltip-item">
              <span class="cpt-summary-tooltip-student-name">
                ${escapeHtml(student.name)}
              </span>

              ${
                student.detail
                  ? `
                    <span class="cpt-summary-tooltip-detail">
                      — ${escapeHtml(student.detail)}
                    </span>
                  `
                  : ""
              }
            </li>
          `
        )
        .join("")}
    </ul>

    ${
      remainingCount > 0
        ? `
          <div class="cpt-summary-tooltip-more">
            +${remainingCount} more
          </div>
        `
        : ""
    }
  `;
}

export function renderRadarSummaryCard({
  label,
  students = [],
  emptyMessage =
    "No students in this category."
} = {}) {
  const count = students.length;

  const accessibleLabel =
    count === 1
      ? `${label}: 1 student`
      : `${label}: ${count} students`;

  return `
    <div
      class="cpt-stat-card cpt-radar-summary-card"
      tabindex="0"
      aria-label="${escapeHtml(accessibleLabel)}"
    >
      <div class="cpt-stat-number">
        ${count}
      </div>

      <div class="cpt-stat-label">
        ${escapeHtml(label)}
      </div>

      <div
        class="cpt-radar-summary-tooltip"
        role="tooltip"
      >
        <div class="cpt-summary-tooltip-title">
          ${escapeHtml(label)}
        </div>

        ${renderStudentList(
          students,
          emptyMessage
        )}
      </div>
    </div>
  `;
}