import React, {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToFav, removeFromFav, fetchProductsThunk } from './productsSlice'
import ProductItem from './ProductItem'

const ProductList = () => {

    const dispatch = useDispatch()

    useEffect(()=>{
        dispatch(fetchProductsThunk())
    }, [])

    const products = useSelector(state=>state.productsReducer.products)
    const favs = useSelector(state=>state.productsReducer.favProducts)

  return (
    <div>
        <h1>Products List</h1>
        {products && products.map(product => (
        <ProductItem
        title={product.title} images={product.images} description = {product.description}
        price = {product.price} rating = {product.rating} stock = {product.stock}
        key={product.id}/>
      ))}
    </div>
  )
}

export default ProductList


