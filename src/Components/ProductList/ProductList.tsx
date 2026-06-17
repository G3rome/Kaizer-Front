import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import type { Product } from '../../Model/Product';
import { useProducts } from '../../Hooks/useProducts';
import { useCart } from '../../Services/CartContext';

import './ProductList.css';

export default function ProductList() {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();

  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('default');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  const fallbackImage = '/images/innovacell-celulares.jpeg_1902800913.webp';

  const categories = useMemo(() => {
    const list = new Set<string>();
    products.forEach((p: any) => {
      const cat = p.category || p.categoria;
      if (cat) list.add(cat);
    });
    return ['Todos', ...Array.from(list)];
  }, [products]);

  const processedProducts = useMemo(() => {
    const result = products.filter((product: any) => {
      const cat = product.category || product.categoria;
      const name = product.name || product.nombre || '';
      const price = product.price || product.precio || 0;
      const stock = product.stock ?? 0;

      const matchesCategory = selectedCategory === 'Todos' || cat === selectedCategory;
      const matchesPrice = price <= maxPrice;
      const matchesStock = !onlyInStock || stock > 0;

      const matchesSearch =
        searchQuery === '' ||
        name.toLowerCase().includes(searchQuery) ||
        (cat ? cat.toLowerCase().includes(searchQuery) : false);

      return matchesCategory && matchesPrice && matchesStock && matchesSearch;
    });

    const sorted = [...result];
    if (sortBy === 'low-to-high') {
      sorted.sort((a: any, b: any) => (a.price || a.precio || 0) - (b.price || b.precio || 0));
    } else if (sortBy === 'high-to-low') {
      sorted.sort((a: any, b: any) => (b.price || b.precio || 0) - (a.price || a.precio || 0));
    }

    return sorted;
  }, [products, selectedCategory, maxPrice, sortBy, onlyInStock, searchQuery]);

  const outOfStock = useMemo(() => {
    const set = new Set<number>();
    for (const p of products) {
      if (p.id != null && (p.stock ?? 0) <= 0) set.add(p.id);
    }
    return set;
  }, [products]);

  if (loading) {
    return (
      <div className="kaizer-catalog-wrapper">
        <aside className="kaizer-sidebar kaizer-sidebar-skeleton">
          <div className="kaizer-skeleton-line kaizer-skeleton-title" />
          <div className="kaizer-skeleton-line" />
          <div className="kaizer-skeleton-line" />
        </aside>

        <main className="kaizer-main-content">
          <h2 className="kaizer-main-title">Nuestros productos</h2>

          <div className="kaizer-products-grid" aria-busy="true" aria-label="Cargando productos">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="kaizer-card kaizer-card-skeleton" key={i}>
                <div className="kaizer-skeleton kaizer-card-img-box" />
                <div className="kaizer-card-body">
                  <div className="kaizer-skeleton kaizer-skeleton-text" style={{ width: '80%' }} />
                  <div className="kaizer-skeleton kaizer-skeleton-text" style={{ width: '40%' }} />
                  <div className="kaizer-skeleton kaizer-skeleton-text" style={{ width: '55%' }} />
                </div>
                <div className="kaizer-card-footer">
                  <div className="kaizer-skeleton kaizer-skeleton-btn" />
                  <div className="kaizer-skeleton kaizer-skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kaizer-error-box">
        <h2>Hubo un problema al cargar los productos. Por favor, intenta de nuevo más tarde.</h2>
      </div>
    );
  }

  return (
    <div className="kaizer-catalog-wrapper">
      
      <aside className="kaizer-sidebar">
        <h4 className="kaizer-sidebar-title">Filtros Avanzados</h4>
        
        <div className="kaizer-filter-item">
          <label htmlFor="sort-select">Ordenar por:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="kaizer-select-input"
          >
            <option value="default">Recomendados</option>
            <option value="low-to-high">Precio: Menor a Mayor</option>
            <option value="high-to-low">Precio: Mayor a Menor</option>
          </select>
        </div>

        <div className="kaizer-filter-item">
          <label>
            Precio máximo: <span>S/ {maxPrice}</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="10000" 
            step="50"
            value={maxPrice} 
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="kaizer-range-input"
          />
        </div>

        <div className="kaizer-filter-item kaizer-toggle-item">
          <label htmlFor="stock-toggle">Solo productos en stock</label>
          <button
            id="stock-toggle"
            type="button"
            role="switch"
            aria-checked={onlyInStock}
            className={`kaizer-toggle ${onlyInStock ? 'is-on' : ''}`}
            onClick={() => setOnlyInStock((prev) => !prev)}
          >
            <span className="kaizer-toggle-knob" />
          </button>
        </div>
      </aside>

      <main className="kaizer-main-content">
        <h2 className="kaizer-main-title">Nuestros productos</h2>

        <div className="kaizer-chips-container">
          {categories.map((category) => (
            <button
              key={category}
              className={`kaizer-chip-btn ${selectedCategory === category ? 'is-active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {processedProducts.length === 0 ? (
          <div className="kaizer-empty-msg">
            No se encontraron productos con los filtros seleccionados.
          </div>
        ) : (
          <div className="kaizer-products-grid">
            {processedProducts.map((product: any) => {
              if (product.id == null) return null;

              const currentImg = product.imageUrl || product.image_url || fallbackImage;
              const currentName = product.name || product.nombre || 'Producto sin título';
              const currentPrice = product.price || product.precio || 0;

              return (
                <div className="kaizer-card" key={product.id}>
                  <div className="kaizer-card-img-box">
                    <img
                      src={currentImg}
                      alt={currentName}
                      className="kaizer-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </div>

                  <div className="kaizer-card-body">
                    <h5 className="kaizer-card-name">{currentName}</h5>
                    <p className="kaizer-card-price">S/ {currentPrice.toFixed(2)}</p>
                    <p className="kaizer-card-stock">
                      Stock: {product.stock ?? 0}
                    </p>
                  </div>
                  <div className="kaizer-card-footer">
                    <Link to={`/products/${product.id}`} className="kaizer-btn-details">
                      Detalles
                    </Link>
                    <button
                      className="kaizer-btn-cart"
                      disabled={outOfStock.has(product.id)}
                      onClick={() => {
                        addToCart(product as Product);
                        toast.success(`${currentName} añadido al carrito`);
                      }}
                    >
                       Añadir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}