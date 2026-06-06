/*
'use client';
import { paymentFormInputs, paymentFormSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  onSubmit: (data: paymentFormInputs) => Promise<void>;
  placingOrder: boolean;
}

const PaymentForm = ({ onSubmit, placingOrder }: PaymentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<paymentFormInputs>({
    resolver: zodResolver(paymentFormSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Holder Name
        </label>
        <input
          {...register('cardHolder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="John Doe"
        />
        {errors.cardHolder && (
          <p className="text-red-500 text-xs mt-1">{errors.cardHolder.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <input
          {...register('cardNumber')}
          type="text"
          maxLength={16}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="1234 5678 9012 3456"
        />
        {errors.cardNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiration Date
          </label>
          <input
            {...register('expirationDate')}
            placeholder="MM/YY"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          {errors.expirationDate && (
            <p className="text-red-500 text-xs mt-1">{errors.expirationDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <input
            {...register('cvv')}
            type="password"
            maxLength={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="123"
          />
          {errors.cvv && (
            <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={placingOrder}
        className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {placingOrder ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Place Order'
        )}
      </button>
    </form>
  );
};

export default PaymentForm;*/

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { paymentFormInputs, paymentFormSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  onSubmit: (data: paymentFormInputs) => Promise<void>;
  placingOrder: boolean;
  shippingData?: any;
}

// Stripe form component
const StripePaymentForm = ({ onSubmit, placingOrder, shippingData }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // First, create payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: shippingData,
          discount: 0,
          shippingFee: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          payment_method_data: {
            billing_details: {
              name: shippingData?.name || session?.user?.name,
              email: shippingData?.email || session?.user?.email,
            },
          },
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order in database
        const orderResponse = await fetch('/api/orders/create-from-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            paymentMethodId: paymentIntent.payment_method,
          }),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(orderData.error || 'Failed to create order');
        }

        // Redirect to order confirmation
        window.location.href = `/order-confirmation?orderId=${orderData.order.orderId}`;
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Handle 3D Secure
        //const { error: actionError } = await stripe.handleCardAction(paymentIntent.client_secret);
        const clientSecret = paymentIntent.client_secret;

        if (!clientSecret) {
          throw new Error("Missing client secret");
        }

         const { error: actionError }= await stripe.handleCardAction(clientSecret);
        if (actionError) {
          setError(actionError.message ?? "Payment authentication failed");
          setProcessing(false);
        }
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="space-y-3">
            <div className="border border-gray-300 rounded-md p-3 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Card Number</span>
              </div>
              <CardNumberElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-300 rounded-md p-3 bg-white">
                <span className="text-xs text-gray-500">Expiry Date</span>
                <CardExpiryElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                      },
                    },
                  }}
                />
              </div>
              <div className="border border-gray-300 rounded-md p-3 bg-white">
                <span className="text-xs text-gray-500">CVC</span>
                <CardCvcElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || placingOrder}
        className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {(processing || placingOrder) ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  );
};

// Wrapper component with Elements provider
const PaymentFormWrapper = (props: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.shippingData) {
      setLoading(true);
      // Create payment intent to get client secret
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: props.shippingData,
          discount: 0,
          shippingFee: 10,
        }),
      })
        .then(res => res.json())
        .then(data => {
          setClientSecret(data.clientSecret);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error creating payment intent:', err);
          setLoading(false);
        });
    }
  }, [props.shippingData]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-12 text-red-500">
        Unable to initialize payment. Please try again.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};

// Original Card Form (for compatibility)
const CardForm = ({ onSubmit, placingOrder }: PaymentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<paymentFormInputs>({
    resolver: zodResolver(paymentFormSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Holder Name
        </label>
        <input
          {...register('cardHolder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="John Doe"
        />
        {errors.cardHolder && (
          <p className="text-red-500 text-xs mt-1">{errors.cardHolder.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <input
          {...register('cardNumber')}
          type="text"
          maxLength={16}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="1234 5678 9012 3456"
        />
        {errors.cardNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiration Date
          </label>
          <input
            {...register('expirationDate')}
            placeholder="MM/YY"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          {errors.expirationDate && (
            <p className="text-red-500 text-xs mt-1">{errors.expirationDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <input
            {...register('cvv')}
            type="password"
            maxLength={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="123"
          />
          {errors.cvv && (
            <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={placingOrder}
        className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {placingOrder ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Place Order'
        )}
      </button>
    </form>
  );
};

// Export the main component (use Stripe version by default)
export default function PaymentForm(props: PaymentFormProps) {
  const [useStripe, setUseStripe] = useState(true);

  return (
    <div>
      <div className="mb-4 flex gap-4 border-b pb-4">
        <button
          onClick={() => setUseStripe(true)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            useStripe
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pay with Card (Stripe)
        </button>
        <button
          onClick={() => setUseStripe(false)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            !useStripe
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Test Payment (Simulated)
        </button>
      </div>
      
      {useStripe ? (
        <PaymentFormWrapper {...props} />
      ) : (
        <CardForm {...props} />
      )}
    </div>
  );
}