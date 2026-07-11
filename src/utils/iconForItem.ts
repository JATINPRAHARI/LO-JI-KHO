import {
  ChefHat,
  Soup,
  Sandwich,
  Coffee,
  CakeSlice,
  Package,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

export interface IconConfig {
  icon: LucideIcon;
  gradient: string;
}

const categoryMap: Record<string, IconConfig> = {
  maggi: { icon: Soup, gradient: 'bg-gradient-to-br from-orange-400 to-amber-300' },
  noodles: { icon: Soup, gradient: 'bg-gradient-to-br from-orange-400 to-amber-300' },
  sandwich: { icon: Sandwich, gradient: 'bg-gradient-to-br from-amber-400 to-yellow-300' },
  sandwiches: { icon: Sandwich, gradient: 'bg-gradient-to-br from-amber-400 to-yellow-300' },
  pasta: { icon: Soup, gradient: 'bg-gradient-to-br from-rose-400 to-orange-300' },
  coffee: { icon: Coffee, gradient: 'bg-gradient-to-br from-sky-400 to-blue-300' },
  drinks: { icon: Coffee, gradient: 'bg-gradient-to-br from-sky-400 to-blue-300' },
  beverages: { icon: Coffee, gradient: 'bg-gradient-to-br from-sky-400 to-blue-300' },
  dessert: { icon: CakeSlice, gradient: 'bg-gradient-to-br from-pink-400 to-rose-300' },
  desserts: { icon: CakeSlice, gradient: 'bg-gradient-to-br from-pink-400 to-rose-300' },
  sweets: { icon: CakeSlice, gradient: 'bg-gradient-to-br from-pink-400 to-rose-300' },
  combo: { icon: Package, gradient: 'bg-gradient-to-br from-indigo-400 to-violet-300' },
  combos: { icon: Package, gradient: 'bg-gradient-to-br from-indigo-400 to-violet-300' },
  'protein-ladoo': { icon: CakeSlice, gradient: 'bg-gradient-to-br from-emerald-400 to-teal-300' },
  protein: { icon: CakeSlice, gradient: 'bg-gradient-to-br from-emerald-400 to-teal-300' },
  ladoo: { icon: CakeSlice, gradient: 'bg-gradient-to-br from-emerald-400 to-teal-300' },
};

const nameHints: { pattern: RegExp; config: IconConfig }[] = [
  { pattern: /maggi|noodle|chowmein|hakka/i, config: categoryMap.maggi },
  { pattern: /sandwich|grilled|toast/i, config: categoryMap.sandwich },
  { pattern: /pasta|penne|fusilli|spaghetti|macaroni/i, config: categoryMap.pasta },
  { pattern: /coffee|shake|smoothie|juice|drink|beverage|cold/i, config: categoryMap.coffee },
  { pattern: /cake|brownie|dessert|sweet|pastry/i, config: categoryMap.dessert },
  { pattern: /ladoo|laddoo|protein/i, config: categoryMap['protein-ladoo'] },
  { pattern: /combo|meal|platter|box/i, config: categoryMap.combo },
];

const defaultConfig: IconConfig = {
  icon: ChefHat,
  gradient: 'bg-gradient-to-br from-brand-primary to-brand-accent',
};

export function iconForItem(slug?: string, name?: string): IconConfig {
  if (slug) {
    const lower = slug.toLowerCase();
    if (categoryMap[lower]) return categoryMap[lower];
  }
  if (name) {
    const lower = name.toLowerCase();
    for (const hint of nameHints) {
      if (hint.pattern.test(lower)) return hint.config;
    }
  }
  return defaultConfig;
}

export function getIconForCategory(slug?: string): LucideIcon {
  return iconForItem(slug).icon;
}

export function getGradientForCategory(slug?: string): string {
  return iconForItem(slug).gradient;
}
