import { ObjectId } from 'mongodb'

import { getDb } from '../config/db.js'
import { toPublicProduct } from '../utils/productsDto.js'

const COLLECTION_NAME = 'products'
const DEFAULT_LIMIT = 30
const MAX_LIMIT = 100

const getCollection = () => getDb().collection(COLLECTION_NAME)

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getDuplicateValues = async (collection, field, match = {}) => (
    collection.aggregate([
        { $match: match },
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
    ]).toArray()
)

const assertNoProductsIndexConflicts = async (collection) => {
    const [externalIdConflicts, slugConflicts, skuConflicts] = await Promise.all([
        getDuplicateValues(collection, 'externalId', { externalId: { $type: 'number' } }),
        getDuplicateValues(collection, 'slug'),
        getDuplicateValues(collection, 'sku'),
    ])

    const conflicts = [
        ...externalIdConflicts.map(item => `externalId=${item._id}`),
        ...slugConflicts.map(item => `slug=${item._id}`),
        ...skuConflicts.map(item => `sku=${item._id}`),
    ]

    if (conflicts.length) {
        throw new Error(`Products unique index conflicts found: ${conflicts.join(', ')}`)
    }
}

export const ensureProductsIndexes = async () => {
    const collection = getCollection()

    await assertNoProductsIndexConflicts(collection)
    await collection.createIndex(
        { externalId: 1 },
        {
            unique: true,
            name: 'products_external_id_unique',
            partialFilterExpression: { externalId: { $type: 'number' } },
        }
    )
    await collection.createIndex({ slug: 1 }, { unique: true, name: 'products_slug_unique' })
    await collection.createIndex({ sku: 1 }, { unique: true, name: 'products_sku_unique' })
    await collection.createIndex({ status: 1, category: 1 }, { name: 'products_status_category' })
    await collection.createIndex({ status: 1, brand: 1 }, { name: 'products_status_brand' })
}

export const getAllProductsModel = async (options = {}) => {
    const limit = Math.min(
        Number.isInteger(options.limit) ? options.limit : DEFAULT_LIMIT,
        MAX_LIMIT
    )
    const skip = Number.isInteger(options.skip) ? options.skip : 0
    const filter = { status: 'active' }

    if (options.category) {
        filter.category = options.category
    }

    if (options.brand) {
        filter.brand = options.brand
    }

    if (options.search) {
        const search = new RegExp(escapeRegExp(options.search), 'i')

        filter.$or = [
            { title: search },
            { description: search },
            { tags: search },
        ]
    }

    const collection = getCollection()
    const [products, total] = await Promise.all([
        collection
            .find(filter)
            .sort({ title: 1 })
            .skip(skip)
            .limit(limit)
            .toArray(),
        collection.countDocuments(filter),
    ])

    return {
        products: products.map(toPublicProduct),
        total,
        limit,
        skip,
    }
}

export const getProductByIdModel = async (productId) => {
    if (!ObjectId.isValid(productId)) return null

    const product = await getCollection().findOne({
        _id: new ObjectId(productId),
        status: 'active',
    })

    return product ? toPublicProduct(product) : null
}
