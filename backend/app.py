from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json
import os
from utils import load_and_process_data, get_event_correlations

app = Flask(__name__)
CORS(app)

@app.route('/api/prices')
def prices():
    df, _, _ = load_and_process_data()
    if df.empty:
        return jsonify([])
    # Convert Date to string for JSON serialization
    df_json = df.copy()
    df_json['Date'] = df_json['Date'].dt.strftime('%Y-%m-%d')
    # Fill NaN values for JSON compatibility
    df_json = df_json.fillna(0)
    return jsonify(df_json.to_dict(orient='records'))

@app.route('/api/events')
def api_events():
    _, events, _ = load_and_process_data()
    if events.empty:
        return jsonify([])
    events_json = events.copy()
    events_json['date'] = events_json['date'].dt.strftime('%Y-%m-%d')
    return jsonify(events_json.to_dict(orient='records'))

@app.route('/api/change_points')
def api_cps():
    _, _, cp_summary = load_and_process_data()
    return jsonify(cp_summary)

@app.route('/api/correlations')
def api_correlations():
    df, events, _ = load_and_process_data()
    if df.empty or events.empty:
        return jsonify([])
    correlations = get_event_correlations(df, events)
    return jsonify(correlations)

@app.route('/api/metrics')
def api_metrics():
    df, _, cp_summary = load_and_process_data()
    if df.empty:
        return jsonify({})
    
    latest_price = float(df['Price'].iloc[-1])
    avg_price = float(df['Price'].mean())
    max_price = float(df['Price'].max())
    min_price = float(df['Price'].min())
    current_vol = float(df['Volatility'].iloc[-1]) if not pd.isna(df['Volatility'].iloc[-1]) else 0
    
    return jsonify({
        "latest_price": latest_price,
        "avg_price": avg_price,
        "max_price": max_price,
        "min_price": min_price,
        "current_volatility": current_vol,
        "cp_summary": cp_summary
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
