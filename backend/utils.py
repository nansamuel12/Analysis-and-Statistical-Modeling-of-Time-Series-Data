import pandas as pd
import numpy as np
import os
import json

def load_and_process_data():
    try:
        # Resolve paths relative to this file
        base_dir = os.path.dirname(os.path.abspath(__file__))
        price_path = os.path.join(base_dir, '../data/brent_daily.csv')
        events_path = os.path.join(base_dir, '../data/events.csv')
        summary_path = os.path.join(base_dir, 'results/change_point_summary.json')

        # Load price data
        df = pd.read_csv(price_path)
        df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)
        df = df.sort_values('Date')
        
        # Basic Price Analytics
        df['Returns'] = df['Price'].pct_change()
        df['Volatility'] = df['Returns'].rolling(window=30).std() * np.sqrt(252)
        
        # Load events
        events = pd.read_csv(events_path)
        events['date'] = pd.to_datetime(events['date'])
        
        # Load Change Point Summary
        cp_summary = {}
        if os.path.exists(summary_path):
            with open(summary_path) as f:
                cp_summary = json.load(f)
        
        return df, events, cp_summary
    except Exception as e:
        print(f"Error loading files: {e}")
        return pd.DataFrame(), pd.DataFrame(), {"error": str(e)}

def get_event_correlations(df, events):
    correlations = []
    
    for _, event in events.iterrows():
        ev_date = event['date']
        # Look at window 30 days before and after
        before_mask = (df['Date'] >= (ev_date - pd.Timedelta(days=30))) & (df['Date'] < ev_date)
        after_mask = (df['Date'] >= ev_date) & (df['Date'] <= (ev_date + pd.Timedelta(days=30)))
        
        if not df[before_mask].empty and not df[after_mask].empty:
            avg_price_before = df[before_mask]['Price'].mean()
            avg_price_after = df[after_mask]['Price'].mean()
            price_change_pct = ((avg_price_after - avg_price_before) / avg_price_before) * 100
            
            vol_before = df[before_mask]['Volatility'].mean()
            vol_after = df[after_mask]['Volatility'].mean()
            vol_change_pct = ((vol_after - vol_before) / vol_before) * 100 if vol_before != 0 else 0
            
            correlations.append({
                "title": event['title'],
                "date": ev_date.strftime('%Y-%m-%d'),
                "type": event['type'],
                "price_change_pct": round(price_change_pct, 2),
                "vol_change_pct": round(vol_change_pct, 2),
                "avg_price_before": round(avg_price_before, 2),
                "avg_price_after": round(avg_price_after, 2)
            })
            
    return correlations
