# Data Analysis Workflow: Bayesian Change-Point Detection

This document outlines the systematic process used to identify and quantify structural breaks in Brent Crude oil prices.

## 1. Data Acquisition & Preprocessing
*   **Source**: Historical Brent daily prices (USD/Barrel).
*   **Transformation**: Conversion to **Daily Log Returns** to achieve stationarity and model percentage growth rates.
*   **Cleaning**: Handling missing values and ensuring chronological order.

## 2. Exploratory Data Analysis (EDA)
*   **Stationarity Checks**: Augmented Dickey-Fuller (ADF) and KPSS tests.
*   **Volatility Analysis**: 30-day rolling annualized standard deviation.
*   **Autocorrelation**: ACF/PACF plots to check for serial dependence.

## 3. Bayesian Modeling (PyMC)
*   **Model Structure**: Two-segment Normal likelihood model with a single discrete change point ($\tau$).
*   **Prior Distributions**:
    *   $\tau$: Discrete Uniform across all indices.
    *   $\mu_1, \mu_2$: Normal priors (centered at 0 for returns).
    *   $\sigma$: Half-Normal prior for volatility.
*   **Sampling**: Markov Chain Monte Carlo (MCMC) using the NUTS/Metropolis sampler.

## 4. Operational Event Matching
*   **Extraction**: Extract the median $\tau$ and 95% Highest Density Interval (HDI).
*   **Ranking**: Compare $\tau$ median date against a curated database of external events.
*   **Proximity**: Rank candidates by absolute day distance.

## 5. Reporting & Impact Quantification
*   **Shift Measurement**: Calculate % change in returns ($e^{\mu_2} - e^{\mu_1}$).
*   **Probability**: Compute $P(\mu_2 > \mu_1)$ for directional confidence.
*   **Visualization**: Price charts with HDI ribbons and volatility markers.
