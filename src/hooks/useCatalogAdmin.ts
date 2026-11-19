import type React from 'react';
import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ALL_SIZES, isProductActive } from '../constants';
import type { Product } from '../types';

export interface NewProductInput {
  name: string;
  badge: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  stock: Record<string, number>;
  active: boolean;
}

/** "Felpa Stile Z!" → "felpa-stile-z" */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** Aggiunta, visibilità ed eliminazione dei prodotti (sezione Catalogo del pannello admin). */
export function useCatalogAdmin(
  allProducts: Product[],
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
) {
  /** Senza Firebase (modalità offline) aggiorna solo lo stato locale. */
  const applyLocally = (next: Product[]) => {
    setAllProducts(next);
    setProducts(next.filter(isProductActive));
  };

  const makeUniqueId = (base: string) => {
    const root = 'hoodie-' + (slugify(base) || 'nuova');
    const taken = new Set(allProducts.map(p => p.id));
    let id = root;
    for (let n = 2; taken.has(id); n++) id = `${root}-${n}`;
    return id;
  };

  const addProduct = async (input: NewProductInput): Promise<Product> => {
    const stock: Record<string, number> = {};
    ALL_SIZES.forEach(sz => { stock[sz] = Math.max(0, Math.floor(input.stock[sz] || 0)); });

    const product: Product = {
      id: makeUniqueId(input.badge || input.name),
      name: input.name.trim(),
      badge: input.badge.trim(),
      tagline: input.tagline.trim(),
      description: input.description.trim(),
      price: input.price,
      originalPrice: input.originalPrice,
      image: input.image.trim(),
      stock,
      active: input.active,
    };

    if (db) {
      await setDoc(doc(db, 'products', product.id), product);
    } else {
      applyLocally([...allProducts, product]);
    }
    return product;
  };

  const setProductActive = async (product: Product, active: boolean) => {
    if (db) {
      await updateDoc(doc(db, 'products', product.id), { active });
    } else {
      applyLocally(allProducts.map(p => p.id === product.id ? { ...p, active } : p));
    }
  };

  /** Cambia prezzo scontato e prezzo pieno (barrato). */
  const updateProductPrice = async (product: Product, price: number, originalPrice: number) => {
    if (!(price > 0)) throw new Error('Prezzo non valido');
    // Il prezzo pieno non può essere più basso di quello scontato
    const original = originalPrice > price ? originalPrice : price;
    if (db) {
      await updateDoc(doc(db, 'products', product.id), { price, originalPrice: original });
    } else {
      applyLocally(allProducts.map(p => p.id === product.id ? { ...p, price, originalPrice: original } : p));
    }
  };

  const deleteProduct = async (product: Product) => {
    if (db) {
      await deleteDoc(doc(db, 'products', product.id));
    } else {
      applyLocally(allProducts.filter(p => p.id !== product.id));
    }
  };

  return { addProduct, setProductActive, updateProductPrice, deleteProduct };
}
