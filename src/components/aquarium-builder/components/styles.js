// ============================================================================
// SHARED UI STYLES
// Reusable style factories for buttons, labels, and section headings
// ============================================================================

/** Active/inactive button style */
export const B = (active) => ({
  padding: "10px 12px",
  fontFamily: "inherit",
  fontSize: 12,
  cursor: "pointer",
  background: active ? "rgba(60,140,255,0.12)" : "rgba(255,255,255,0.025)",
  border: active ? "1px solid rgba(60,140,255,0.35)" : "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  color: active ? "#7CB8FF" : "#8899AA",
  transition: "all 0.15s",
  textAlign: "left",
});

/** Section label style */
export const L = {
  fontSize: 11,
  opacity: 0.3,
  letterSpacing: 2,
  textTransform: "uppercase",
  marginBottom: 10,
};

/** Size label from userScale value */
export function getSizeLabel(us) {
  return us <= 0.55 ? "S" : us <= 0.85 ? "M" : us <= 1.15 ? "L" : "XL";
}

/** Size picker options */
export const SIZE_OPTIONS = [
  { label: "S", val: 0.45 },
  { label: "M", val: 0.75 },
  { label: "L", val: 1.0 },
  { label: "XL", val: 1.5 },
];

/** Collapsible group header button */
export function groupHeaderStyle(isOpen, accentColor = "60,140,255") {
  return {
    width: "100%",
    padding: "8px 10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: isOpen ? `rgba(${accentColor},0.08)` : "rgba(255,255,255,0.02)",
    border: isOpen ? `1px solid rgba(${accentColor},0.15)` : "1px solid rgba(255,255,255,0.04)",
    borderRadius: isOpen ? "8px 8px 0 0" : 8,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 600,
    transition: "all 0.15s",
  };
}

/** Collapsible group content container */
export const groupContentStyle = {
  background: "rgba(255,255,255,0.015)",
  border: "1px solid rgba(255,255,255,0.04)",
  borderTop: "none",
  borderRadius: "0 0 8px 8px",
  padding: "4px",
};
