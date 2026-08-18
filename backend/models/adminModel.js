import { ObjectId } from 'mongodb'

import { getDb } from '../config/db.js'
import { toPublicProduct } from '../utils/productsDto.js'

const COLLECTION_NAME = 'products'

const getCollection = () => getDb().collection(COLLECTION_NAME)

const createSlug = (title) => title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || `product-${new ObjectId().toString()}`

const createSku = () => `SHOPBY-${new ObjectId().toString().slice(-8).toUpperCase()}`

const getProductIdFilter = (productId) => {
    if (!ObjectId.isValid(productId)) return null

    return { _id: new ObjectId(productId) }
}

export const createProductModel = async (productData) => {
    const now = new Date()
    const product = {
        slug: productData.slug || createSlug(productData.title),
        sku: productData.sku || createSku(),
        title: productData.title,
        description: productData.description,
        category: productData.category,
        brand: productData.brand,
        tags: productData.tags,
        price: productData.price,
        discountPercentage: productData.discountPercentage,
        stock: productData.stock,
        minimumOrderQuantity: productData.minimumOrderQuantity,
        rating: productData.rating,
        images: productData.images,
        thumbnail: productData.thumbnail,
        shippingInformation: productData.shippingInformation,
        warrantyInformation: productData.warrantyInformation,
        returnPolicy: productData.returnPolicy,
        status: productData.status,
        reviews: [],
        createdAt: now,
        updatedAt: now,
    }
    const result = await getCollection().insertOne(product)

    return toPublicProduct({ _id: result.insertedId, ...product })
}

export const updateProductModel = async (productId, updates) => {
    const filter = getProductIdFilter(productId)

    if (!filter) return null

    const productUpdates = { ...updates, updatedAt: new Date() }
    const product = await getCollection().findOneAndUpdate(
        filter,
        { $set: productUpdates },
        { returnDocument: 'after' }
    )

    return product ? toPublicProduct(product) : null
}

export const archiveProductModel = async (productId) => {
    const filter = getProductIdFilter(productId)

    if (!filter) return null

    const product = await getCollection().findOneAndUpdate(
        filter,
        {
            $set: {
                status: 'archived',
                updatedAt: new Date(),
            },
        },
        { returnDocument: 'after' }
    )

    return product ? toPublicProduct(product) : null
}
