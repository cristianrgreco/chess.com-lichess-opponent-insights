export default function TabContent({ label, currentTab, children }) {
  return <div className={`ca_section ca_tab_section ${currentTab !== label ? "ca_hidden" : ""}`}>{children}</div>;
}
