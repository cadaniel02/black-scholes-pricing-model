import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from './Input';
import { debounce } from 'lodash'
import { blackscholes } from '../utils/mathUtils';
import { getFieldsAsDict } from '../utils/keyUtils'

export const BlackScholesForm = ({ onChange }) => {

    const { handleSubmit, watch, formState: { isValid } } = useFormContext();

    const onSubmit = handleSubmit(data => {
        const { call, put } = blackscholes(data.asset_price, data.strike_price, data.expiry_time, data.interest_rate, data.volatility);
        onChange({ call, put });
    });

    const debouncedSubmit = useRef(debounce(onSubmit, 1000)).current;

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            console.log('Field changed:', name, 'Event type:', type, 'Current form values:', value);
            console.log('Form validity:', isValid);
            if (isValid) {
                debouncedSubmit(value);
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, isValid, debouncedSubmit]);


    return (
        <div class="asset-stat-form">
            <Input
                label="Current Asset Price"
                id="asset_price"
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