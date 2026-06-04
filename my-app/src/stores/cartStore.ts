
import { CartStoreActionsType, CartStoreStateType, CartItemType } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ExtendedCartStore extends CartStoreStateType, CartStoreActionsType {
  syncCart: () => Promise<void>;
  updateQuantity: (product: CartItemType, newQuantity: number) => Promise<void>;
  isLoading: boolean;
  syncError: string | null;
}

const useCartStore = create<ExtendedCartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      hasHydrated: false,
      isLoading: false,
      syncError: null,

      addToCart: async (product: CartItemType) => {
        // Optimistically update local cart
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (p) =>
              p.id === product.id &&
              p.selectedSize === product.selectedSize &&
              p.selectedColor === product.selectedColor
          );

          let updatedCart;
          if (existingIndex !== -1) {
            updatedCart = [...state.cart];
            updatedCart[existingIndex].quantity += product.quantity || 1;
          } else {
            updatedCart = [
              ...state.cart,
              {
                ...product,
                quantity: product.quantity || 1,
              },
            ];
          }
          return { cart: updatedCart };
        });

        // Sync with backend
        try {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: product.id,
              quantity: product.quantity || 1,
              selectedSize: product.selectedSize,
              selectedColor: product.selectedColor,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to sync cart');
          }
        } catch (error) {
          console.error('Error syncing cart:', error);
          set({ syncError: 'Failed to sync cart with server' });
        }
      },

      removeFromCart: async (product: CartItemType) => {
        // Optimistically update local cart
        set((state) => ({
          cart: state.cart.filter(
            (p) =>
              !(p.id === product.id &&
                p.selectedSize === product.selectedSize &&
                p.selectedColor === product.selectedColor)
          ),
        }));

        // Sync with backend
        try {
          const response = await fetch('/api/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: product.id,
              selectedSize: product.selectedSize,
              selectedColor: product.selectedColor,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to sync cart removal');
          }
        } catch (error) {
          console.error('Error syncing cart removal:', error);
          set({ syncError: 'Failed to sync cart removal with server' });
        }
      },

      updateQuantity: async (product: CartItemType, newQuantity: number) => {
        set((state) => ({
          cart: state.cart.map((p) =>
            p.id === product.id &&
            p.selectedSize === product.selectedSize &&
            p.selectedColor === product.selectedColor
              ? { ...p, quantity: newQuantity }
              : p
          ),
        }));

        // Sync with backend
        try {
          const response = await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: product.id,
              selectedSize: product.selectedSize,
              selectedColor: product.selectedColor,
              quantity: newQuantity,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update cart quantity');
          }
        } catch (error) {
          console.error('Error updating cart quantity:', error);
          set({ syncError: 'Failed to update cart quantity' });
        }
      },

      clearCart: async () => {
        set({ cart: [] });

        try {
          const response = await fetch('/api/cart', {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to clear cart');
          }
        } catch (error) {
          console.error('Error clearing cart:', error);
          set({ syncError: 'Failed to clear cart on server' });
        }
      },

      syncCart: async () => {
        set({ isLoading: true, syncError: null });
        try {
          const response = await fetch('/api/cart');
          if (!response.ok) {
            throw new Error('Failed to fetch cart');
          }
          const serverCart = await response.json();
          
          // Convert server cart format to local cart format
          const localCartItems = serverCart.items?.map((item: any) => ({
            id: item.productId,
            name: item.name,
            shortDescription: '',
            description: '',
            price: item.price,
            sizes: [],
            colors: [],
            images: { default: item.image },
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })) || [];
          
          set({ cart: localCartItems });
        } catch (error) {
          console.error('Error syncing cart from server:', error);
          set({ syncError: 'Failed to load cart from server' });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
          // Sync with backend after rehydration
          if (state.syncCart) {
            state.syncCart();
          }
        }
      },
    }
  )
);

export default useCartStore;