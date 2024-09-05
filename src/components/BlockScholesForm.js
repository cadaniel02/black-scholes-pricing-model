import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from './Input';
import { debounce } from 'lodash'
import { blackscholes } from '../utils/mathUtils';
import { getFieldsAsDict } from '../utils/keyUtils'

export const BlackScholesForm = ({ onChange }) => {

    const { watch, trigger, getValues } = useFormContext();

    const onSubmitSubform = async () => {
        const isValid = await trigger(['asset_price', 'strike_price', 'expiry_time', 'interest_rate', 'volatility']);
    
        if (isValid) {
            const [ asset_price, strike_price, expiry_time, interest_rate, volatility ] = getValues([
                'asset_price',
                'strike_price',
                'expiry_time',
                'interest_rate',
                'volatility'
            ]);
            
            const { call, put } = blackscholes(asset_price, strike_price, expiry_time, interest_rate, volatility);
            onChange({ call, put });
        }
    };

    const debouncedSubmit = useRef(debounce(onSubmitSubform, 1000)).current;

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (['asset_price', 'strike_price', 'expiry_time', 'interest_rate', 'volatility'].some(field => field === name)) {
                debouncedSubmit();
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, debouncedSubmit]);


    return (
        <div class="asset-stat-form">
            <Input
                label="Current Asset Price"
                id="asset_price"
                name="asset_price"
                type="number"
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
            <Input
                label="Strike Price"
                id="strike_price"
                name="strike_price"
                type="number"
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
            <Input
                label="Time to Maturity"
                id="expiry_time"
                name="expiry_time"
                type="number"
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
            <Input
                label="Volatility"
                id="volatility"
                name="volatility"
                type="number"
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
                        value: 1,
                        message: 'value must be less than 1'
                    }
                }}
            />
            <Input
                label="Risk-Free Interest Rate"
                id="interest_rate"
                name="interest_rate"
                type="number"
                validation={{
                    required: {
                        value: true,
                        message: 'required',
                    },
                    min: {
                        value: -1,
                        message: 'value must be greater than -1'
                    },
                    max: {
                        value: 1,
                        message: 'value must be less than 1'
                    }
                }}
            />
        </div>
    )
}