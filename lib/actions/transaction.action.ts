"use server";

import { redirect } from 'next/navigation'
import Stripe from "stripe";
import { handleError } from '../utils';
import { connectToDatabase } from '../database/mongoose';
import Transaction from '../database/models/transaction.model';
import { updateCredits } from './user.actions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  try {
    const amount = Number(transaction.amount) * 100;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: transaction.plan,
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        plan: transaction.plan,
        credits: transaction.credits.toString(), // Ensure it's a string
        buyerId: transaction.buyerId,
      },
      mode: 'payment',
      // Make sure these URLs are complete with protocol
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/?canceled=true`,
    });

    // Check if session.url exists before redirecting
    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    redirect(session.url);
  } catch (error) {
    console.error('Error in checkoutCredits:', error);
    handleError(error);
  }
}

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    // Create a new transaction with a buyerId
    const newTransaction = await Transaction.create({
      ...transaction, 
      buyer: transaction.buyerId
    });

    await updateCredits(transaction.buyerId, transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    console.error('Error in createTransaction:', error);
    handleError(error);
  }
}