export type ProductStatus = 'draft' | 'active' | 'archived'

export interface ProductReview {
  id: string
  userId?: string
  reviewerName: string
  reviewerEmail?: string
  rating: number
  comment: string
  date: string | Date
}

export interface Product {
  id: string
  externalId?: number
  slug: string
  sku: string
  title: string
  description: string
  category: string
  brand?: string
  tags: string[]
  price: number
  discountPercentage: number
  stock: number
  minimumOrderQuantity: number
  rating: number
  images: string[]
  thumbnail?: string
  shippingInformation?: string
  warrantyInformation?: string
  returnPolicy?: string
  status: ProductStatus
  reviews: ProductReview[]
  createdAt: string | Date
  updatedAt: string | Date
}

export interface ProductsResponse {
  products: Product[]
  total: number
  limit: number
  skip: number
}

export interface ProductsQuery {
  search?: string
  category?: string
  brand?: string
  limit?: number
  skip?: number
}

export type ProductsErrorType = 'network' | 'timeout' | 'server' | 'unknown'

export interface ProductsError {
  type: ProductsErrorType
  message: string
  status?: number
}
