import logo from "../../logo_128x128.png";
import "./AuthComponent.css";

export default function AuthComponent({ onClickAuthorise }) {
  return (
    <div className="ca_auth_container">
      <div className="ca_auth_container_title">Lichess Opponent Information</div>
      <div className="ca_auth_content_container">
        <img id="ca_logo" alt="Logo" src={chrome.runtime.getURL(logo)} />
        <div>
          <p>
            <span>This extension uses the </span>
            <a href="https://lichess.org/api" target="_blank">
              Lichess API
            </a>
            <span> to fetch opponent information.</span>
          </p>
          <p style={{ marginBottom: 0 }}>You will be prompted to re-authorise when the access token expires.</p>
        </div>
      </div>
      <button id="auth_lichess_btn" className="ca_button ca_button_large ca_btn-win" onClick={onClickAuthorise}>
        <span> Authorise with Lichess</span>
        <svg width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5 12V6C5 5.44772 5.44772 5 6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H12M8.11111 12H12M12 12V15.8889M12 12L5 19"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
