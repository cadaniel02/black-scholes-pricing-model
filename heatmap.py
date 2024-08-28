import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import norm
from flask import Flask, request, send_file
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO

app = Flask(__name__)

@app.route('/generate-heatmap', methods=['POST'])
def generate_heatmap():
    
    data = request.json
    maxS = np.array(data['spot-price-max'])
    minS = np.array(data['spot-price-min'])
    maxV = np.array(data['volatility-max'])
    minV = np.array(data['volatility-min'])
    purchase_price = float(data['purchase-price'])

    K = np.array(data['strike-price'])
    T = np.array(data['expiry-time'])
    r = np.array(data['interest-rate'])


    # Define the Black-Scholes formula for a call option
    def black_scholes_call(S, K, T, r, sigma):
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        call_price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
        return call_price

    # Define the Black-Scholes formula for a put option
    def black_scholes_put(S, K, T, r, sigma):
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        put_price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
        return put_price

    # Generate a range of spot prices and a broader range of volatility
    spot_prices = np.linspace(minS, maxS, 10)  # Coarser grid with 20 points
    volatility = np.linspace(minV, maxV, 10)  # Broader grid with 20 points, from 5% to 100% volatility

    # Create a meshgrid
    S, sigma = np.meshgrid(spot_prices, volatility)

    # Calculate option prices using Black-Scholes
    call_prices = black_scholes_call(S, K, T, r, sigma)
    put_prices = black_scholes_put(S, K, T, r, sigma)
    
    # Calculate PNL based on the purchase price
    call_pnl = max(call_prices - purchase_price, -purchase_price)
    put_pnl = max(put_prices - purchase_price, - purchase_price)
    
    labels = np.array([[f'{"-" if call_pnl < 0 else ""}${abs(call_pnl):.2f}' for pnl_val in row] for row in pnl])

    # Plot the PNL heatmap with profit in green and loss in red
    plt.figure(figsize=(10, 8))
    sns.heatmap(call_pnl, xticklabels=np.round(spot_prices, 2), yticklabels=np.round(volatility, 2), 
                cmap="RdYlGn", center=0, annot=labels, fmt="", cbar_kws={'label': 'PNL'})
    plt.xlabel('Spot Price')
    plt.ylabel('Volatility')
    plt.show()
    
    labels = np.array([[f'{"-" if put_pnl < 0 else ""}${abs(put_pnl):.2f}' for pnl_val in row] for row in pnl])

    
    plt.figure(figsize=(10, 8))
    sns.heatmap(put_pnl, xticklabels=np.round(spot_prices, 2), yticklabels=np.round(volatility, 2), 
                cmap="RdYlGn", center=0, annot=labels, fmt="", cbar_kws={'label': 'PNL'})
    plt.xlabel('Spot Price')
    plt.ylabel('Volatility')
    plt.show()

