import { useState, useEffect } from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import { Input } from './Input';
import { debounce } from 'lodash'
import { blackscholes } from '../utils/mathUtils';

export const BlackScholesForm = ({ onChange }) => {

    const methods = useForm()
    
    const handleChange = () => {
        debouncedSubmit()
    }

    const onSubmit = methods.handleSubmit(data => {

        console.log(data)
        const {call, put} = blackscholes(data.asset_price, data.strike_price, data.expiry_time, data.interest_rate, data.volatility)
        onChange({call, put})
        
    })

    const debouncedSubmit = debounce(onSubmit, 750);


    return (
        <FormProvider {...methods}>
            <div class="asset-stat-form">
                <Input
                    label="Current Asset Price"
                    id="asset_price"
                    type="number"
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
        </FormProvider>
    )
}