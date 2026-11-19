import type { Product } from './types';

export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

// Stili attualmente in vendita (gli altri restano su Firestore ma non vengono mostrati)
export const ACTIVE_PRODUCT_IDS = ['hoodie-g', 'hoodie-h', 'hoodie-i', 'hoodie-j', 'hoodie-k'];

// Modalità test: si attiva aprendo il sito con ?test=1 (es. https://tuosito/?test=1)
export const IS_TEST_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('test');

// Prodotto di prova: visibile solo in modalità test. Viene creato su Firestore
// la prima volta che un admin entra con ?test=1. Gli ordini di prova vanno annullati dal pannello admin.
export const TEST_PRODUCT_ID = 'hoodie-test';
export const TEST_PRODUCT: Product = {
  id: TEST_PRODUCT_ID,
  name: 'PRODOTTO TEST (non ordinare)',
  tagline: 'Prodotto di prova per verificare ordini e scorte',
  description: 'Solo per prove interne. Gli ordini su questo prodotto vanno annullati dal pannello admin.',
  originalPrice: 1.00,
  price: 1.00,
  badge: 'TEST',
  image: '/stile-g.jpg',
  stock: { XS: 5, S: 5, M: 5, L: 5, XL: 5, '2XL': 5, '3XL': 5 }
};

// Descrizione Universale per tutti gli stili
const UNIVERSAL_TAGLINE = "Felpa ufficiale d'istituto unisex con cappuccio e tasca a marsupio";
const UNIVERSAL_DESCRIPTION = "Felpa unisex in cotone morbido e resistente con cappuccio e tasca frontale a marsupio. Design esclusivo caratterizzato dallo stemma ufficiale Divini sul petto e dall'iconica maxi-grafica verticale \"DIVINI\" stampata sulla schiena. Vestibilità comoda, ideale sia per la scuola che per il tempo libero.";

// Catalogo 5 Nuovi Stili Attivi (Da Stile G a Stile K) - Prezzo 20€ (scontato da 25€)
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'hoodie-g',
    name: 'Felpa Stile G',
    tagline: UNIVERSAL_TAGLINE,
    description: UNIVERSAL_DESCRIPTION,
    originalPrice: 25.00,
    price: 20.00,
    badge: 'Stile G',
    image: '/stile-g.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  },
  {
    id: 'hoodie-h',
    name: 'Felpa Stile H',
    tagline: UNIVERSAL_TAGLINE,
    description: UNIVERSAL_DESCRIPTION,
    originalPrice: 25.00,
    price: 20.00,
    badge: 'Stile H',
    image: '/stile-h.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  },
  {
    id: 'hoodie-i',
    name: 'Felpa Stile I',
    tagline: UNIVERSAL_TAGLINE,
    description: UNIVERSAL_DESCRIPTION,
    originalPrice: 25.00,
    price: 20.00,
    badge: 'Stile I',
    image: '/stile-i.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  },
  {
    id: 'hoodie-j',
    name: 'Felpa Stile J',
    tagline: UNIVERSAL_TAGLINE,
    description: UNIVERSAL_DESCRIPTION,
    originalPrice: 25.00,
    price: 20.00,
    badge: 'Stile J',
    image: '/stile-j.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  },
  {
    id: 'hoodie-k',
    name: 'Felpa Stile K',
    tagline: UNIVERSAL_TAGLINE,
    description: UNIVERSAL_DESCRIPTION,
    originalPrice: 25.00,
    price: 20.00,
    badge: 'Stile K',
    image: '/stile-k.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  }
];
