import React from 'react'

const ProductItem = (props) => {
    const {title, images, description, price, rating, stock} = props
  return (
    <div>
        <h1>{title}</h1>
        <img src={images[0]} alt="" width={96} height={96}/>
        <h4>{price}</h4> <h4>{rating}</h4> <h4>{stock}</h4>
        <p>{description}</p>

    </div>
  )
}

export default ProductItem