import React from 'react'

const ProductItem = (props) => {
    const {title, images, description, price, rating, stock} = props
  return (
    <div className='group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md'>
      
      <div className='aspect-square w-full overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center'>
        
        <img src={images[0]} 
        alt={title} 
        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        
        />

      </div>

      <div className='mt-4 flex flex-col flex-grow'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
            {title}
          </h3>
          {/* Рейтинг */}
          <div className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
            ⭐ {rating}
          </div>
        </div>

        <p className="mt-1 text-xs text-gray-500 line-clamp-2 flex-grow">
          {description}
        </p>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50">

          <span className="text-lg font-black text-gray-900">${price}</span>
          
          {/* Статус наличия на складе */}
          <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${
            stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {stock > 0 ? `В наличии: ${stock}` : 'Нет в наличии'}
          </span>

        </div>
      </div>
    </div>
  )
}

export default ProductItem