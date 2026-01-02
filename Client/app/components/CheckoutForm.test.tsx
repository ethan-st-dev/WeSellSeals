import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CheckoutForm from './CheckoutForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Mock Stripe
const stripePromise = loadStripe('pk_test_mock');

const mockStripe = {
  confirmPayment: vi.fn(),
};

const mockElements = {
  getElement: vi.fn(),
  submit: vi.fn(),
};

vi.mock('@stripe/react-stripe-js', async () => {
  const actual = await vi.importActual('@stripe/react-stripe-js');
  return {
    ...actual,
    useStripe: () => mockStripe,
    useElements: () => mockElements,
    PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
  };
});

describe('CheckoutForm', () => {
  let mockOnSuccess: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSuccess = vi.fn();
    vi.clearAllMocks();
  });

  it('renders payment form with Pay Now button', () => {
    render(
      <Elements stripe={stripePromise}>
        <CheckoutForm onSuccess={mockOnSuccess} />
      </Elements>
    );

    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pay now/i })).toBeInTheDocument();
    expect(screen.getByText(/your payment is secured by stripe/i)).toBeInTheDocument();
  });

  it('disables submit button when loading', async () => {
    const user = userEvent.setup();
    
    mockStripe.confirmPayment.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ paymentIntent: { status: 'succeeded', id: 'pi_test_success' } }), 100))
    );

    render(
      <Elements stripe={stripePromise}>
        <CheckoutForm onSuccess={mockOnSuccess} />
      </Elements>
    );

    const submitButton = screen.getByRole('button', { name: /pay now/i });
    await user.click(submitButton);

    expect(screen.getByText(/processing/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles successful payment', async () => {
    const user = userEvent.setup();
    
    mockStripe.confirmPayment.mockResolvedValue({
      paymentIntent: { status: 'succeeded', id: 'pi_test_success' },
    });

    render(
      <Elements stripe={stripePromise}>
        <CheckoutForm onSuccess={mockOnSuccess} />
      </Elements>
    );

    const submitButton = screen.getByRole('button', { name: /pay now/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays error message on payment failure', async () => {
    const user = userEvent.setup();
    
    mockStripe.confirmPayment.mockResolvedValue({
      error: {
        type: 'card_error',
        message: 'Your card was declined',
      },
    });

    render(
      <Elements stripe={stripePromise}>
        <CheckoutForm onSuccess={mockOnSuccess} />
      </Elements>
    );

    const submitButton = screen.getByRole('button', { name: /pay now/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/your card was declined/i)).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('handles backend confirmation failure', async () => {
    const user = userEvent.setup();
    
    mockStripe.confirmPayment.mockResolvedValue({
      paymentIntent: { status: 'succeeded', id: 'pi_test_fail' },
    });

    render(
      <Elements stripe={stripePromise}>
        <CheckoutForm onSuccess={mockOnSuccess} />
      </Elements>
    );

    const submitButton = screen.getByRole('button', { name: /pay now/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/payment succeeded but failed to record purchases/i)).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
