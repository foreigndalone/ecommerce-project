const getValidationErrors = (error) =>
    error?.issues ?? error?.errors ?? [{ message: 'Invalid request data' }]

export const validateRequest = (schema, source = 'body') => {
    if (!schema || typeof schema.safeParse !== 'function') {
        throw new TypeError('A schema with a safeParse method is required')
    }

    return (req, res, next) => {
        const result = schema.safeParse(req[source])

        if (!result.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: getValidationErrors(result.error),
            })
        }

        req[source] = result.data
        return next()
    }
}

export default validateRequest
