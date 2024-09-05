import { Fragment, useState, useCallback } from "react";
import { BlackScholesForm } from "./components/BlockScholesForm";
import { HeatMapForm } from "./components/HeatMapForm";
import { getHeatmaps } from "./utils/api/heatmap-api";
import { FormProvider, useForm } from "react-hook-form";

import './App.css';
import load from './assets/images/loading.gif';

function App() {

  const methods = useForm({ mode: 'onChange' });
  const [prices, setPrices] = useState({ call: 0, put: 0 });
  const [heatmaps, setHeatmaps] = useState([]);
  const [loading, setLoading] = useState(false);

  const onInputFieldUpdate = useCallback((newPrices) => {
    setPrices(newPrices);
  }, []);

  // Callback to fetch heatmap from API
  const onHeatMap = useCallback(async (data) => {
    console.log(data)
    const requestData = {
      "spot_price_max": Number(data.spot_price_max),
      "spot_price_min": Number(data.spot_price_min),
      "volatility_max": Number(data.volatility_max),
      "volatility_min": Number(data.volatility_min),
      "purchase_price": Number(data.purchase_price),
      "strike_price": Number(data.strike_price),
      "expiry_time": Number(data.expiry_time),
      "interest_rate": Number(data.interest_rate)
  };

      setLoading(true);

      const images = await getHeatmaps(requestData);
      setHeatmaps(images.map(image => ({
        ...image,
        url: URL.createObjectURL(image.blob)
      })));

      setLoading(false);
  }, []);

  return (
    <Fragment>
      <main class="wrapper">
        <div class="input-wrapper">
          <FormProvider {...methods}>
            <BlackScholesForm onChange={onInputFieldUpdate}/>
            <hr></hr>
            <HeatMapForm submit={onHeatMap}></HeatMapForm>
          </FormProvider>
        </div>
        <div class="info-wrapper">
          <h1 class="main-title">Black-Scholes Pricing Model</h1>
          <section class="call-put-values">
            <div class="call-value">
              <p>CALL Value</p>
              <strong>${prices.call}</strong>
            </div>
            <div class="put-value">
              <p>PUT Value</p>
              <strong>${prices.put}</strong>
            </div>
          </section>
          <div class="heatmap-wrapper">
            <h2 class="heatmap-title">Option PNL Heatmap</h2>
            {heatmaps.length >= 2 || loading ? (
            <section class="heatmaps">
              <div class="call-heatmap">
                <strong>CALL Heatmap</strong>
                {loading ? (
                <img src={load} className="loading" alt="loading..."/> 
                ) : (
                  <img
                    key={heatmaps[0]?.filename}
                    src={heatmaps[0]?.url}
                    alt={heatmaps[0]?.filename}
                    className="heatmap-image"
                  />
                )}             
              </div>
              <div class="put-heatmap">
                <strong>PUT Heatmap</strong>
                {loading ? (
                <img src={load} className="loading" alt="loading..."/> 
                ) : (
                  <img
                    key={heatmaps[1]?.filename}
                    src={heatmaps[1]?.url}
                    alt={heatmaps[1]?.filename}
                    className="heatmap-image"
                  />
                )}
            </div>
            </section>
            ) : (
              <p>No heatmaps available</p>
            )}
          </div>
        </div>
      </main>
    </Fragment>
  )
}

export default App;
