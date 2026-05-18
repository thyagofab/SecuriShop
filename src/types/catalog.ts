import type { Product } from './domain';

export type CategoriaCatalogo =
  | 'Cadernos'
  | 'Smartphones'
  | 'Notebooks'
  | 'Monitores'
  | 'Perifericos'
  | 'Acessorios';

export interface CatalogProduct extends Product {
  price: string;
  oldPrice?: string;
  savings?: string;
  discountLabel?: string;
  imageUrl: string;
  buyLink: string;
  category: CategoriaCatalogo;
}

export type CategoriaExibida = 'Todos' | CategoriaCatalogo;
