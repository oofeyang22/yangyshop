import { paymentFormInputs, ShippingFormInputs, shippingFormSchema, paymentFormSchema } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

const PaymentForm = ({setShippingForm}:{setShippingForm:(data:paymentFormInputs) => void}) => {
    const {register, handleSubmit, formState: {errors}} = useForm<paymentFormInputs>({
        resolver: zodResolver(paymentFormSchema)
    })
    const router = useRouter()
    const handlePaymentForm:SubmitHandler<paymentFormInputs> = (data) => {
                setShippingForm(data)

    }
  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit(handlePaymentForm)}>
        <div className='flex flex-col gap-1'>
            <label htmlFor='cardHolder' className='text-xs text-gray-500 font-medium'>Name on Card</label>
            <input className="border-b border-gray-200 py-2 outline-none text-sm" type="text" id="cardHolder" placeholder="John Doe" {...register('cardHolder')}/>
            {errors.cardHolder && <p className='text-red-500 text-xs'>{errors.cardHolder.message}</p>}
        </div>
        <div className='flex flex-col gap-1'>
            <label htmlFor='cardNumber' className='text-xs text-gray-500 font-medium'>Card Number</label>
            <input className="border-b border-gray-200 py-2 outline-none text-sm" type="email" id="cardNumber" placeholder="65678" {...register('cardNumber')}/>
            {errors.cardNumber && <p className='text-red-500 text-xs'>{errors.cardNumber.message}</p>}
        </div>
        <div className='flex flex-col gap-1'>
            <label htmlFor='expirationDate' className='text-xs text-gray-500 font-medium'>Expiration Date</label>
            <input className="border-b border-gray-200 py-2 outline-none text-sm" type="text" id="expirationDate" placeholder="01/27" {...register('expirationDate')}/>
            {errors.expirationDate && <p className='text-red-500 text-xs'>{errors.expirationDate.message}</p>}
        </div>
        <div className='flex flex-col gap-1'>
            <label htmlFor='cvv' className='text-xs text-gray-500 font-medium'>Cvv</label>
            <input className="border-b border-gray-200 py-2 outline-none text-sm" type="text" id="cvv" placeholder="999" {...register('cvv')}/>
            {errors.cvv && <p className='text-red-500 text-xs'>{errors.cvv.message}</p>}
        </div>
        <div className='flex items-center gap-2 mt-4'>
          <Image src="/klarna.png" alt="card" width={50} height={25} className='rounded-md'/>
          <Image src="/cards.png" alt="card" width={50} height={25} className='rounded-md'/>
          <Image src="/stripe.png" alt="card" width={50} height={25} className='rounded-md'/>

        </div>
        <button 
        type="submit"
                        className='w-full bg-gray-800 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-800 transition-all duration-300'
        >
            Checkout
            <ShoppingCart className='w-3 h-3' />
        </button>
    </form>
  )
}

export default PaymentForm