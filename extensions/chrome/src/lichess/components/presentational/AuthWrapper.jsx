import React from "react";
import "./AuthWrapper.css";
import logo from "@/logo_128x128.png";
import { OpenInNewWindowIcon } from "@/shared";

export default function AuthWrapper({ accessToken, onClickAuthorise, children }) {
  if (accessToken === undefined) {
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
          <OpenInNewWindowIcon width={14} height={14} />
        </button>
      </div>
    );
  } else {
    return <React.Fragment>{children}</React.Fragment>;
  }
}
