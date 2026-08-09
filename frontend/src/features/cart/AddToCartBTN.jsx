import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import gsap from 'gsap'
import { ShoppingBag, Check } from 'lucide-react'


import { addToCart } from './cartSlice'


const AddToCartBTN = ({ product }) => {
    const dispatch = useDispatch()

  const [isAdded, setIsAdded] = useState(false)

  const buttonRef = useRef(null)
  const defaultContentRef = useRef(null)
  const addedContentRef = useRef(null)
  const checkIconRef = useRef(null)
  const resetTimeoutRef = useRef(null)

  const isOutOfStock = product?.stock <= 0

  const handleClick = (event) => {
    event.stopPropagation()

    if (!product?.id || isAdded || isOutOfStock) return

    dispatch(addToCart(product))
    setIsAdded(true)

    const tl = gsap.timeline()

    tl.to(buttonRef.current, {
      scale: 0.93,
      duration: 0.1,
      ease: 'power2.out',
    })
      .to(buttonRef.current, {
        scale: 1,
        duration: 0.15,
        ease: 'power2.inOut',
      })
      .to(
        defaultContentRef.current,
        {
          y: -20,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        },
        '-=0.1'
      )
      .fromTo(
        addedContentRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.25,
          ease: 'power2.out',
        }
      )
      .fromTo(
        checkIconRef.current,
        { scale: 0, rotate: -45 },
        {
          scale: 1,
          rotate: 0,
          duration: 0.35,
          ease: 'back.out(2)',
        },
        '-=0.15'
      )

    resetTimeoutRef.current = setTimeout(() => {
      const resetTl = gsap.timeline({
        onComplete: () => setIsAdded(false),
      })

      resetTl
        .to(addedContentRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        })
        .to(defaultContentRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.25,
          ease: 'power2.out',
        })
    }, 1500)
  }

  useEffect(() => {
    const animatedElements = [
      buttonRef.current,
      defaultContentRef.current,
      addedContentRef.current,
      checkIconRef.current,
    ]

    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
      }
      gsap.killTweensOf(animatedElements)
    }
  }, [])



  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={isOutOfStock}
      aria-label={isOutOfStock ? `${product.title} is out of stock` : `Add ${product.title} to cart`}
      className={`add-button ${isAdded ? 'added' : ''}`}
    >
      <div
        ref={defaultContentRef}
        className={`flex items-center gap-1.5 ${isAdded ? 'pointer-events-none' : ''}`}
      >
        <ShoppingBag className="h-4 w-4" />
        <span>{isOutOfStock ? 'Sold out' : 'Add'}</span>
      </div>

      <div
        ref={addedContentRef}
        className="absolute flex items-center gap-1.5 opacity-0"
      >
        <span ref={checkIconRef}>
          <Check className="h-4 w-4 stroke-[3]" />
        </span>
      </div>
    </button>
  )
}

export default AddToCartBTN
