import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown } from 'lucide-react'
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

const controlClassName =
    'h-12 w-full rounded-xl border border-gray-100 bg-white px-4 text-sm font-medium text-gray-900 shadow-sm outline-none transition duration-200 placeholder:text-gray-400 hover:border-amber-50/60 hover:bg-amber-600 hover:font-bold focus:border-amber-500 focus:ring-2 focus:ring-amber-100'

const selectClassName = `${controlClassName} cursor-pointer appearance-none pr-11`

const SelectArrow = () => (
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-amber-600">
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
    </span>
)

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
            aria-label="Search products"
            placeholder="Search products"
            className={controlClassName}
        />
        <div className="relative">
            <select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className={selectClassName}
            >
                <option value="">All categories</option>
                {categories.map(category => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>
            <SelectArrow />
        </div>
        <div className="relative">
            <select
                aria-label="Filter by brand"
                value={selectedBrand}
                onChange={handleBrandChange}
                className={selectClassName}
            >
                <option value="">All brands</option>
                {brands.map(brand => (
                    <option key={brand} value={brand}>
                        {brand}
                    </option>
                ))}
            </select>
            <SelectArrow />
        </div>
    </div>
  )
}

export default ProductFilter
