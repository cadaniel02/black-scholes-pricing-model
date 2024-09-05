const fields = [
    'asset_price',
    'expiry_time',
    'interest_rate',
    'purchase_price',
    'spot_price_max',
    'spot_price_min',
    'strike_price',
    'volatility',
    'volatility_max',
    'volatility_min'
];

export const getFieldsAsDict = (values) => {
    const dict = fields.reduce((acc, field, index) => {
        acc[field] = values[index];
        return acc;
    }, {});

    return dict;
};
