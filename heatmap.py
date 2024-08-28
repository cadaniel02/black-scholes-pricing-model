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
    SRange = np.array(data['spot-price-range'])
    VRange = np.array(data['volatility-range'])
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

    # Parameters
    K = 70  # Strike price
    T = 1.1  # Time to maturity (1 year)
    r = 0.1  # Risk-free interest rate

    # User input for purchase price
    purchase_price = float(input("Enter the purchase price of the option: "))
    option_type = input("Enter 'call' or 'put' for the option type: ").lower()

    # Generate a range of spot prices and a broader range of volatility
    spot_prices = np.linspace(80, 120, 10)  # Coarser grid with 20 points
    volatility = np.linspace(0.05, .5, 10)  # Broader grid with 20 points, from 5% to 100% volatility

    # Create a meshgrid
    S, sigma = np.meshgrid(spot_prices, volatility)

    # Calculate option prices using Black-Scholes
    if option_type == 'call':
        option_prices = black_scholes_call(S, K, T, r, sigma)
    elif option_type == 'put':
        option_prices = black_scholes_put(S, K, T, r, sigma)
    else:
        raise ValueError("Option type must be either 'call' or 'put'")

    # Calculate PNL based on the purchase price
    pnl = option_prices - purchase_price
    labels = np.array([[f'{"-" if pnl_val < 0 else ""}${abs(pnl_val):.2f}' for pnl_val in row] for row in pnl])

    # Plot the PNL heatmap with profit in green and loss in red
    plt.figure(figsize=(10, 8))
    sns.heatmap(pnl, xticklabels=np.round(spot_prices, 2), yticklabels=np.round(volatility, 2), 
                cmap="RdYlGn", center=0, annot=labels, fmt="", cbar_kws={'label': 'PNL'})
    plt.xlabel('Spot Price')
    plt.ylabel('Volatility')
    plt.show()
