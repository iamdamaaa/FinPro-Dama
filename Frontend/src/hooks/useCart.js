import { useState, useMemo } from 'react';

export function useCart() {
  const [cartState, setCartState] = useState({
    duration: null,
    items: [],
  });

  const setDuration = (days) => {
    setCartState({
      duration: days,
      items: [], // reset items jika durasi berubah
    });
  };

  const addItem = (service, duration) => {
    const priceKey = `price_${duration}day`;
    const price = service[priceKey];

    // Jika price null/undefined, tidak bisa ditambahkan
    if (price === null || price === undefined) {
      return false;
    }

    setCartState((prev) => {
      const existingItemIndex = prev.items.findIndex(
        (item) => item.service_id === service.id
      );

      if (existingItemIndex >= 0) {
        const newItems = [...prev.items];
        newItems[existingItemIndex].quantity += 1;
        return { ...prev, items: newItems };
      }

      const newItem = {
        service_id: service.id,
        name: service.name,
        price: Number(price),
        quantity: 1,
      };

      return { ...prev, items: [...prev.items, newItem] };
    });

    return true;
  };

  const removeItem = (service_id) => {
    setCartState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.service_id !== service_id),
    }));
  };

  const updateQty = (service_id, qty) => {
    if (qty <= 0) {
      removeItem(service_id);
      return;
    }

    setCartState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.service_id === service_id ? { ...item, quantity: qty } : item
      ),
    }));
  };

  const clearCart = () => {
    setCartState({
      duration: null,
      items: [],
    });
  };

  const totalEstimasi = useMemo(() => {
    return cartState.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartState.items]);

  const totalItems = useMemo(() => {
    return cartState.items.reduce((total, item) => total + item.quantity, 0);
  }, [cartState.items]);

  return {
    ...cartState,
    setDuration,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    totalEstimasi,
    totalItems,
  };
}
