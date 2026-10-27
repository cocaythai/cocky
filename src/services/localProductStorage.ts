import { CowayProduct } from '../types/index.ts';

const STORAGE_KEY = 'coway_admin_products_v1';
const DELETED_KEY = 'coway_admin_deleted_ids_v1';

export class LocalProductStorage {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getOverrides(): Record<string, CowayProduct> {
    if (!this.isBrowser()) return {};
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('[LocalProductStorage] Read error:', e);
      return {};
    }
  }

  getDeletedIds(): string[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(DELETED_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('[LocalProductStorage] Read deleted error:', e);
      return [];
    }
  }

  saveProduct(product: CowayProduct): void {
    if (!this.isBrowser()) return;
    try {
      const overrides = this.getOverrides();
      const strId = String(product.id);
      overrides[strId] = { ...product, id: strId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));

      // Remove from deleted list if it was previously marked as deleted
      const deleted = this.getDeletedIds().filter((id) => id !== strId);
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
    } catch (e) {
      console.warn('[LocalProductStorage] Save error:', e);
    }
  }

  deleteProduct(id: string | number): void {
    if (!this.isBrowser()) return;
    try {
      const strId = String(id);
      const overrides = this.getOverrides();
      delete overrides[strId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));

      const deleted = this.getDeletedIds();
      if (!deleted.includes(strId)) {
        deleted.push(strId);
        localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
      }
    } catch (e) {
      console.warn('[LocalProductStorage] Delete error:', e);
    }
  }

  /**
   * Merges database products with locally stored overrides and additions.
   */
  applyToProducts(dbProducts: CowayProduct[]): CowayProduct[] {
    const overrides = this.getOverrides();
    const deletedIds = new Set(this.getDeletedIds());

    // 1. Filter out deleted products and apply overrides to existing ones
    const updated = dbProducts
      .filter((p) => !deletedIds.has(String(p.id)))
      .map((p) => {
        const override = overrides[String(p.id)];
        if (override) {
          const effectiveImages = (Array.isArray(override.images) && override.images.length > 0)
            ? override.images
            : (Array.isArray(p.images) && p.images.length > 0)
            ? p.images
            : [override.image || p.image].filter(Boolean);

          return {
            ...p,
            ...override,
            images: effectiveImages,
            // Keep original order unless explicitly overridden
            order: override.order !== undefined ? override.order : p.order,
          };
        }
        return p;
      });

    // 2. Append any newly added products from overrides that are not in dbProducts
    const existingIds = new Set(updated.map((p) => String(p.id)));
    for (const [id, prod] of Object.entries(overrides)) {
      if (!existingIds.has(id) && !deletedIds.has(id)) {
        updated.push(prod);
      }
    }

    // 3. Sort by order
    return updated.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  }
}

export const localProductStorage = new LocalProductStorage();
