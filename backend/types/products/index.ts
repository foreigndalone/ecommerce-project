import type { ObjectId } from 'mongodb'

export type ProductStatus = 'draft' | 'active' | 'archived'

export interface ProductReviewDocument {
  _id: ObjectId
  userId?: ObjectId
  reviewerName: string
  reviewerEmail?: string
  rating: number
  comment: string
  date: Date
}

export interface ProductDocument {
  _id: ObjectId
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
  reviews: ProductReviewDocument[]
  createdAt: Date
  updatedAt: Date
}

export interface PublicProductReview {
  id: string
  userId?: string
  reviewerName: string
  reviewerEmail?: string
  rating: number
  comment: string
  date: Date | string
}

export interface PublicProduct {
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
  reviews: PublicProductReview[]
  createdAt: Date | string
  updatedAt: Date | string
}
