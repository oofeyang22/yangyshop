'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

interface OrderDetails {
  orderId: string;
  total: number;
  createdAt: string;
}


function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error('Order not found');
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Order not found</p>
          <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You for Your Order!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your order has been successfully placed and will be processed shortly.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-500">Order Number</p>
          <p className="text-lg font-semibold text-gray-900 mb-2">{order.orderId}</p>
          
          <p className="text-sm text-gray-500 mt-4">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
          
          <p className="text-sm text-gray-500 mt-4">Order Date</p>
          <p className="text-gray-900">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href={`/orders/${order.orderId}`}
            className="block w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-900 transition-colors"
          >
            View Order Details
          </Link>
          
          <Link
            href="/products"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}


export default function OrderConfirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}