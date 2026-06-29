export interface ProductCardProps {
  name: string;
  category: string;
  price: string;
  badge?: string | null;
  img?: string | null;
  onAdd?: (product: { name: string; price: string }) => void;
  onDetail?: () => void;
}
export declare function ProductCard(props: ProductCardProps): JSX.Element;
