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

matplotlib.use('Agg')  # Use 'Agg' backend for non-GUI rendering
app = Flask(__name__)
CORS(app)

@app.route('/generate-heatmaps', methods=['POST'])
def generate_heatmap():

    print(request.json)
    
    data = request.json
    maxS = np.array(data['spot_price_max'])
    minS = np.array(data['spot_price_min'])
    maxV = np.array(data['volatility_max'])
    minV = np.array(data['volatility_min'])
    purchase_price = float(data['purchase_price'])

    K = np.array(data['strike_price'])
    T = np.array(data['expiry_time'])
    r = np.array(data['interest_rate'])

    def black_scholes_call(S, K, T, r, sigma):
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        call_price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
        return call_price

    def black_scholes_put(S, K, T, r, sigma):
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        put_price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
        return put_price

    spot_prices = np.linspace(minS, maxS, 10) 
    volatility = np.linspace(minV, maxV, 10)  

    S, sigma = np.meshgrid(spot_prices, volatility)

    call_prices = black_scholes_call(S, K, T, r, sigma)
    put_prices = black_scholes_put(S, K, T, r, sigma)

    call_pnl = np.maximum(call_prices - purchase_price, -purchase_price)
    put_pnl = np.maximum(put_prices - purchase_price, -purchase_price)
    def custom_normalize(pnl, purchase_price):
        normalized_loss = np.clip((pnl + purchase_price) / (2 * purchase_price), 0, 0.5)
        k = 1000
        normalized_profit = np.clip((np.log1p(k * pnl / purchase_price) / np.log1p(k * 10)), 0.5, 1)

        return np.where(pnl < 0, normalized_loss, normalized_profit)

    call_pnl_normalized = custom_normalize(call_pnl, purchase_price)
    put_pnl_normalized = custom_normalize(put_pnl, purchase_price)

    images = []

    labels = np.array([[f'{"-" if pnl_val < 0 else ""}${abs(pnl_val):.2f}' for pnl_val in row] for row in call_pnl])
    plt.figure(figsize=(10, 8))
    ax = sns.heatmap(call_pnl_normalized, xticklabels=np.round(spot_prices, 2), yticklabels=np.round(volatility, 2),
        cmap="RdYlGn", center=0.5, annot=labels, fmt="", cbar_kws={'label' : 'PNL'})
    ax.set_xticklabels(ax.get_xticklabels(), color='white')
    ax.set_yticklabels(ax.get_yticklabels(), color='white')

    ax.set_xlabel('Spot Price', color='white')
    ax.set_ylabel('Volatility', color='white')
    colorbar = ax.collections[0].colorbar
    colorbar.set_label('PNL', color='white')
    colorbar.ax.yaxis.label.set_color('white')
    colorbar.ax.tick_params(labelcolor='white')

    call_buf = BytesIO()
    plt.savefig(call_buf, format='png', transparent=True)
    call_buf.seek(0)
    images.append(('call_heatmap.png', call_buf))
    plt.close()

    labels = np.array([[f'{"-" if pnl_val < 0 else ""}${abs(pnl_val):.2f}' for pnl_val in row] for row in put_pnl])
    plt.figure(figsize=(10, 8))
    ax = sns.heatmap(put_pnl_normalized, xticklabels=np.round(spot_prices, 2), yticklabels=np.round(volatility, 2),
        cmap="RdYlGn", center=0.5, annot=labels, fmt="", cbar_kws={'label' : 'PNL'})

    ax.set_xlabel('Spot Price', color='white')
    ax.set_ylabel('Volatility', color='white')
    ax.set_xticklabels(ax.get_xticklabels(), color='white')
    ax.set_yticklabels(ax.get_yticklabels(), color='white')

    colorbar = ax.collections[0].colorbar
    colorbar.set_label('PNL', color='white')
    colorbar.ax.yaxis.label.set_color('white')
    colorbar.ax.tick_params(labelcolor='white')

    call_buf = BytesIO()
    plt.savefig(call_buf, format='png', transparent=True)
    call_buf.seek(0)
    images.append(('put_heatmap.png', call_buf))
    plt.close()

    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, 'w') as zf:
        for filename, buffer in images:
            zf.writestr(filename, buffer.getvalue())
    zip_buf.seek(0)

    return send_file(zip_buf, mimetype='application/zip', as_attachment=True, download_name='heatmaps.zip')


def lambda_handler(event, context):
    return awsgi.response(app, event, context, base64_content_types={"image/png"})