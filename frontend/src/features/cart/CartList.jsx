import { useSelector, useDispatch } from 'react-redux'
import { selectCartItemsWithProducts } from './cartSlice'

import { removeFromCart } from './cartSlice'

const CartList = () => {
    const dispatch = useDispatch()
    const cartList = useSelector(selectCartItemsWithProducts)


    return (
        <div className="cart-list">

            {cartList.length > 0 ? cartList.map(item => {
            const product = item.product
            const quantity = item.quantity

            const handleRemove = () => {
                dispatch(removeFromCart({id: product.id}))
            }

            return (
                <article key={product.id} className="cart-row">
                <div className="cart-row-product">
                    {product.images?.[0] && (
                    <img 
                        src={product.images[0]} 
                        alt={product.title} 
                        className="cart-row-image"
                    />
                    )}
                    <div className="min-w-0">
                    <h3 className="cart-row-title">{product.title}</h3>
                    <p className="cart-row-price">${product.price} each</p>
                    </div>
                </div>

                    <div className="cart-row-actions">
                        <span className="cart-quantity" aria-label={`Quantity ${quantity}`}>×{quantity}</span>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="remove-button"
                        >
                            Remove
                        </button>
                    </div>
                </article>
            )
            }) : (
            <div className="cart-empty"><strong>Cart is empty</strong><p>Add something useful from the shop floor to get started.</p></div>
            )}
        </div>
  )
}

export default CartList
