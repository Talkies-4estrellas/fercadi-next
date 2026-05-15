'use client';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from '@/styles/cart.module.css';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, clearCart, total, itemCount, isOpen, closeCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      closeCart();
      router.push('/login');
      return;
    }

    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: user.id, items: cart, total }),
    });

    if (res.ok) {
      clearCart();
      closeCart();
      router.push('/perfil');
    } else {
      alert('Error al procesar el pedido. Intenta de nuevo.');
    }
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
              {cart.map(item => (
                <li key={item.id} className={styles.item}>
                  {item.imagen && (
                    <img src={item.imagen} alt={item.nombre} className={styles.itemImg} />
                  )}
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.nombre}</span>
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
              ))}
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
