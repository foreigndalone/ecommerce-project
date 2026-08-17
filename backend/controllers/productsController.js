import { ObjectId } from 'mongodb'

import {
    getAllProductsModel,
    getProductByIdModel,
} from '../models/productsModel.js'

const PRODUCT_QUERY_FIELDS = ['search', 'category', 'brand', 'limit', 'skip']

const trimQueryString = (value) => typeof value === 'string' ? value.trim() : ''

const parsePaginationValue = (value, defaultValue) => {
    if (value === undefined) return defaultValue

    const parsed = Number(value)

    return Number.isInteger(parsed) ? parsed : null
}

const getProductsQuery = (query = {}) => {
    const hasUnsupportedField = Object.keys(query).some(key => !PRODUCT_QUERY_FIELDS.includes(key))

    if (hasUnsupportedField) return null

    const limit = parsePaginationValue(query.limit, 30)
    const skip = parsePaginationValue(query.skip, 0)

    if (limit === null || skip === null || limit <= 0 || limit > 100 || skip < 0) {
        return null
    }

    return {
        search: trimQueryString(query.search),
        category: trimQueryString(query.category),
        brand: trimQueryString(query.brand),
        limit,
        skip,
    }
}

export const createProductsController = ({
    getAllProducts = getAllProductsModel,
    getProductById = getProductByIdModel,
} = {}) => {
    const getAllProductsController = async (req, res) => {
        const productsQuery = getProductsQuery(req.query)

        if (!productsQuery) {
            return res.status(400).json({ message: 'Invalid products query' })
        }

        try {
            const result = await getAllProducts(productsQuery)

            return res.status(200).json(result)
        } catch (error) {
            console.error('Get products error:', error)
            return res.status(500).json({ message: 'Failed to get products' })
        }
    }

    const getProductByIdController = async (req, res) => {
        const productId = typeof req.params.id === 'string' ? req.params.id.trim() : ''

        if (!ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product id' })
        }

        try {
            const product = await getProductById(productId)

            if (!product) {
                return res.status(404).json({ message: 'Product not found' })
            }

            return res.status(200).json(product)
        } catch (error) {
            console.error('Get product error:', error)
            return res.status(500).json({ message: 'Failed to get product' })
        }
    }

    return {
        getAllProductsController,
        getProductByIdController,
    }
}

export const {
    getAllProductsController,
    getProductByIdController,
} = createProductsController()
