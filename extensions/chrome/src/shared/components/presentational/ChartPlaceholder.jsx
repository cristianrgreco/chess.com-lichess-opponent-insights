export default function ChartPlaceholder({ height }) {
  return (
    <div
      className="ca_placeholder ca_placeholder_enabled"
      style={{ width: "100%", height: `${height}px` }}
      data-testid="chart-placeholder"
    ></div>
  );
}
