export interface HeaderProps {
  /** Number of items in cart — shows badge when > 0 */
  cartCount?: number;
  /** Navigation callback: receives 'home' | 'tienda' | 'eventos' | 'vistanos' | 'cart' | 'contact' */
  onNav?: (dest: string) => void;
}
export declare function Header(props: HeaderProps): JSX.Element;
