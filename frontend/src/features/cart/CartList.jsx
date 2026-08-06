import { useSelector, useDispatch } from 'react-redux'
import { selectCartItemsWithProducts } from './cartSlice'

import { removeFromCart } from './cartSlice'

const CartList = () => {
    const dispatch = useDispatch()
    const cartList = useSelector(selectCartItemsWithProducts)


    return (
        <div className="p-4">      
        <div className="flex flex-col gap-4">

            {cartList.length > 0 ? cartList.map(item => {
            const product = item.product
            const quantity = item.quantity

            const handleRemove = () => {
                dispatch(removeFromCart({id: product.id}))
            }

            return (
                <div key={product.id} className="flex items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    {product.images?.[0] && (
                    <img 
                        src={product.images[0]} 
                        alt={product.title} 
                        className="h-16 w-16 shrink-0 object-cover rounded-lg"
                    />
                    )}
                    <div className="min-w-0">
                    <h4 className="truncate font-semibold text-gray-900">{product.title}</h4>
                    <p className="text-sm text-gray-500">${product.price}</p>
                    </div>
                </div>

                    <div className="flex w-32 shrink-0 items-center justify-end gap-3 sm:w-36">
                        <span className="w-8 text-center text-sm font-medium text-gray-600">x{quantity}</span>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="w-20 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )
            }) : (
            <p className="text-sm text-gray-500 text-center">Cart is empty</p>
            )}
        </div>
        </div>
  )
}

export default CartList
