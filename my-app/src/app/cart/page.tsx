

"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Trash2, Minus, Plus, Loader2 } from "lucide-react";
import Image from "next/image";

import PaymentForm from "@/components/PaymentForm";
import ShippingForm from "@/components/ShippingForm";
import useCartStore from "@/stores/cartStore";
import { CartItemType, ShippingFormInputs, paymentFormInputs } from "@/types";

const steps = [
  { id: 1, title: "Shopping Cart" },
  { id: 2, title: "Shipping Address" },
  { id: 3, title: "Payment Method" },
];


const CartContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, removeFromCart, updateQuantity, isLoading, syncError } = useCartStore();
  const [shippingForm, setShippingForm] = useState<ShippingFormInputs | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const activeStep = parseInt(searchParams.get("step") || "1");

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/cart');
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (syncError) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <div className="text-red-500 text-center">
          <p>Error syncing cart: {syncError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const updateItemQuantity = (item: CartItemType, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(item);
    } else {
      updateQuantity(item, newQuantity);
    }
  };

  const handlePlaceOrder = async (paymentData: paymentFormInputs) => {
    if (!shippingForm) {
      alert('Please fill in shipping information');
      return;
    }
    setPlacingOrder(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: shippingForm,
          paymentInfo: {
            method: 'card',
            cardLast4: paymentData.cardNumber.slice(-4),
          },
          discount: 0,
          shippingFee: 10,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to place order');
      router.push(`/order-confirmation?orderId=${data.order.orderId}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = 0;
  const shippingFee = subtotal > 100 ? 0 : 10;
  const total = subtotal - discount + shippingFee;

  return (
    <div className="flex flex-col gap-8 items-center justify-center mt-12">
      <h1 className="text-2xl font-medium">Your Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {steps.map((step) => (
          <div
            className={`flex items-center gap-2 border-b-2 pb-4 ${step.id === activeStep ? "border-gray-800" : "border-gray-200"}`}
            key={step.id}
          >
            <div className={`w-6 h-6 rounded-full text-white p-4 flex items-center justify-center ${step.id === activeStep ? "bg-gray-800" : "bg-gray-400"}`}>
              {step.id}
            </div>
            <p className={`text-sm font-medium ${step.id === activeStep ? "text-gray-800" : "text-gray-400"}`}>
              {step.title}
            </p>
          </div>
        ))}
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-16">
        <div className="w-full lg:w-7/12 shadow-lg border border-gray-100 p-8 rounded-lg flex flex-col gap-8">
          {activeStep === 1 ? (
            cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Your cart is empty</p>
                <button onClick={() => router.push('/products')} className="mt-4 px-6 py-2 bg-black text-white rounded-lg">
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" key={item.id + item.selectedSize + item.selectedColor}>
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
                      <Image src={item.images[item.selectedColor] || Object.values(item.images)[0]} alt={item.name} fill className="object-contain" />
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                        <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                      </div>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border rounded-lg">
                      <button onClick={() => updateItemQuantity(item, item.quantity - 1)} className="p-2 hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateItemQuantity(item, item.quantity + 1)} className="p-2 hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item)} className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-all duration-300 text-red-400 flex items-center justify-center">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : activeStep === 2 ? (
            <ShippingForm setShippingForm={setShippingForm} />
          ) : activeStep === 3 && shippingForm ? (
            <PaymentForm onSubmit={handlePlaceOrder} placingOrder={placingOrder} shippingData={shippingForm}/>
          ) : (
            <p className="text-sm text-gray-500">Please fill in the shipping form to continue.</p>
          )}
        </div>

        <div className="w-full lg:w-5/12 shadow-lg border border-gray-100 p-8 rounded-lg flex flex-col gap-8 h-max sticky top-24">
          <h2 className="font-semibold text-lg">Order Summary</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm"><p className="text-gray-500">Subtotal</p><p className="font-medium">${subtotal.toFixed(2)}</p></div>
            <div className="flex justify-between text-sm"><p className="text-gray-500">Discount</p><p className="font-medium">${discount.toFixed(2)}</p></div>
            <div className="flex justify-between text-sm"><p className="text-gray-500">Shipping Fee</p><p className="font-medium">{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</p></div>
            <hr className="border-gray-200" />
            <div className="flex justify-between"><p className="text-gray-800 font-semibold">Total</p><p className="font-medium text-lg">${total.toFixed(2)}</p></div>
          </div>
          {activeStep === 1 && cart.length > 0 && (
            <button onClick={() => router.push("/cart?step=2", { scroll: false })} className="w-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 text-white p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Export
export default function Cart() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    }>
      <CartContent />
    </Suspense>
  );
}