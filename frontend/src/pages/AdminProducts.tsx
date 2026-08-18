import { useEffect, useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

import type { AppDispatch, RootState } from '../app/store'
import type { Product, ProductStatus } from '../types/products'
import {
  archiveAdminProductThunk,
  clearAdminProductsError,
  createAdminProductThunk,
  selectAdminProductsErrorMessage,
  selectHasAdminProductsError,
  selectIsArchivingAdminProductById,
  selectIsCreatingAdminProduct,
  selectIsUpdatingAdminProductById,
  updateAdminProductThunk,
  type AdminProductPayload,
} from '../features/adminProducts/adminProductsSlice'
import {
  fetchProductsThunk,
  selectHasProductsError,
  selectIsLoadingProducts,
  selectProducts,
  selectProductsErrorMessage,
} from '../features/products/productsSlice'
import {
  selectCurrentUser,
  selectIsSessionLoading,
  selectSessionStatus,
} from '../features/users/usersSlice'

interface ProductFormState {
  title: string
  description: string
  category: string
  brand: string
  tags: string
  price: string
  discountPercentage: string
  stock: string
  images: string
  thumbnail: string
  status: ProductStatus
}

const createEmptyFormState = (): ProductFormState => ({
  title: '',
  description: '',
  category: '',
  brand: '',
  tags: '',
  price: '',
  discountPercentage: '',
  stock: '',
  images: '',
  thumbnail: '',
  status: 'active',
})

const getFormStateFromProduct = (product: Product): ProductFormState => ({
  title: product.title,
  description: product.description,
  category: product.category,
  brand: product.brand ?? '',
  tags: product.tags.join(', '),
  price: String(product.price),
  discountPercentage: String(product.discountPercentage),
  stock: String(product.stock),
  images: product.images.join(', '),
  thumbnail: product.thumbnail ?? '',
  status: product.status,
})

const parseCommaSeparatedValues = (value: string): string[] =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

const parseOptionalNumber = (value: string): number | undefined => {
  const trimmedValue = value.trim()

  if (!trimmedValue) return undefined

  const numberValue = Number(trimmedValue)

  return Number.isFinite(numberValue) ? numberValue : undefined
}

const getAdminProductPayload = (formState: ProductFormState): AdminProductPayload => ({
  title: formState.title.trim(),
  description: formState.description.trim(),
  category: formState.category.trim(),
  brand: formState.brand.trim() || undefined,
  tags: parseCommaSeparatedValues(formState.tags),
  price: Number(formState.price),
  discountPercentage: parseOptionalNumber(formState.discountPercentage),
  stock: parseOptionalNumber(formState.stock),
  minimumOrderQuantity: 1,
  rating: 0,
  images: parseCommaSeparatedValues(formState.images),
  thumbnail: formState.thumbnail.trim() || undefined,
  status: formState.status,
})

const AdminProductRow = ({ product }: { product: Product }) => {
  const dispatch = useDispatch<AppDispatch>()
  const isUpdating = useSelector((state: RootState) =>
    selectIsUpdatingAdminProductById(state, product.id)
  )
  const isArchiving = useSelector((state: RootState) =>
    selectIsArchivingAdminProductById(state, product.id)
  )
  const [isEditing, setIsEditing] = useState(false)
  const [formState, setFormState] = useState<ProductFormState>(() =>
    getFormStateFromProduct(product)
  )

  const updateField = (field: keyof ProductFormState, value: string) => {
    setFormState(currentFormState => ({
      ...currentFormState,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await dispatch(updateAdminProductThunk({
      productId: product.id,
      updates: getAdminProductPayload(formState),
    })).unwrap()
    setIsEditing(false)
  }

  const handleArchive = async () => {
    const confirmed = window.confirm(`Archive ${product.title}?`)

    if (!confirmed) return

    await dispatch(archiveAdminProductThunk({ productId: product.id })).unwrap()
  }

  if (isEditing) {
    return (
      <article className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-3">
            <input className="form-input" value={formState.title} onChange={(event) => updateField('title', event.target.value)} required />
            <input className="form-input" value={formState.category} onChange={(event) => updateField('category', event.target.value)} required />
            <input className="form-input" value={formState.brand} onChange={(event) => updateField('brand', event.target.value)} placeholder="Brand" />
          </div>
          <textarea className="form-input min-h-24" value={formState.description} onChange={(event) => updateField('description', event.target.value)} required />
          <div className="grid gap-3 md:grid-cols-4">
            <input className="form-input" value={formState.price} onChange={(event) => updateField('price', event.target.value)} type="number" min="0" step="0.01" required />
            <input className="form-input" value={formState.stock} onChange={(event) => updateField('stock', event.target.value)} type="number" min="0" step="1" placeholder="Stock" />
            <input className="form-input" value={formState.discountPercentage} onChange={(event) => updateField('discountPercentage', event.target.value)} type="number" min="0" step="0.01" placeholder="Discount" />
            <select className="form-input" value={formState.status} onChange={(event) => updateField('status', event.target.value)}>
              <option value="active">active</option>
              <option value="draft">draft</option>
              <option value="archived">archived</option>
            </select>
          </div>
          <input className="form-input" value={formState.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="Tags, comma-separated" />
          <input className="form-input" value={formState.images} onChange={(event) => updateField('images', event.target.value)} placeholder="Image URLs, comma-separated" />
          <input className="form-input" value={formState.thumbnail} onChange={(event) => updateField('thumbnail', event.target.value)} placeholder="Thumbnail URL" />
          <div className="flex flex-wrap gap-2">
            <button className="primary-button" type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save changes'}
            </button>
            <button className="text-button" type="button" onClick={() => setIsEditing(false)} disabled={isUpdating}>
              Cancel
            </button>
          </div>
        </form>
      </article>
    )
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-600">{product.category}</p>
          <h2 className="text-lg font-black text-gray-900">{product.title}</h2>
          <p className="text-sm text-gray-500">{product.brand || 'No brand'} · ${product.price} · Stock: {product.stock}</p>
          <p className="mt-1 text-xs text-gray-400">Status: {product.status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:border-amber-500"
            type="button"
            onClick={() => {
              setFormState(getFormStateFromProduct(product))
              setIsEditing(true)
            }}
          >
            Edit
          </button>
          <button className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50" type="button" onClick={handleArchive} disabled={isArchiving}>
            {isArchiving ? 'Archiving...' : 'Archive'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function AdminProducts() {
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()
  const currentUser = useSelector(selectCurrentUser)
  const sessionStatus = useSelector(selectSessionStatus)
  const isSessionLoading = useSelector(selectIsSessionLoading)
  const products = useSelector(selectProducts)
  const isLoadingProducts = useSelector(selectIsLoadingProducts)
  const hasProductsError = useSelector(selectHasProductsError)
  const productsErrorMessage = useSelector(selectProductsErrorMessage)
  const isCreating = useSelector(selectIsCreatingAdminProduct)
  const hasAdminError = useSelector(selectHasAdminProductsError)
  const adminErrorMessage = useSelector(selectAdminProductsErrorMessage)
  const [formState, setFormState] = useState<ProductFormState>(() => createEmptyFormState())

  useEffect(() => {
    dispatch(fetchProductsThunk())
  }, [dispatch])

  useEffect(() => {
    return () => {
      dispatch(clearAdminProductsError())
    }
  }, [dispatch])

  const updateField = (field: keyof ProductFormState, value: string) => {
    setFormState(currentFormState => ({
      ...currentFormState,
      [field]: value,
    }))
  }

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await dispatch(createAdminProductThunk(getAdminProductPayload(formState))).unwrap()
    setFormState(createEmptyFormState())
  }

  if (isSessionLoading || sessionStatus === 'idle') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-center text-sm font-medium text-gray-500">
        Checking admin access...
      </div>
    )
  }

  if (!currentUser) {
    return (
      <Navigate
        to="/auth?mode=login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 text-center">
        <p className="section-kicker">Admin area</p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">Access denied</h1>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          Your account does not have permission to manage products.
        </p>
      </div>
    )
  }

  return (
    <div className="admin-products-page">
      <div className="shop-shell py-8">
        <header className="mb-8">
          <p className="section-kicker">Admin tools</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Admin Products</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Create, update, and archive catalog products. Public product listings only show active products.
          </p>
        </header>

        {(hasAdminError || hasProductsError) && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">
            {adminErrorMessage || productsErrorMessage || 'Something went wrong'}
          </div>
        )}

        <section className="mb-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm" aria-labelledby="create-product-title">
          <h2 id="create-product-title" className="text-xl font-black text-gray-900">Create product</h2>
          <form className="mt-5 grid gap-3" onSubmit={handleCreateProduct}>
            <div className="grid gap-3 md:grid-cols-3">
              <input className="form-input" value={formState.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Title" required />
              <input className="form-input" value={formState.category} onChange={(event) => updateField('category', event.target.value)} placeholder="Category" required />
              <input className="form-input" value={formState.brand} onChange={(event) => updateField('brand', event.target.value)} placeholder="Brand" />
            </div>
            <textarea className="form-input min-h-24" value={formState.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Description" required />
            <div className="grid gap-3 md:grid-cols-4">
              <input className="form-input" value={formState.price} onChange={(event) => updateField('price', event.target.value)} type="number" min="0" step="0.01" placeholder="Price" required />
              <input className="form-input" value={formState.stock} onChange={(event) => updateField('stock', event.target.value)} type="number" min="0" step="1" placeholder="Stock" />
              <input className="form-input" value={formState.discountPercentage} onChange={(event) => updateField('discountPercentage', event.target.value)} type="number" min="0" step="0.01" placeholder="Discount %" />
              <select className="form-input" value={formState.status} onChange={(event) => updateField('status', event.target.value)}>
                <option value="active">active</option>
                <option value="draft">draft</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <input className="form-input" value={formState.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="Tags, comma-separated" />
            <input className="form-input" value={formState.images} onChange={(event) => updateField('images', event.target.value)} placeholder="Image URLs, comma-separated" required />
            <input className="form-input" value={formState.thumbnail} onChange={(event) => updateField('thumbnail', event.target.value)} placeholder="Thumbnail URL" />
            <button className="primary-button w-fit" type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create product'}
            </button>
          </form>
        </section>

        <section aria-labelledby="products-admin-list-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="products-admin-list-title" className="text-xl font-black text-gray-900">Current active products</h2>
            <span className="text-sm font-semibold text-gray-500">{products.length} products</span>
          </div>
          {isLoadingProducts ? (
            <p className="text-sm text-gray-500">Loading products...</p>
          ) : (
            <div className="grid gap-3">
              {products.map(product => (
                <AdminProductRow key={product.id} product={product} />
              ))}
              {!products.length && (
                <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
                  No active products found.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
