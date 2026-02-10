import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import os

# Set style
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams['figure.figsize'] = (10, 6)

def generate_distribution_plot():
    # Load data
    price_df = pd.read_csv('data/brent_daily.csv')
    price_df['Date'] = pd.to_datetime(price_df['Date'], dayfirst=True)
    price_df = price_df.sort_values('Date')
    
    # Calculate returns
    price_df['returns'] = np.log(price_df['Price']).diff()
    price_df = price_df.dropna()
    
    # Load Change Point
    with open('backend/results/change_point_summary.json') as f:
        cp_summary = json.load(f)
    
    cp_date = pd.to_datetime(cp_summary['cp_median_date'])
    
    # Split data
    before = price_df[price_df['Date'] < cp_date]['returns']
    after = price_df[price_df['Date'] >= cp_date]['returns']
    
    # Plot
    plt.figure(figsize=(10, 6))
    
    sns.kdeplot(before, fill=True, label=f'Before {cp_date.strftime("%Y-%m-%d")}', color='#38bdf8', alpha=0.5)
    sns.kdeplot(after, fill=True, label=f'After {cp_date.strftime("%Y-%m-%d")}', color='#ef4444', alpha=0.5)
    
    # Add vertical lines for means
    plt.axvline(before.mean(), color='#38bdf8', linestyle='--', alpha=0.8)
    plt.axvline(after.mean(), color='#ef4444', linestyle='--', alpha=0.8)
    
    plt.title('Distribution of Daily Log Returns Before and After Structural Break (τ)', fontsize=15, fontweight='bold')
    plt.xlabel('Log Returns', fontsize=12)
    plt.ylabel('Density', fontsize=12)
    plt.legend()
    
    # Annotate shifts
    mu1 = cp_summary.get('mu1_mean', before.mean())
    mu2 = cp_summary.get('mu2_mean', after.mean())
    
    plt.annotate(f'μ1 ≈ {mu1:.5f}', xy=(before.mean(), plt.ylim()[1]*0.9), color='#0ea5e9', fontweight='bold')
    plt.annotate(f'μ2 ≈ {mu2:.5f}', xy=(after.mean(), plt.ylim()[1]*0.8), color='#ef4444', fontweight='bold')
    
    plt.tight_layout()
    
    # Ensure directory exists
    os.makedirs('report/images', exist_ok=True)
    
    output_path = 'report/images/returns_distribution_shift.png'
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Plot saved successfully to {output_path}")

if __name__ == "__main__":
    generate_distribution_plot()
