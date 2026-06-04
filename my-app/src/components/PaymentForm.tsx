
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

export default PaymentForm;