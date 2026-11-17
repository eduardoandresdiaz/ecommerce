const PRODUCT_ID_PATTERN =
  /(?:^|-)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export const DEFAULT_PRODUCT_IMAGE_URL =
  'https://via.placeholder.com/1200x630.png?text=Producto';

const LEGACY_DEFAULT_PRODUCT_IMAGE_URL =
  'https://res.cloudinary.com/dvp0fdhyc/image/upload/v1742769896/cyi4pszz0ighbcdgpujw.jpg';

export function slugifyProductName(name: string): string {
  const slug = (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'producto';
}

export function getProductIdFromShareKey(shareKey: string): string | null {
  return shareKey.match(PRODUCT_ID_PATTERN)?.[1] ?? null;
}

export function getProductShareUrl(name: string, id: string): string {
  return `https://conlara.com.ar/productos/share/${slugifyProductName(name)}-${id}`;
}

export function getProductShareImageUrl(
  imageUrl: string | null | undefined,
): string {
  const normalizedUrl = imageUrl?.trim();
  return !normalizedUrl || normalizedUrl === LEGACY_DEFAULT_PRODUCT_IMAGE_URL
    ? DEFAULT_PRODUCT_IMAGE_URL
    : normalizedUrl;
}
