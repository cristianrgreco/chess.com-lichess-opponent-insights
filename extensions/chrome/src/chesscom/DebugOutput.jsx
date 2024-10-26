import React from "react";

export default function DebugOutput({ gameInfo, userAnalytics }) {
  return (
    <pre
      style={{
        color: "white",
        textWrap: "nowrap",
        fontSize: "10px",
        maxHeight: "768px",
        overflow: "scroll",
      }}
    >
      GAME INFO
      {"\n"}
      {JSON.stringify(gameInfo, null, 2)}
      {"\n\n"}
      USER ANALYTICS
      {"\n"}
      {JSON.stringify(userAnalytics)}
    </pre>
  );
}
