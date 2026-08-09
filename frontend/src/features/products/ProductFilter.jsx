import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, Search } from 'lucide-react'
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

const SelectArrow = () => (
    <span className="finder-icon">
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
    <section className="finder-wrap" aria-label="Find products">
      <div className="shop-shell finder">
        <label className="finder-field">
            <span className="finder-label">Search by name</span>
            <input value={searchQuery} onChange={handleSearchChange} type="search" placeholder="What are you looking for?" className="finder-control" />
            <Search className="finder-icon h-5 w-5" aria-hidden="true" />
        </label>
        <label className="finder-field">
            <span className="finder-label">Shop by category</span>
            <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="finder-control cursor-pointer appearance-none"
            >
                <option value="">All categories</option>
                {categories.map(category => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>
            <SelectArrow />
        </label>
        <label className="finder-field">
            <span className="finder-label">Shop by brand</span>
            <select
                value={selectedBrand}
                onChange={handleBrandChange}
                className="finder-control cursor-pointer appearance-none"
            >
                <option value="">All brands</option>
                {brands.map(brand => (
                    <option key={brand} value={brand}>
                        {brand}
                    </option>
                ))}
            </select>
            <SelectArrow />
        </label>
      </div>
    </section>
  )
}

export default ProductFilter
