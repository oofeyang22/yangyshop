import mongoose, { Schema, model, models } from 'mongoose';

export interface IProduct {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  images: Map<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    sizes: {
      type: [String],
      required: true,
    },
    colors: {
      type: [String],
      required: true,
    },
    images: {
      type: Map,
      of: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


ProductSchema.index({ id: 1 });
ProductSchema.index({ name: 'text' });

export interface IUser {
  id?: string;
  email: string;
  password?: string;
  name?: string;
  image?: string;
  provider: 'credentials' | 'google';
  providerId?: string;
  emailVerified?: Date;
  role: 'user' | 'admin';
  cart?: any[];
  orders?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      required: true,
      default: 'credentials',
    },
    providerId: {
      type: String,
      required: false,
    },
    emailVerified: {
      type: Date,
      required: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    cart: [
      {
        productId: Number,
        quantity: Number,
        selectedSize: String,
        selectedColor: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ provider: 1, providerId: 1 });

export interface ICartItem {
  productId: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  price: number;
  name: string;
  image: string;
}

export interface ICart {
  userId: string;
  items: ICartItem[];
  totalQuantity: number;
  totalPrice: number;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  selectedSize: {
    type: String,
    required: true,
  },
  selectedColor: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: [CartItemSchema],
    totalQuantity: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

// Update totals before saving
CartSchema.pre('save', async function() {
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

export interface IOrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  selectedSize: string;
  selectedColor: string;
  image: string;
}

export interface IShippingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone?: string;
}

export interface IPaymentInfo {
  method: 'card' | 'paypal' | 'cash';
  cardLast4?: string;
  status: 'pending' | 'paid' | 'failed';
}

export interface IOrder {
  orderId: string;
  userId: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentInfo: IPaymentInfo;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Number, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  selectedSize: { type: String, required: true },
  selectedColor: { type: String, required: true },
  image: { type: String, required: true },
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
  phone: { type: String },
});

const PaymentInfoSchema = new Schema<IPaymentInfo>({
  method: { type: String, enum: ['card', 'paypal', 'cash'], required: true },
  cardLast4: { type: String },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    items: [OrderItemSchema],
    shippingAddress: ShippingAddressSchema,
    paymentInfo: PaymentInfoSchema,
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 10 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ status: 1 });

export const Order = models.Order || model<IOrder>('Order', OrderSchema);

export const Cart = models.Cart || model<ICart>('Cart', CartSchema);
export const Product = models.Product || model<IProduct>('Product', ProductSchema);
export const User = models.User || model<IUser>('User', UserSchema);