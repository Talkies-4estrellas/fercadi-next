'use client';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { resolverImagenProducto } from '@/lib/imagen';
import styles from '@/styles/cart.module.css';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, clearCart, total, itemCount, isOpen, closeCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    if (!user) {
      router.push('/login?next=/checkout');
      return;
    }
    router.push('/checkout');
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={closeCart}
      />

      <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`} aria-label="Carrito de compras">
        <div className={styles.drawerHeader}>
          <h3 className={styles.drawerTitle}>
            <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
            Carrito
            {itemCount > 0 && <span className={styles.countBadge}>{itemCount}</span>}
          </h3>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Cerrar carrito">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {cart.length === 0 ? (
            <div className={styles.empty}>
              <i className="fa-solid fa-bag-shopping" style={{ fontSize: '2.5rem' }} aria-hidden="true" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {cart.map(item => {
                const img = resolverImagenProducto(item.imagen);
                return (
                <li key={item.id} className={styles.item}>
                  {img && (
                    <div className={styles.itemImg} style={{ position: 'relative' }}>
                      <Image
                        src={img}
                        alt={item.nombre}
                        fill
                        sizes="60px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.nombre}</span>
                    {item.opciones && (
                      <span className={styles.itemOption}>{item.opciones}</span>
                    )}
                    <span className={styles.itemPrice}>
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.qtyControl}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      aria-label="Reducir cantidad"
                    >−</button>
                    <span className={styles.qtyNum}>{item.cantidad}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      aria-label="Aumentar cantidad"
                    >+</button>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    <i className="fa-solid fa-trash-can" aria-hidden="true" />
                  </button>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalAmount}>${total.toFixed(2)}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              <i className="fa-solid fa-credit-card" aria-hidden="true" />
              {user ? 'Finalizar compra' : 'Iniciar sesión para comprar'}
            </button>
            <button className={styles.clearBtn} onClick={clearCart}>
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
