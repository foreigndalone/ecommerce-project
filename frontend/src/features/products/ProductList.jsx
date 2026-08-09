import {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchProductsThunk,
  selectFilteredProducts,
  selectHasProductsError,
  selectIsLoadingProducts,
  selectProductsErrorMessage,
} from './productsSlice'
import ProductItem from './ProductItem'

const ProductList = () => {

    const dispatch = useDispatch()

    useEffect(()=>{
        dispatch(fetchProductsThunk())
    }, [dispatch])

    const products = useSelector(selectFilteredProducts)
    const hasError = useSelector(selectHasProductsError)
    const errorMessage = useSelector(selectProductsErrorMessage)
    const isLoading = useSelector(selectIsLoadingProducts)

    if (isLoading) {
    return (
      <section className="shop-shell catalog" aria-busy="true" aria-label="Loading products">
        <p className="sr-only" role="status">Loading products</p>
        <div className="skeleton-grid">{Array.from({ length: 8 }, (_, index) => <div className="skeleton" key={index} />)}</div>
      </section>
    )
  }

    if (hasError) {
    return (
      <div className="shop-shell state-panel" role="alert">
        <strong>We couldn’t load the shop.</strong><br />Check your connection and refresh the page. {errorMessage}
      </div>
    )
  }


  return (
    <section className="shop-shell catalog" id="catalog">
      <div className="catalog-head">
        <div><p className="section-kicker">Ready to browse</p><h2 className="catalog-title">The shop floor</h2></div>
        <p className="result-count" aria-live="polite">{products?.length ?? 0} products shown</p>
      </div>
      <div className="product-grid">
        {products && products.length > 0 ? (
          products.map(product => (
            <ProductItem
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <div className="state-panel"><strong>No matches yet.</strong><br />Try a broader search or choose “All” in the filters.</div>
        )}
      </div>
    </section>
  )
}

export default ProductList
