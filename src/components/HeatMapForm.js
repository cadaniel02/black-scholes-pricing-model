import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from './Input';
import { throttle } from 'lodash'

export const HeatMapForm = ({submit}) => {

    const { watch, trigger, handleSubmit, getValues, setError } = useFormContext();

    const volatilityMin = watch('volatility_min');
    const volatilityMax = watch('volatility_max');
    const spotPriceMin = watch('spot_price_min');
    const spotPriceMax = watch('spot_price_max');

    const onSubmit = handleSubmit(data => {

        const valuesFromFirstForm = getValues(['strike_price', 'expiry_time', 'interest_rate']);
        const valuesFromFirstFormObject = {
            strike_price: valuesFromFirstForm[0],
            expiry_time: valuesFromFirstForm[1],
            interest_rate: valuesFromFirstForm[2]
        };
        if (!valuesFromFirstFormObject.strike_price || !valuesFromFirstFormObject.expiry_time || !valuesFromFirstFormObject.interest_rate) {
            setError('form', { type: 'manual', message: 'First form values are required!' });
            return;
        }
        submit({...data, ...valuesFromFirstFormObject})
    })

    const throttled = useRef(throttle(onSubmit, 1000)).current;

    useEffect(() => {
        trigger(['volatility_min', 'volatility_max']);
    }, [volatilityMax, volatilityMin, trigger]);

    useEffect(() => {
        trigger(['spot_price_min', 'spot_price_max']);
    }, [spotPriceMax, spotPriceMin, trigger]);

    return (
        <form class="heatmap-form" onSubmit={handleSubmit(throttled)}>
            <div class="input-range">
                <Input
                    label="Minimum Spot Price"
                    id="spot_price_min"
                    name="spot_price_min"
                    type="number"
                    step="any"
                    validation={{
                        required: {
                            value: true,
                            message: 'required',
                        },
                        min: {
                            value: 0,
                            message: 'value must be positive'
                        },
                        max: {
                            value: spotPriceMax || Infinity,
                            message: 'input value lower than maximum'
                        }
                    }}
                />
                <Input
                    label="Maximum Spot Price"
                    id="spot_price_max"
                    name="spot_price_max"
                    type="number"
                    step="any"
                    validation={{
                        required: {
                            value: true,
                            message: 'required',
                        },
                        min: {
                            value: Math.max(spotPriceMin || 0, 0),
                            message: 'input positive value higher than minimum'
                        }
                    }}
                />
            </div>
            <div class="input-range">
                <Input
                    label="Minimum Volatility"
                    id="volatility_min"
                    name="volatility_min"
                    type="number"
                    step="any"
                    validation={{
                        required: {
                            value: true,
                            message: 'required',
                        },
                        min: {
                            value: 0,
                            message: 'value must be positive'
                        },
                        max: {
                            value: volatilityMax || Infinity,
                            message: 'input value lower than maximum'
                        }
                    }}
                />
                <Input
                    label="Maximum Volatility"
                    id="volatility_max"
                    name="volatility_max"
                    type="number"
                    step="any"
                    validation={{
                        required: {
                            value: true,
                            message: 'required',
                        },
                        min: {
                            value: Math.max(volatilityMin || 0, 0),
                            message: 'input positive value higher than minimum'
                        },
                        max: {
                            value: 1,
                            message: 'input at most 1'
                        }
                    }}
                />
            </div>
            <Input
                label="Option Purchase Price"
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="any"
                validation={{
                    required: {
                        value: true,
                        message: 'required',
                    },
                    min: {
                        value: 0,
                        message: 'value must be positive'
                    }
                }}
            />
            <button type="submit">
                {'Submit'}
            </button>
        </form>
    )
}