import AddToCartBTN from '../cart/AddToCartBTN'

const ProductItem = ({product}) => {
    const {title, images, description, price, rating, stock} = product
    const image = images?.[0]


  return (
    <div className='group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md'>
      
      <div className='aspect-square w-full overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center'>
        
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
            No image
          </div>
        )}

      </div>

      <div className='mt-4 flex flex-col flex-grow'>
        <div className='flex items-start justify-between gap-2'>
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
            {title}
          </h3>
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
            ⭐ {rating}
          </div>
        </div>

        <p className="mt-1 text-xs text-gray-500 line-clamp-2 flex-grow">
          {/* Description */}
          {description}
        </p>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50">

          <span className="text-lg font-black text-gray-900">${price}</span>
          
          {/* Status */}
          <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${
            stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {stock > 0 ? `Stock: ${stock}` : 'Нет в наличии'}
          </span>

          <AddToCartBTN product={product}/>

        </div>
      </div>
    </div>
  )
}

export default ProductItem
