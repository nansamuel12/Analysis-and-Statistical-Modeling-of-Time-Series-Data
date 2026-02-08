# Assumptions and Limitations

## 1. Statistical Assumptions
*   **Normal Likelihood**: The model assumes that log returns within each segment follow a Normal distribution. While standard, it may underestimate the "fat tails" (extreme events) common in financial time series.
*   **Abrupt Change**: The model assumes a "jump" or discrete switch at point $\tau$. In reality, many market shifts are gradual transitions rather than instantaneous steps.
*   **Stationarity of Segments**: It is assumed that $\mu$ and $\sigma$ remain constant between change points, which ignore local intra-segment trends.

## 2. Correlation vs. Causality
*   **The Temporal Trap**: Matching a change point to an event within a 14-day window provides evidence of **correlation**, not proof of **causality**.
*   **Latent Variables**: Multiple geopolitical, macroeconomic, and technical factors often converge. A detected shift might be the aggregate result of factors not captured in the events table.
*   **Leading Indicators**: Market participants often price in events (e.g., sanctions) weeks before they occur, potentially causing the change point to precede the recorded event date.

## 3. Data Limitations
*   **Frequency**: Daily data may miss intra-day volatility spikes which could define a more precise shift boundary.
*   **Single Index**: Brent is a global benchmark, but local disruptions in WTI or regional blends may influence prices without representing a global structural break.
