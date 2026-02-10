import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os

# Load data
df = pd.read_csv('data/brent_daily.csv')
df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)
df = df.sort_values('Date')

# Calculations
df['log_price'] = np.log(df['Price'])
df['returns'] = df['log_price'].diff()
df['volatility'] = df['returns'].rolling(window=30).std() * np.sqrt(252)

# Ensure output directory exists
os.makedirs('report/images', exist_ok=True)

# Plot 1: Brent Oil Price Over Time
plt.figure(figsize=(12, 6))
plt.plot(df['Date'], df['Price'], color='#38bdf8', linewidth=1.5)
plt.title('Brent Oil Price Over Time', fontsize=16, fontweight='bold')
plt.xlabel('Year', fontsize=12)
plt.ylabel('Price (USD/Barrel)', fontsize=12)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('report/images/brent_price_time_series.png', dpi=300)
plt.close()

# Plot 2: Daily Log Returns
plt.figure(figsize=(12, 6))
plt.plot(df['Date'], df['returns'], color='#ef4444', linewidth=0.5, alpha=0.7)
plt.title('Daily Log Returns', fontsize=16, fontweight='bold')
plt.xlabel('Year', fontsize=12)
plt.ylabel('Log Returns', fontsize=12)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('report/images/daily_log_returns.png', dpi=300)
plt.close()

# Plot 3: Rolling 30-Day Volatility
plt.figure(figsize=(12, 6))
plt.plot(df['Date'], df['volatility'], color='#8b5cf6', linewidth=1.5)

# Annotate key events on volatility
events = {
    '2008-09-15': '2008 Crisis',
    '2014-11-27': '2014 Crash',
    '2020-03-08': 'COVID-19',
    '2022-02-24': 'Ukraine Conflict'
}

for date_str, label in events.items():
    date = pd.to_datetime(date_str)
    # Find the y-value near this date
    mask = (df['Date'] >= date) & (df['Date'] <= date + pd.Timedelta(days=30))
    if not df[mask].empty:
        vol_val = df[mask]['volatility'].max()
        plt.annotate(label, xy=(date, vol_val), xytext=(date, vol_val + 0.1),
                     arrowprops=dict(facecolor='black', shrink=0.05, width=1, headwidth=5),
                     fontsize=10, fontweight='bold')

plt.title('Rolling 30-Day Volatility (Annualized)', fontsize=16, fontweight='bold')
plt.xlabel('Year', fontsize=12)
plt.ylabel('Volatility', fontsize=12)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('report/images/rolling_volatility.png', dpi=300)
plt.close()

print("Plots generated successfully in report/images/")
