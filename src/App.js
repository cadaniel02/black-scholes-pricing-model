import { Fragment, useState, useCallback, useEffect, useMemo } from "react"
import { BlackScholesForm } from "./components/BlockScholesForm";

import logo from './logo.svg';
import './App.css';
function App() {

  const [prices, setPrices] = useState({
    call: "",
    put: "",
});

  const onInputFieldUpdate = useCallback((newPrices) => {
    console.log(newPrices)
    setPrices(newPrices);
  }, []);

  return (
    <Fragment>
      <main class="wrapper">
        <div class="input-wrapper">
          <BlackScholesForm onChange={onInputFieldUpdate}/>
          <hr></hr>
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
        </div>
      </main>
    </Fragment>
  )
}

export default App;
