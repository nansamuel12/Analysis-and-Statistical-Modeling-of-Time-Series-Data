from flask import Flask, jsonify, send_file
from flask_cors import CORS
import json
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Helper to load data
def load_data():
    try:
        price_df = pd.read_csv('../data/brent_daily.csv')
        events = pd.read_csv('../data/events.csv')
        
        summary_path = 'results/change_point_summary.json'
        if os.path.exists(summary_path):
            with open(summary_path) as f:
                cp_summary = json.load(f)
        else:
            cp_summary = {"message": "No model results found yet. Run the Jupyter notebook."}
            
        return price_df, events, cp_summary
    except Exception as e:
        print(f"Error loading files: {e}")
        return pd.DataFrame(), pd.DataFrame(), {"error": str(e)}

@app.route('/api/prices')
def prices():
    df, _, _ = load_data()
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/events')
def api_events():
    _, events, _ = load_data()
    return jsonify(events.to_dict(orient='records'))

@app.route('/api/change_points')
def api_cps():
    _, _, cp_summary = load_data()
    return jsonify(cp_summary)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
