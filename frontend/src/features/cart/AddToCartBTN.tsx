import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useDispatch } from 'react-redux'
import gsap from 'gsap'
import { ShoppingBag, Check } from 'lucide-react'

import type { AppDispatch } from '../../app/store'
import type { Product } from '../../types/products'
import { addToCart } from './cartSlice'

interface AddToCartBTNProps {
  product: Product
}

const AddToCartBTN = ({ product }: AddToCartBTNProps) => {
    const dispatch = useDispatch<AppDispatch>()

  const [isAdded, setIsAdded] = useState(false)

  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const defaultContentRef = useRef<HTMLDivElement | null>(null)
  const addedContentRef = useRef<HTMLDivElement | null>(null)
  const checkIconRef = useRef<HTMLSpanElement | null>(null)
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isOutOfStock = product?.stock <= 0

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
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
