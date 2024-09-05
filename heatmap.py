import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import norm
from flask import Flask, request, send_file
from io import BytesIO
import zipfile
from flask_cors import CORS
import awsgi
import base64

matplotlib.use('Agg')  # Use 'Agg' backend for non-GUI rendering

app = Flask(__name__)
CORS(app)

# Black-Scholes Functions
def black_scholes_call(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)

def black_scholes_put(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)

# Normalization Function
def custom_normalize(pnl, purchase_price):
    normalized_loss = np.clip((pnl + purchase_price) / (2 * purchase_price), 0, 0.5)
    k = 1000
    normalized_profit = np.clip((np.log1p(k * pnl / purchase_price) / np.log1p(k * 10)), 0.5, 1)
    return np.where(pnl < 0, normalized_loss, normalized_profit)

# Heatmap Creation Function
def create_heatmap(pnl, spot_prices, volatility, title, xlabel, ylabel):
    plt.figure(figsize=(10, 8))
    labels = np.array([[f'{"-" if pnl_val < 0 else ""}${abs(pnl_val):.2f}' for pnl_val in row] for row in pnl])
    ax = sns.heatmap(pnl, xticklabels=np.round(spot_prices, 2), yticklabels=np.round(volatility, 2),
                     cmap="RdYlGn", center=0.5, annot=labels, fmt="", cbar_kws={'label': 'PNL'})
    ax.set_xticklabels(ax.get_xticklabels(), color='white')
    ax.set_yticklabels(ax.get_yticklabels(), color='white')
    ax.set_xlabel(xlabel, color='white')
    ax.set_ylabel(ylabel, color='white')
    ax.set_title(title, color='white')
    colorbar = ax.collections[0].colorbar
    colorbar.set_label('PNL', color='white')
    colorbar.ax.yaxis.label.set_color('white')
    colorbar.ax.tick_params(labelcolor='white')
    
    buf = BytesIO()
    plt.savefig(buf, format='png', transparent=True)
    buf.seek(0)
    plt.close()
    return buf

# Zip Creation Function
def create_zip(images):
    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, 'w') as zf:
        for filename, buffer in images:
            zf.writestr(filename, buffer.getvalue())
    zip_buf.seek(0)
    return zip_buf

@app.route('/generate-heatmaps', methods=['POST'])
def generate_heatmap():
    # Retrieve input data
    data = request.json
    maxS, minS = np.array(data['spot_price_max']), np.array(data['spot_price_min'])
    maxV, minV = np.array(data['volatility_max']), np.array(data['volatility_min'])
    purchase_price = float(data['purchase_price'])
    K, T, r = np.array(data['strike_price']), np.array(data['expiry_time']), np.array(data['interest_rate'])

    # Generate spot prices and volatility ranges
    spot_prices = np.linspace(minS, maxS, 10)
    volatility = np.linspace(minV, maxV, 10)
    S, sigma = np.meshgrid(spot_prices, volatility)

    # Calculate call and put prices
    call_prices = black_scholes_call(S, K, T, r, sigma)
    put_prices = black_scholes_put(S, K, T, r, sigma)

    # Calculate PNL and normalize
    call_pnl = np.maximum(call_prices - purchase_price, -purchase_price)
    put_pnl = np.maximum(put_prices - purchase_price, -purchase_price)
    call_pnl_normalized = custom_normalize(call_pnl, purchase_price)
    put_pnl_normalized = custom_normalize(put_pnl, purchase_price)

    # Create heatmaps
    images = [
        ('call_heatmap.png', create_heatmap(call_pnl_normalized, spot_prices, volatility, 'CALL Heatmap', 'Spot Price', 'Volatility')),
        ('put_heatmap.png', create_heatmap(put_pnl_normalized, spot_prices, volatility, 'PUT Heatmap', 'Spot Price', 'Volatility'))
    ]

    # Create zip file
    zip_buf = create_zip(images)
    zip_data = base64.b64encode(zip_buf.read()).decode('utf-8')

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/zip", 
            "Content-Disposition": "attachment; filename=heatmaps.zip"
        },
        "body": zip_data,
        "isBase64Encoded": True
    }
# AWS Lambda handler
def lambda_handler(event, context):
    return awsgi.response(app, event, context, base64_content_types={"image/png"})
