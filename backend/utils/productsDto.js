const toReviewDto = (review = {}) => ({
    id: review._id?.toString(),
    userId: review.userId?.toString(),
    reviewerName: review.reviewerName,
    reviewerEmail: review.reviewerEmail,
    rating: review.rating,
    comment: review.comment,
    date: review.date,
})

export const toPublicProduct = (product = {}) => ({
    id: product._id?.toString(),
    externalId: product.externalId,
    slug: product.slug,
    sku: product.sku,
    title: product.title,
    description: product.description,
    category: product.category,
    brand: product.brand,
    tags: product.tags,
    price: product.price,
    discountPercentage: product.discountPercentage,
    stock: product.stock,
    minimumOrderQuantity: product.minimumOrderQuantity,
    rating: product.rating,
    images: product.images,
    thumbnail: product.thumbnail,
    shippingInformation: product.shippingInformation,
    warrantyInformation: product.warrantyInformation,
    returnPolicy: product.returnPolicy,
    status: product.status,
    reviews: Array.isArray(product.reviews)
        ? product.reviews.map(toReviewDto)
        : [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
})
