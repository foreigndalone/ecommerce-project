import type { Product } from '../types/products'

export const createTestProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '64f000000000000000000001',
  slug: 'test-product',
  sku: 'TEST-001',
  title: 'Test Product',
  description: 'Test product description',
  category: 'test',
  brand: 'Test Brand',
  tags: [],
  price: 100,
  discountPercentage: 0,
  stock: 10,
  minimumOrderQuantity: 1,
  rating: 4.5,
  images: [],
  thumbnail: '',
  status: 'active',
  reviews: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})
