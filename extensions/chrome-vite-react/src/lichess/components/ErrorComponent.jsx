import "./ErrorComponent.css";

export default function ErrorComponent({ error }) {
  return (
    <div className="ca_error">
      <span className="ca_error_message">{error}</span>
    </div>
  );
}
