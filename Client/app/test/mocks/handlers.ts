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

  // Mock products endpoint
  http.get('http://localhost:5159/api/products', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Harbor Seal Model',
        price: 19.99,
        image: '/images/harbor-seal.jpg',
        shortDescription: 'Adorable harbor seal',
        longDescription: 'A detailed 3D model of a harbor seal',
        modelUrl: '/models/harbor-seal.glb',
        category: 'seals',
        subcategory: 'marine',
        tags: ['seals', 'marine', 'animals'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Sci-Fi Spacecraft',
        price: 29.99,
        image: '/images/spacecraft.jpg',
        shortDescription: 'Futuristic spacecraft model',
        longDescription: 'A detailed 3D model of a futuristic spacecraft',
        modelUrl: '/models/spacecraft.glb',
        category: 'sci-fi',
        subcategory: 'vehicles',
        tags: ['sci-fi', 'space', 'vehicle'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Pirate Ship',
        price: 39.99,
        image: '/images/pirate-ship.jpg',
        shortDescription: 'Classic pirate vessel',
        longDescription: 'A detailed 3D model of a classic pirate ship',
        modelUrl: '/models/pirate-ship.glb',
        category: 'pirates',
        subcategory: 'vehicles',
        tags: ['pirates', 'ship', 'vehicle'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Fantasy Dragon',
        price: 49.99,
        image: '/images/dragon.jpg',
        shortDescription: 'Majestic dragon creature',
        longDescription: 'A detailed 3D model of a fantasy dragon',
        modelUrl: '/models/dragon.glb',
        category: 'fantasy',
        subcategory: 'creatures',
        tags: ['fantasy', 'dragon', 'creature'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),
];
