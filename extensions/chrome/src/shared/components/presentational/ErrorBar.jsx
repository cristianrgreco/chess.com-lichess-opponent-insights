import "./ErrorBar.css";

export default function ErrorBar({ error }) {
  return (
    <div className="ca_error">
      <span className="ca_error_message" data-testid="error-message">
        {error}
      </span>
    </div>
  );
}
