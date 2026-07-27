import { useDispatch, useSelector } from 'react-redux'
import { selectSearchQuery, setSearchQuery } from './productsSlice'

const ProductFilter = () => {
    const dispatch = useDispatch()
    const searchQuery = useSelector(selectSearchQuery)

    const handleChange = (event) => {
        dispatch(setSearchQuery(event.target.value))
    }

    return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <input
            value={searchQuery}
            onChange={handleChange}
            type="search"
            placeholder="Search products"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 sm:max-w-sm"
        />
    </div>
  )
}

export default ProductFilter
