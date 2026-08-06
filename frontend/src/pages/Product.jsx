import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import AddToCartBTN from '../features/cart/AddToCartBTN'

import {
    fetchProductByIdThunk,
    selectHasProductsError,
    selectIsProductLoadingById,
    selectProductById,
    selectProductsErrorMessage,
} from '../features/products/productsSlice'

const Product = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const productId = Number(id)

    const product = useSelector(state => selectProductById(state, productId))
    const isLoading = useSelector(state => selectIsProductLoadingById(state, productId))
    const hasError = useSelector(selectHasProductsError)
    const errorMessage = useSelector(selectProductsErrorMessage)

    const [imageSelection, setImageSelection] = useState({ productId: null, index: 0 })

    const images = product?.images?.length ? product.images : product?.thumbnail ? [product.thumbnail] : []
    const selectedImage = imageSelection.productId === productId ? imageSelection.index : 0
    const selectedProductImage = images[selectedImage]

    useEffect(() => {
        if (!Number.isNaN(productId)) {
            dispatch(fetchProductByIdThunk(productId))
        }
    }, [dispatch, productId])

    if (Number.isNaN(productId)) {
        return (
        <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Invalid product link</h2>
            <p className="mt-2 text-sm text-gray-500">This product URL is not valid.</p>
            <Link
            to="/"
            className="mt-6 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95"
            >
            Back to products
            </Link>
        </div>
        )
    }

    if (hasError) {
        return (
        <div className="mx-auto max-w-7xl px-4 py-8 text-center font-medium text-rose-600 sm:px-6 lg:px-8">
            Failed to fetch: {errorMessage}
        </div>
        )
    }

    if (isLoading || !product) {
        return (
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-gray-500 sm:px-6 lg:px-8">
            Loading the product...
        </div>
        )
    }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gray-500">
        <Link to="/" className="transition-colors hover:text-amber-600">
          Home
        </Link>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="truncate text-gray-900">{product.title}</span>
      </nav>
     

      <section className="grid grid-cols-1 gap-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:grid-cols-12 lg:gap-12 lg:p-6">
        <div className="flex flex-col-reverse gap-4 sm:flex-row lg:col-span-6">
          {images.length > 1 && (
            <div className="flex shrink-0 gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setImageSelection({ productId, index })}
                  className={`relative aspect-square w-16 overflow-hidden rounded-xl border bg-gray-50 transition-all ${
                    selectedImage === index
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-gray-100 hover:border-amber-600'
                  }`}
                  aria-label={`Show ${product.title} image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${product.title} view ${index + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
            {selectedProductImage ? (
              <img
                src={selectedProductImage}
                alt={product.title}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <span className="text-sm text-gray-400">No image</span>
            )}
            {product.discountPercentage > 0 && (
              <span className="absolute left-4 top-4 rounded-xl bg-amber-500 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                -{Math.round(product.discountPercentage)}%
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:col-span-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              {product.brand || 'No brand'}
            </span>
            {product.sku && <span className="text-xs text-gray-400">SKU: {product.sku}</span>}
          </div>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            {product.title}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
              Rating: {product.rating}
            </div>
            <span className="text-xs text-gray-500">
              {product.reviews?.length || 0} reviews
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-3xl font-black text-gray-900">${product.price}</span>
            <span
              className={`rounded-xl px-2 py-1 text-[11px] font-bold ${
                product.stock > 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of stock'}
            </span>
          </div>

          <div className="mt-6 border-y border-gray-100 py-6">
            <AddToCartBTN product={product} />
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <span className="block font-semibold text-gray-900">Shipping</span>
              <span className="mt-0.5 block text-gray-500">
                {product.shippingInformation || 'Shipping details unavailable'}
              </span>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <span className="block font-semibold text-gray-900">Warranty</span>
              <span className="mt-0.5 block text-gray-500">
                {product.warrantyInformation || 'Warranty details unavailable'}
              </span>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <span className="block font-semibold text-gray-900">Return Policy</span>
              <span className="mt-0.5 block text-gray-500">
                {product.returnPolicy || 'Return details unavailable'}
              </span>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <span className="block font-semibold text-gray-900">Minimum Order</span>
              <span className="mt-0.5 block text-gray-500">
                {product.minimumOrderQuantity || 1} item(s)
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-black tracking-tight text-gray-900">
          Customer Reviews ({product.reviews?.length || 0})
        </h2>

        {product.reviews?.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.reviews.map(review => (
              <article
                key={`${review.reviewerEmail}-${review.date}`}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-gray-900">
                    {review.reviewerName}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-amber-500">
                  Rating: {review.rating}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-gray-600">
                  &quot;{review.comment}&quot;
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No reviews for this product yet.</p>
        )}
      </section>
    </main>
  )
}

export default Product
