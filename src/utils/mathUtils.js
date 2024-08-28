import { cumulativeStdNormalProbability as N } from 'simple-statistics';
export function blackscholes(asset_price, strike_price, expiry_time, interest_rate, volatility) {

    const S = Number(asset_price);
    const K = Number(strike_price);
    const T = Number(expiry_time);
    const r = Number(interest_rate);
    const sigma = Number(volatility);

    const d1 = (Math.log(S / K) + (r + Math.pow(sigma, 2) / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    const call = S * N(d1) - K * Math.exp(-r * T) * N(d2);
    const put = K * Math.exp(-r * T) * N(-d2) - S * N(-d1);

    return {
        call: call.toFixed(2), 
        put: put.toFixed(2) 
    };
}