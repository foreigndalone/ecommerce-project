import { useDispatch, useSelector } from 'react-redux'
import {
    selectBrands,
    selectCategories,
    selectSearchQuery,
    selectSelectedBrand,
    selectSelectedCategory,
    setSearchQuery,
    setSelectedBrand,
    setSelectedCategory,
} from './productsSlice'

const ProductFilter = () => {
    const dispatch = useDispatch()
    const searchQuery = useSelector(selectSearchQuery)
    const selectedCategory = useSelector(selectSelectedCategory)
    const selectedBrand = useSelector(selectSelectedBrand)
    const categories = useSelector(selectCategories)
    const brands = useSelector(selectBrands)

    const handleSearchChange = (event) => {
        dispatch(setSearchQuery(event.target.value))
    }

    const handleCategoryChange = (event) => {
        dispatch(setSelectedCategory(event.target.value))
    }

    const handleBrandChange = (event) => {
        dispatch(setSelectedBrand(event.target.value))
    }

    return (
    <div className="mx-auto grid max-w-7xl gap-3 px-4 pt-8 sm:grid-cols-3 sm:px-6 lg:px-8">
        <input
            value={searchQuery}
            onChange={handleSearchChange}
            type="search"
            placeholder="Search products"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        />
        <select
            aria-label="Filter by category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        >
            <option value="">All categories</option>
            {categories.map(category => (
                <option key={category} value={category}>
                    {category}
                </option>
            ))}
        </select>
        <select
            aria-label="Filter by brand"
            value={selectedBrand}
            onChange={handleBrandChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        >
            <option value="">All brands</option>
            {brands.map(brand => (
                <option key={brand} value={brand}>
                    {brand}
                </option>
            ))}
        </select>
    </div>
  )
}

export default ProductFilter
