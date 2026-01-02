import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock payment confirmation endpoint
  http.post('http://localhost:5159/api/payments/confirm-payment', async ({ request }) => {
    const body = await request.json() as { paymentIntentId: string };
    
    // Simulate successful payment confirmation
    if (body.paymentIntentId === 'pi_test_success') {
      return HttpResponse.json({ success: true }, { status: 200 });
    }
    
    // Simulate failed payment confirmation
    if (body.paymentIntentId === 'pi_test_fail') {
      return HttpResponse.json({ error: 'Payment confirmation failed' }, { status: 400 });
    }
    
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // Add more API endpoint mocks here as needed
  http.get('http://localhost:5159/api/seals', () => {
    return HttpResponse.json([
      { id: 1, name: 'Harbor Seal', price: 99.99 },
      { id: 2, name: 'Grey Seal', price: 149.99 },
    ]);
  }),
];
