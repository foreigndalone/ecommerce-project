import { ObjectId } from 'mongodb'

import {
    archiveProductModel,
    createProductModel,
    updateProductModel,
} from '../models/adminModel.js'

const PRODUCT_STATUSES = ['draft', 'active', 'archived']

const trimString = (value) => typeof value === 'string' ? value.trim() : undefined

const normalizeStringArray = (value) => (
    Array.isArray(value)
        ? value
            .map(item => trimString(item))
            .filter(Boolean)
        : []
)

const normalizeNumber = (value) => {
    if (value === undefined || value === '') return undefined

    const numberValue = Number(value)

    return Number.isFinite(numberValue) ? numberValue : null
}

const hasOwn = (data, key) => Object.prototype.hasOwnProperty.call(data, key)

const getProductData = (data = {}, { partial = false } = {}) => {
    const productData = {}

    const title = trimString(data.title)
    const description = trimString(data.description)
    const category = trimString(data.category)

    if (!partial || hasOwn(data, 'title')) {
        if (!title) return null
        productData.title = title
    }

    if (!partial || hasOwn(data, 'description')) {
        if (description === undefined) return null
        productData.description = description
    }

    if (!partial || hasOwn(data, 'category')) {
        if (!category) return null
        productData.category = category
    }

    const stringFields = [
        'slug',
        'sku',
        'brand',
        'thumbnail',
        'shippingInformation',
        'warrantyInformation',
        'returnPolicy',
    ]

    for (const field of stringFields) {
        if (hasOwn(data, field)) {
            productData[field] = trimString(data[field])
        }
    }

    for (const field of ['tags', 'images']) {
        if (!partial || hasOwn(data, field)) {
            productData[field] = normalizeStringArray(data[field])
        }
    }

    const numberFields = [
        'price',
        'discountPercentage',
        'stock',
        'minimumOrderQuantity',
        'rating',
    ]

    for (const field of numberFields) {
        if (!partial || hasOwn(data, field)) {
            const value = normalizeNumber(data[field])

            if (value === null || (!partial && value === undefined)) return null
            if (value !== undefined) productData[field] = value
        }
    }

    if (hasOwn(data, 'status')) {
        const status = trimString(data.status)

        if (!PRODUCT_STATUSES.includes(status)) return null
        productData.status = status
    } else if (!partial) {
        productData.status = 'active'
    }

    if (!partial) {
        productData.discountPercentage ??= 0
        productData.stock ??= 0
        productData.minimumOrderQuantity ??= 1
        productData.rating ??= 0
    }

    if (partial && Object.keys(productData).length === 0) {
        return null
    }

    return productData
}

const getProductId = (req) => {
    const productId = typeof req.params.id === 'string' ? req.params.id.trim() : ''

    return ObjectId.isValid(productId) ? productId : null
}

export const createAdminController = ({
    createProduct = createProductModel,
    updateProduct = updateProductModel,
    archiveProduct = archiveProductModel,
} = {}) => {
    const createProductController = async (req, res) => {
        const productData = getProductData(req.body)

        if (!productData) {
            return res.status(400).json({ message: 'Invalid product data' })
        }

        try {
            const product = await createProduct(productData)

            return res.status(201).json(product)
        } catch (error) {
            console.error('Create product error:', error)

            if (error?.code === 11000) {
                return res.status(409).json({ message: 'Product slug or sku already exists' })
            }

            return res.status(500).json({ message: 'Failed to create product' })
        }
    }

    const updateProductController = async (req, res) => {
        const productId = getProductId(req)

        if (!productId) {
            return res.status(400).json({ message: 'Invalid product id' })
        }

        const productData = getProductData(req.body, { partial: true })

        if (!productData) {
            return res.status(400).json({ message: 'Invalid product data' })
        }

        try {
            const product = await updateProduct(productId, productData)

            if (!product) {
                return res.status(404).json({ message: 'Product not found' })
            }

            return res.status(200).json(product)
        } catch (error) {
            console.error('Update product error:', error)

            if (error?.code === 11000) {
                return res.status(409).json({ message: 'Product slug or sku already exists' })
            }

            return res.status(500).json({ message: 'Failed to update product' })
        }
    }

    const archiveProductController = async (req, res) => {
        const productId = getProductId(req)

        if (!productId) {
            return res.status(400).json({ message: 'Invalid product id' })
        }

        try {
            const product = await archiveProduct(productId)

            if (!product) {
                return res.status(404).json({ message: 'Product not found' })
            }

            return res.status(200).json(product)
        } catch (error) {
            console.error('Archive product error:', error)
            return res.status(500).json({ message: 'Failed to archive product' })
        }
    }

    return {
        archiveProductController,
        createProductController,
        updateProductController,
    }
}

export const {
    archiveProductController,
    createProductController,
    updateProductController,
} = createAdminController()
