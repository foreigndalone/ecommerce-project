import assert from 'node:assert/strict'
import test from 'node:test'
import { ObjectId } from 'mongodb'

import { createProductsController } from '../controllers/productsController.js'

const createResponse = () => {
    const response = {
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
    }

    return response
}

test('getAllProductsController returns products and normalized query', async () => {
    const response = createResponse()
    let receivedQuery
    const { getAllProductsController } = createProductsController({
        getAllProducts: async (query) => {
            receivedQuery = query
            return { products: [], total: 0, limit: query.limit, skip: query.skip }
        },
    })

    await getAllProductsController({
        query: {
            search: ' phone ',
            category: ' smartphones ',
            brand: ' Apple ',
            limit: '10',
            skip: '5',
        },
    }, response)

    assert.equal(response.statusCode, 200)
    assert.deepEqual(receivedQuery, {
        search: 'phone',
        category: 'smartphones',
        brand: 'Apple',
        limit: 10,
        skip: 5,
    })
    assert.deepEqual(response.body, { products: [], total: 0, limit: 10, skip: 5 })
})

test('getAllProductsController applies default limit and skip', async () => {
    const response = createResponse()
    let receivedQuery
    const { getAllProductsController } = createProductsController({
        getAllProducts: async (query) => {
            receivedQuery = query
            return { products: [], total: 0, limit: query.limit, skip: query.skip }
        },
    })

    await getAllProductsController({ query: {} }, response)

    assert.equal(response.statusCode, 200)
    assert.equal(receivedQuery.limit, 30)
    assert.equal(receivedQuery.skip, 0)
})

test('getAllProductsController rejects invalid query before model call', async () => {
    const invalidQueries = [
        { limit: '0' },
        { limit: '101' },
        { skip: '-1' },
        { limit: 'abc' },
        { skip: '1.5' },
        { $where: 'this.stock > 0' },
    ]

    for (const query of invalidQueries) {
        const response = createResponse()
        let called = false
        const { getAllProductsController } = createProductsController({
            getAllProducts: async () => {
                called = true
                return {}
            },
        })

        await getAllProductsController({ query }, response)

        assert.equal(response.statusCode, 400)
        assert.deepEqual(response.body, { message: 'Invalid products query' })
        assert.equal(called, false)
    }
})

test('getAllProductsController maps model failure to 500', async () => {
    const response = createResponse()
    const { getAllProductsController } = createProductsController({
        getAllProducts: async () => {
            throw new Error('database down')
        },
    })

    await getAllProductsController({ query: {} }, response)

    assert.equal(response.statusCode, 500)
    assert.deepEqual(response.body, { message: 'Failed to get products' })
})

test('getProductByIdController returns product for valid id', async () => {
    const response = createResponse()
    const productId = new ObjectId().toString()
    const product = { id: productId, title: 'Phone' }
    let receivedProductId
    const { getProductByIdController } = createProductsController({
        getProductById: async (id) => {
            receivedProductId = id
            return product
        },
    })

    await getProductByIdController({ params: { id: productId } }, response)

    assert.equal(response.statusCode, 200)
    assert.equal(receivedProductId, productId)
    assert.deepEqual(response.body, product)
})

test('getProductByIdController rejects malformed id before model call', async () => {
    const response = createResponse()
    let called = false
    const { getProductByIdController } = createProductsController({
        getProductById: async () => {
            called = true
            return {}
        },
    })

    await getProductByIdController({ params: { id: 'not-a-valid-id' } }, response)

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.body, { message: 'Invalid product id' })
    assert.equal(called, false)
})

test('getProductByIdController returns 404 for missing product', async () => {
    const response = createResponse()
    const { getProductByIdController } = createProductsController({
        getProductById: async () => null,
    })

    await getProductByIdController({ params: { id: new ObjectId().toString() } }, response)

    assert.equal(response.statusCode, 404)
    assert.deepEqual(response.body, { message: 'Product not found' })
})

test('getProductByIdController maps model failure to 500', async () => {
    const response = createResponse()
    const { getProductByIdController } = createProductsController({
        getProductById: async () => {
            throw new Error('database down')
        },
    })

    await getProductByIdController({ params: { id: new ObjectId().toString() } }, response)

    assert.equal(response.statusCode, 500)
    assert.deepEqual(response.body, { message: 'Failed to get product' })
})
