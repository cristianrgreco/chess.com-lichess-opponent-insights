import "./Tab.css";

export default function Tab({ label, currentTab, setCurrentTab, additionalClasses = "", children }) {
  return (
    <span
      className={`ca_tab ${currentTab === label ? "ca_active" : ""} ${additionalClasses}`}
      onClick={() => setCurrentTab(label)}
    >
      {children}
    </span>
  );
}
