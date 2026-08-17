import assert from 'node:assert/strict'
import test from 'node:test'
import { ObjectId } from 'mongodb'

import {
    buildProductBulkOperations,
    normalizeDummyJsonProduct,
} from '../scripts/migrateProducts.js'

test('normalizeDummyJsonProduct allowlists and normalizes DummyJSON product fields', () => {
    const now = new Date('2026-08-16T00:00:00.000Z')
    const product = normalizeDummyJsonProduct({
        id: 1,
        slug: ' essence-mascara ',
        sku: ' SKU-1 ',
        title: ' Essence Mascara ',
        description: ' Mascara ',
        category: ' beauty ',
        brand: ' Essence ',
        tags: [' makeup ', '', null],
        price: '9.99',
        discountPercentage: '7.17',
        stock: '5',
        minimumOrderQuantity: undefined,
        rating: '4.9',
        reviews: [{
            reviewerName: ' Jane ',
            reviewerEmail: ' jane@example.com ',
            rating: '5',
            comment: ' Great ',
            date: '2026-08-15T10:00:00.000Z',
            ignored: 'field',
        }],
        ignoredExternalField: true,
    }, null, now)

    assert.deepEqual(Object.keys(product).sort(), [
        'brand',
        'category',
        'description',
        'discountPercentage',
        'externalId',
        'images',
        'minimumOrderQuantity',
        'price',
        'rating',
        'returnPolicy',
        'reviews',
        'shippingInformation',
        'sku',
        'slug',
        'status',
        'stock',
        'tags',
        'thumbnail',
        'title',
        'updatedAt',
        'warrantyInformation',
    ].sort())
    assert.equal(product.externalId, 1)
    assert.equal(product.status, 'active')
    assert.deepEqual(product.tags, ['makeup'])
    assert.deepEqual(product.images, [])
    assert.equal(product.minimumOrderQuantity, 1)
    assert.ok(product.reviews[0]._id instanceof ObjectId)
    assert.ok(product.reviews[0].date instanceof Date)
    assert.equal(product.reviews[0].reviewerName, 'Jane')
    assert.equal(product.reviews[0].reviewerEmail, 'jane@example.com')
    assert.equal(product.ignoredExternalField, undefined)
    assert.equal(product.reviews[0].ignored, undefined)
})

test('buildProductBulkOperations reuses matching existing review ids', () => {
    const now = new Date('2026-08-16T00:00:00.000Z')
    const existingReviewId = new ObjectId()
    const operations = buildProductBulkOperations(
        [{
            id: 1,
            slug: 'product-one',
            sku: 'SKU-1',
            title: 'Product One',
            reviews: [{
                reviewerName: 'Jane',
                reviewerEmail: 'jane@example.com',
                rating: 5,
                comment: 'Great',
                date: '2026-08-15T10:00:00.000Z',
            }],
        }],
        [{
            externalId: 1,
            reviews: [{
                _id: existingReviewId,
                reviewerName: 'Jane',
                reviewerEmail: 'jane@example.com',
                rating: 5,
                comment: 'Great',
                date: '2026-08-15T10:00:00.000Z',
            }],
        }],
        now
    )

    assert.equal(operations[0].updateOne.filter.externalId, 1)
    assert.equal(operations[0].updateOne.upsert, true)
    assert.equal(operations[0].updateOne.update.$set.reviews[0]._id, existingReviewId)
    assert.equal(operations[0].updateOne.update.$set.updatedAt, now)
    assert.deepEqual(operations[0].updateOne.update.$setOnInsert, { createdAt: now })
})
