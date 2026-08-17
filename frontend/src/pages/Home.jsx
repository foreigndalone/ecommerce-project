import ProductFilter from '../features/products/ProductFilter'
import ProductList from '../features/products/ProductList'

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="home-title">
        <div className="shop-shell hero-grid">
          <div>
            <p className="hero-kicker">Shop the useful, skip the noise</p>
            <h1 className="hero-title" id="home-title">Find it.<br />Shop <span className="by">by</span> you.</h1>
            <p className="hero-copy">Everyday essentials, smart upgrades, and small discoveries—all in one clear, quick-to-shop place.</p>
          </div>
          <p className="hero-note"><strong>Start with what matters.</strong>Search by name, narrow by category, or pick a brand. Your route through the shop stays yours.</p>
        </div>
      </section>
      <ProductFilter />
      <ProductList />
    </>
  )
}
