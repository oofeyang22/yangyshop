import {z} from 'zod'
import { TypeOf } from 'zod/v3';

export type ProductType = {
  id: string | number;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
};

export type ProductsType = ProductType[];

export type CartItemType = ProductType & {
    quantity: number,
     selectedSize: string,
     selectedColor: string,
}

export type CartItemsType = CartItemType[];

// Just create a TypeScript type without Zod
export type ShippingFormData = {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone?: string;
  saveAddress: boolean;
};


export const shippingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1,"Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().min(7, "Phone No between 7 and 11 digits").max(10, "It must be between 7 and 11 digits").regex(/^\d+$/, "phone no must only contain numbers"),
});

export type ShippingFormInputs = z.infer<typeof shippingFormSchema>


export const paymentFormSchema = z.object({
  cardHolder: z.string().min(1, "Card holder is required"),
  cardNumber: z.string().min(16,"Card number is required").max(16,"Card number is required"),
  expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiration date must be in MM/YY format!"),
  cvv: z.string().min(3, "Cvv is required").max(3, "Cvv is required"),
});

export type paymentFormInputs = z.infer<typeof paymentFormSchema>

export type CartStoreStateType = {
  cart: CartItemsType,
    hasHydrated: boolean;
}

export type CartStoreActionsType = {
  addToCart: (product:CartItemType) => void,
  removeFromCart: (product:CartItemType) => void,
  clearCart: () => void,
}