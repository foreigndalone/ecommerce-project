import { ObjectId } from 'mongodb'

import { closeDB, connectDB, getDb } from '../config/db.js'

const COLLECTION_NAME = 'products'
const DUMMYJSON_PRODUCTS_URL = 'https://dummyjson.com/products'
const DUMMYJSON_PAGE_LIMIT = 100

const getCollection = () => getDb().collection(COLLECTION_NAME)

const trimString = (value) => typeof value === 'string' ? value.trim() : undefined

const normalizeStringArray = (value) =>
    Array.isArray(value)
        ? value
            .map(item => trimString(item))
            .filter(Boolean)
        : []

const normalizeNumber = (value, fallback = 0) =>
    Number.isFinite(Number(value)) ? Number(value) : fallback

const createReviewKey = (review) => [
    trimString(review?.reviewerEmail) || '',
    trimString(review?.reviewerName) || '',
    trimString(review?.comment) || '',
    normalizeNumber(review?.rating),
    trimString(review?.date) || '',
].join('|')

const getExistingReviewIdByKey = (existingProduct) => {
    const reviews = Array.isArray(existingProduct?.reviews) ? existingProduct.reviews : []

    return new Map(reviews.map(review => [
        createReviewKey(review),
        review._id,
    ]))
}

export const normalizeDummyJsonProduct = (product, existingProduct = null, now = new Date()) => {
    const existingReviewIdByKey = getExistingReviewIdByKey(existingProduct)
    const reviews = Array.isArray(product?.reviews) ? product.reviews : []

    return {
        externalId: normalizeNumber(product?.id),
        slug: trimString(product?.slug) || `product-${normalizeNumber(product?.id)}`,
        sku: trimString(product?.sku) || `dummyjson-${normalizeNumber(product?.id)}`,
        title: trimString(product?.title) || 'Untitled product',
        description: trimString(product?.description) || '',
        category: trimString(product?.category) || 'uncategorized',
        brand: trimString(product?.brand),
        tags: normalizeStringArray(product?.tags),
        price: normalizeNumber(product?.price),
        discountPercentage: normalizeNumber(product?.discountPercentage),
        stock: normalizeNumber(product?.stock),
        minimumOrderQuantity: normalizeNumber(product?.minimumOrderQuantity, 1),
        rating: normalizeNumber(product?.rating),
        images: normalizeStringArray(product?.images),
        thumbnail: trimString(product?.thumbnail),
        shippingInformation: trimString(product?.shippingInformation),
        warrantyInformation: trimString(product?.warrantyInformation),
        returnPolicy: trimString(product?.returnPolicy),
        status: 'active',
        reviews: reviews.map(review => {
            const reviewKey = createReviewKey(review)
            const existingReviewId = existingReviewIdByKey.get(reviewKey)

            return {
                _id: ObjectId.isValid(existingReviewId) ? existingReviewId : new ObjectId(),
                reviewerName: trimString(review?.reviewerName) || 'Anonymous',
                reviewerEmail: trimString(review?.reviewerEmail),
                rating: normalizeNumber(review?.rating),
                comment: trimString(review?.comment) || '',
                date: new Date(review?.date),
            }
        }),
        updatedAt: now,
    }
}

export const buildProductBulkOperations = (products, existingProducts = [], now = new Date()) => {
    const existingByExternalId = new Map(existingProducts.map(product => [
        product.externalId,
        product,
    ]))

    return products.map(product => {
        const normalizedProduct = normalizeDummyJsonProduct(
            product,
            existingByExternalId.get(normalizeNumber(product?.id)),
            now
        )

        return {
            updateOne: {
                filter: { externalId: normalizedProduct.externalId },
                update: {
                    $set: normalizedProduct,
                    $setOnInsert: { createdAt: now },
                },
                upsert: true,
            },
        }
    })
}

const fetchProductsPage = async ({ limit, skip }) => {
    const params = new URLSearchParams({
        limit: String(limit),
        skip: String(skip),
    })
    const response = await fetch(`${DUMMYJSON_PRODUCTS_URL}?${params.toString()}`)

    if (!response.ok) {
        throw new Error(`DummyJSON request failed: ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data.products)) {
        throw new Error('DummyJSON response does not include products array')
    }

    return data
}

export const fetchAllDummyJsonProducts = async () => {
    const products = []
    let skip = 0
    let total = null

    do {
        const data = await fetchProductsPage({ limit: DUMMYJSON_PAGE_LIMIT, skip })
        products.push(...data.products)
        total = Number.isFinite(Number(data.total)) ? Number(data.total) : products.length
        skip += DUMMYJSON_PAGE_LIMIT
    } while (products.length < total)

    return products
}

export const getDuplicateValues = async (collection, field, match = {}) => (
    collection.aggregate([
        { $match: match },
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
    ]).toArray()
)

export const assertNoUniqueIndexConflicts = async (collection) => {
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
        throw new Error(`Unique index conflicts found: ${conflicts.join(', ')}`)
    }
}

export const ensureProductMigrationIndexes = async (collection) => {
    await assertNoUniqueIndexConflicts(collection)

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

export const migrateProducts = async () => {
    const collection = getCollection()
    const stats = {
        received: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
    }

    await ensureProductMigrationIndexes(collection)

    const products = await fetchAllDummyJsonProducts()
    stats.received = products.length

    if (!products.length) {
        stats.skipped = 1
        return stats
    }

    const externalIds = products.map(product => normalizeNumber(product?.id))
    const existingProducts = await collection
        .find({ externalId: { $in: externalIds } })
        .toArray()
    const operations = buildProductBulkOperations(products, existingProducts)
    const result = await collection.bulkWrite(operations, { ordered: false })

    stats.inserted = result.upsertedCount || 0
    stats.updated = result.modifiedCount || 0

    return stats
}

const run = async () => {
    try {
        await connectDB()
        const stats = await migrateProducts()

        console.table(stats)
    } catch (error) {
        console.error(error.message)
        process.exitCode = 1
    } finally {
        await closeDB()
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    run()
}
