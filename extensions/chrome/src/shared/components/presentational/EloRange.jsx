import { useMemo } from "react";
import "./EloRange.css";

export default function EloRange({ isLoading, userAnalytics }) {
  const placeholder = "????";
  const placeholderClass = isLoading ? "ca_placeholder_enabled" : "";

  const {
    lowestRating = 0,
    highestRating = 0,
    currentRating = 0,
    lowestRatingDateTime,
    highestRatingDateTime,
  } = userAnalytics?.performance || {};

  const lowestText = isLoading ? placeholder : lowestRating;
  const lowestTitle = isLoading ? "" : new Date(lowestRatingDateTime).toLocaleDateString();
  const highestText = isLoading ? placeholder : highestRating;
  const highestTitle = isLoading ? "" : new Date(highestRatingDateTime).toLocaleDateString();
  const currentText = isLoading ? placeholder : Math.floor(currentRating);

  const percentageIncrease = useMemo(() => {
    const range = highestRating - lowestRating;
    const diff = currentRating - lowestRating;
    const percentage = range ? (diff / range) * 100 : undefined;
    return percentage !== undefined ? Math.max(0, Math.min(100, percentage)) : 50;
  }, [userAnalytics]);

  return (
    <div className="ca_elo_range">
      <div className="ca_elo_range_lowest" data-testid="elo-lowest">
        <div className={`ca_elo_range_lowest_value ca_placeholder ${placeholderClass}`} title={lowestTitle}>
          {lowestText}
        </div>
      </div>
      <div className="ca_elo_range_current" data-testid="elo-current" style={{ left: `${percentageIncrease}%` }}>
        <div className={`ca_elo_range_current_value ca_placeholder ${placeholderClass}`}>{currentText}</div>
      </div>
      <div className="ca_elo_range_highest" data-testid="elo-highest">
        <div className={`ca_elo_range_highest_value ca_placeholder ${placeholderClass}`} title={highestTitle}>
          {highestText}
        </div>
      </div>
    </div>
  );
}
