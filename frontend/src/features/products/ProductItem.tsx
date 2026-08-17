import { Link } from 'react-router-dom'
import LikeBTN from '../../components/LikeBTN'
import AddToCartBTN from '../cart/AddToCartBTN'
import type { Product } from '../../types/products'

interface ProductItemProps {
  product: Product
}

const ProductItem = ({product}: ProductItemProps) => {
    const {title, images, description, price, rating, stock, category} = product
    const image = images?.[0]

  return (
    <article className="product-card">
      <div className="favorite-slot"><LikeBTN product={product} /></div>
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-media">
          <span className="product-rank">#{String(product.id).padStart(2, '0')}</span>
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="product-body">
          <div className="product-meta"><span>{category?.replaceAll('-', ' ')}</span><span>★ {rating}</span></div>
          <h3 className="product-title">{title}</h3>
          <p className="product-description">{description}</p>
        </div>
      </Link>
      <div className="product-buy">
        <div><span className="product-price">${price}</span><br /><span className={`stock ${stock > 0 ? '' : 'out'}`}>{stock > 0 ? `${stock} in stock` : 'Out of stock'}</span></div>
        <AddToCartBTN product={product}/>
      </div>
    </article>
  )
}

export default ProductItem
