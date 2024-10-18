const baseRuleValidate = ($t) => (columnName) => ([
    { required: true, message: $t('validate.required', { column: columnName }), trigger: ['blur', 'change'] }
]);

export default baseRuleValidate;