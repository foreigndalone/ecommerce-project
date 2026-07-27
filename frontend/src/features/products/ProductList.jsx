import {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductsThunk, selectFilteredProducts } from './productsSlice'
import ProductItem from './ProductItem'

const ProductList = () => {

    const dispatch = useDispatch()

    useEffect(()=>{
        dispatch(fetchProductsThunk())
    }, [dispatch])

    const products = useSelector(selectFilteredProducts)
    const hasError = useSelector(state=>state.productsReducer.hasError)
    const errorMessage = useSelector(state=>state.productsReducer.errorMessage)
    const isLoading = useSelector(state=>state.productsReducer.isLoading)

    if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-center text-gray-500">
        Loading the products...
      </div>
    )
  }

    if (hasError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-center text-rose-600 font-medium">
        Failed to fetch: {errorMessage}
      </div>
    )
  }


  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Заголовок секции */}
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          Our products
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Choose the best for YourSelf; Choose what you want!
        </p>
      </div>

      
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {products && products.length > 0 ? (
          products.map(product => (
            <ProductItem
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">Products are not found</p>
        )}
      </div>
    </section>
  )
}

export default ProductList
