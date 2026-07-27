import { useSelector } from 'react-redux'

const CartList = () => {
  const cartList = useSelector(state => state.cartReducer.cart)

  return (
    <div className="p-4">      
      <div className="flex flex-col gap-4">

        {cartList.length > 0 ? cartList.map(item => {
          const product = item.product
          const quantity = item.quantity

          return (
            <div key={product.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
              <div className="flex items-center gap-4">
                {product.images?.[0] && (
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{product.title}</h4>
                  <p className="text-sm text-gray-500">${product.price}</p>
                </div>
              </div>

              <span className="text-sm font-medium text-gray-600">x{quantity}</span>
            </div>
          )
        }) : (
          <p className="text-sm text-gray-500">Cart is empty</p>
        )}
      </div>
    </div>
  )
}

export default CartList
