import {
  DEFAULT_PRODUCT_IMAGE_URL,
  getProductIdFromShareKey,
  getProductShareImageUrl,
  getProductShareUrl,
  slugifyProductName,
} from './product-share-link';

describe('product share links', () => {
  const productId = 'c2b61e61-72e8-47a6-a2de-315627e2d71a';

  it('creates a readable slug from a product name', () => {
    expect(slugifyProductName('Lámpara de Mesa!!')).toBe('lampara-de-mesa');
  });

  it('keeps the product ID in the friendly share URL', () => {
    expect(getProductShareUrl('Lámpara de Mesa', productId)).toBe(
      `https://conlara.com.ar/productos/share/lampara-de-mesa-${productId}`,
    );
  });

  it('accepts both legacy IDs and friendly share keys', () => {
    expect(getProductIdFromShareKey(productId)).toBe(productId);
    expect(getProductIdFromShareKey(`lampara-de-mesa-${productId}`)).toBe(
      productId,
    );
    expect(getProductIdFromShareKey('producto-inexistente')).toBeNull();
  });

  it('uses the product image or a public default when it is missing', () => {
    expect(getProductShareImageUrl('https://images.example.com/product.jpg')).toBe(
      'https://images.example.com/product.jpg',
    );
    expect(getProductShareImageUrl('  ')).toBe(DEFAULT_PRODUCT_IMAGE_URL);
    expect(
      getProductShareImageUrl(
        'https://res.cloudinary.com/dvp0fdhyc/image/upload/v1742769896/cyi4pszz0ighbcdgpujw.jpg',
      ),
    ).toBe(DEFAULT_PRODUCT_IMAGE_URL);
  });
});
