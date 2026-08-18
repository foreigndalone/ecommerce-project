import assert from 'node:assert/strict'
import test from 'node:test'
import { ObjectId } from 'mongodb'

import { createAdminController } from '../controllers/adminController.js'

const createResponse = () => ({
    statusCode: null,
    body: null,
    status(code) {
        this.statusCode = code
        return this
    },
    json(body) {
        this.body = body
        return this
    },
})

const createProductBody = (overrides = {}) => ({
    title: ' Test Phone ',
    description: ' A useful phone ',
    category: ' smartphones ',
    brand: ' Test Brand ',
    tags: [' mobile ', ' tech '],
    price: '499',
    discountPercentage: '10',
    stock: '12',
    minimumOrderQuantity: '1',
    rating: '4.5',
    images: [' https://example.com/phone.png '],
    thumbnail: ' https://example.com/thumb.png ',
    shippingInformation: ' Ships tomorrow ',
    warrantyInformation: ' One year ',
    returnPolicy: ' 30 days ',
    ...overrides,
})

test('createProductController validates and allowlists product data before model call', async () => {
    const response = createResponse()
    let receivedProductData
    const product = { id: new ObjectId().toString(), title: 'Test Phone' }
    const { createProductController } = createAdminController({
        createProduct: async (productData) => {
            receivedProductData = productData
            return product
        },
    })

    await createProductController({
        body: {
            ...createProductBody(),
            $set: { status: 'archived' },
            externalId: 123,
            reviews: [{ comment: 'ignored' }],
        },
    }, response)

    assert.equal(response.statusCode, 201)
    assert.deepEqual(response.body, product)
    assert.deepEqual(receivedProductData, {
        title: 'Test Phone',
        description: 'A useful phone',
        category: 'smartphones',
        brand: 'Test Brand',
        tags: ['mobile', 'tech'],
        price: 499,
        discountPercentage: 10,
        stock: 12,
        minimumOrderQuantity: 1,
        rating: 4.5,
        images: ['https://example.com/phone.png'],
        thumbnail: 'https://example.com/thumb.png',
        shippingInformation: 'Ships tomorrow',
        warrantyInformation: 'One year',
        returnPolicy: '30 days',
        status: 'active',
    })
})

test('createProductController rejects invalid create body before model call', async () => {
    const invalidBodies = [
        {},
        createProductBody({ title: ' ' }),
        createProductBody({ category: '' }),
        createProductBody({ price: 'abc' }),
        createProductBody({ status: 'deleted' }),
    ]

    for (const body of invalidBodies) {
        const response = createResponse()
        let called = false
        const { createProductController } = createAdminController({
            createProduct: async () => {
                called = true
                return {}
            },
        })

        await createProductController({ body }, response)

        assert.equal(response.statusCode, 400)
        assert.deepEqual(response.body, { message: 'Invalid product data' })
        assert.equal(called, false)
    }
})

test('createProductController maps duplicate slug or sku to 409', async () => {
    const response = createResponse()
    const duplicateError = new Error('duplicate key')
    duplicateError.code = 11000
    const { createProductController } = createAdminController({
        createProduct: async () => {
            throw duplicateError
        },
    })

    await createProductController({ body: createProductBody() }, response)

    assert.equal(response.statusCode, 409)
    assert.deepEqual(response.body, { message: 'Product slug or sku already exists' })
})

test('createProductController maps unexpected model failure to 500', async () => {
    const response = createResponse()
    const { createProductController } = createAdminController({
        createProduct: async () => {
            throw new Error('database down')
        },
    })

    await createProductController({ body: createProductBody() }, response)

    assert.equal(response.statusCode, 500)
    assert.deepEqual(response.body, { message: 'Failed to create product' })
})

test('updateProductController validates id and partial updates before model call', async () => {
    const response = createResponse()
    const productId = new ObjectId().toString()
    let receivedProductId
    let receivedUpdates
    const product = { id: productId, title: 'Updated Phone' }
    const { updateProductController } = createAdminController({
        updateProduct: async (id, updates) => {
            receivedProductId = id
            receivedUpdates = updates
            return product
        },
    })

    await updateProductController({
        params: { id: productId },
        body: {
            title: ' Updated Phone ',
            price: '399',
            ignored: 'field',
        },
    }, response)

    assert.equal(response.statusCode, 200)
    assert.equal(receivedProductId, productId)
    assert.deepEqual(receivedUpdates, {
        title: 'Updated Phone',
        price: 399,
    })
    assert.deepEqual(response.body, product)
})

test('updateProductController rejects malformed id before model call', async () => {
    const response = createResponse()
    let called = false
    const { updateProductController } = createAdminController({
        updateProduct: async () => {
            called = true
            return {}
        },
    })

    await updateProductController({
        params: { id: 'not-a-valid-id' },
        body: { title: 'Phone' },
    }, response)

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.body, { message: 'Invalid product id' })
    assert.equal(called, false)
})

test('updateProductController rejects invalid or empty update before model call', async () => {
    const invalidBodies = [
        {},
        { ignored: 'field' },
        { title: '' },
        { price: 'abc' },
        { status: 'deleted' },
    ]

    for (const body of invalidBodies) {
        const response = createResponse()
        let called = false
        const { updateProductController } = createAdminController({
            updateProduct: async () => {
                called = true
                return {}
            },
        })

        await updateProductController({
            params: { id: new ObjectId().toString() },
            body,
        }, response)

        assert.equal(response.statusCode, 400)
        assert.deepEqual(response.body, { message: 'Invalid product data' })
        assert.equal(called, false)
    }
})

test('updateProductController returns 404 when product is missing', async () => {
    const response = createResponse()
    const { updateProductController } = createAdminController({
        updateProduct: async () => null,
    })

    await updateProductController({
        params: { id: new ObjectId().toString() },
        body: { title: 'Updated Phone' },
    }, response)

    assert.equal(response.statusCode, 404)
    assert.deepEqual(response.body, { message: 'Product not found' })
})

test('archiveProductController validates id and archives product', async () => {
    const response = createResponse()
    const productId = new ObjectId().toString()
    let receivedProductId
    const product = { id: productId, status: 'archived' }
    const { archiveProductController } = createAdminController({
        archiveProduct: async (id) => {
            receivedProductId = id
            return product
        },
    })

    await archiveProductController({ params: { id: productId } }, response)

    assert.equal(response.statusCode, 200)
    assert.equal(receivedProductId, productId)
    assert.deepEqual(response.body, product)
})

test('archiveProductController rejects malformed id before model call', async () => {
    const response = createResponse()
    let called = false
    const { archiveProductController } = createAdminController({
        archiveProduct: async () => {
            called = true
            return {}
        },
    })

    await archiveProductController({ params: { id: 'bad-id' } }, response)

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.body, { message: 'Invalid product id' })
    assert.equal(called, false)
})

test('archiveProductController returns 404 when product is missing', async () => {
    const response = createResponse()
    const { archiveProductController } = createAdminController({
        archiveProduct: async () => null,
    })

    await archiveProductController({ params: { id: new ObjectId().toString() } }, response)

    assert.equal(response.statusCode, 404)
    assert.deepEqual(response.body, { message: 'Product not found' })
})
