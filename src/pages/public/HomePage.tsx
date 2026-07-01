import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Zap, Shield, ChevronRight, Star, ChefHat, Sparkles, Clock, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedItems, getActiveOffers, getCategories } from '../../services';
import { useCart } from '../../contexts/CartContext';
import { MenuItemSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Button } from '../../components/ui/Button';
import type { MenuItem } from '../../types/database';

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 flex flex-col md:flex-row items-center gap-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 space-y-6"
        >
          <span className="inline-block border border-brand-primary text-brand-primary dark:text-brand-accent dark:border-brand-accent text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
            Premium Cloud Kitchen
          </span>
          <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-brand-text dark:text-stone-100 leading-tight">
            Good Food.{' '}
            <span className="text-brand-primary dark:text-brand-accent">Good<br />Mood.</span>
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-base max-w-md leading-relaxed">
            Elevating your everyday comfort food. Artisanal Maggi, Gourmet Sandwiches, and Hand-crafted Pastas — delivered hot to your doorstep.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button size="lg" rightIcon={<ArrowRight size={16} />}>
              <Link to="/menu">Order Now</Link>
            </Button>
            <Button variant="outline" size="lg">
              <Link to="/menu">View Menu</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 text-sm text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1.5"><span className="text-green-500">&#x2714;</span> 30 min delivery</div>
            <div className="flex items-center gap-1.5"><span className="text-green-500">&#x2714;</span> 100% Vegetarian</div>
            <div className="flex items-center gap-1.5"><span className="text-green-500">&#x2714;</span> Fresh daily</div>
          </div>
        </motion.div>

        {/* Animated Icon Artboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex justify-center"
        >
          <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-full blur-3xl scale-110" />

            {/* Main artboard */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-2xl overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-6 left-6 w-20 h-20 border-2 border-white/20 rounded-full" />
              <div className="absolute bottom-8 right-8 w-14 h-14 border-2 border-white/20 rounded-lg rotate-45" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full" />

              {/* Main icon */}
              <ChefHat size={100} className="text-white/90 drop-shadow-lg" strokeWidth={1.2} />
            </div>

            {/* Orbiting badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-6 bg-white dark:bg-stone-900 rounded-2xl p-3.5 shadow-xl border border-stone-100 dark:border-stone-800"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center"><Star size={14} className="text-brand-accent fill-brand-accent" /></div>
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Premium Quality</p>
                  <p className="text-[10px] text-stone-500">Trusted by thousands</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 bg-brand-primary rounded-2xl p-3.5 shadow-xl"
            >
              <p className="text-white text-xs font-bold flex items-center gap-1"><Sparkles size={12} /> Premium</p>
              <p className="text-orange-100 text-[10px]">Cloud Kitchen</p>
            </motion.div>

            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              className="absolute -top-2 right-16 w-10 h-10 bg-white dark:bg-stone-900 rounded-full shadow-lg flex items-center justify-center"
            >
              <Leaf size={16} className="text-green-600" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function OffersSection() {
  const { data: offers, isLoading } = useQuery({ queryKey: ['offers'], queryFn: getActiveOffers });

  if (isLoading) return null;
  if (!offers || offers.length === 0) return null;

  const offer = offers[0];
  return (
    <section className="max-w-6xl mx-auto px-4 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-brand-primary to-orange-600 rounded-2xl px-8 py-5 flex items-center justify-between gap-4"
      >
        <div>
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide mb-0.5">Limited Time Offer</p>
          <h3 className="font-playfair text-white text-xl font-bold">{offer.title}</h3>
          <p className="text-orange-100 text-sm mt-0.5">{offer.description} &bull; Use code <span className="font-bold">{offer.code}</span></p>
        </div>
        <Link to="/menu">
          <Button variant="secondary" size="md" className="whitespace-nowrap shrink-0">Claim Offer</Button>
        </Link>
      </motion.div>
    </section>
  );
}

function CategoriesSection() {
  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  if (isLoading || !categories?.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-playfair text-2xl font-bold text-brand-text dark:text-stone-100">Browse Categories</h2>
        <Link to="/menu" className="text-sm text-brand-primary dark:text-brand-accent font-semibold flex items-center gap-1 hover:underline">
          View All <ChevronRight size={14} />
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/menu" className="px-6 py-2.5 rounded-full text-sm font-semibold bg-brand-secondary dark:bg-white text-white dark:text-stone-900 shadow-sm">
          All Items
        </Link>
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/menu?category=${cat.slug}`}
            className="px-6 py-2.5 rounded-full text-sm font-medium border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-brand-primary hover:text-brand-primary dark:hover:text-brand-accent bg-white dark:bg-stone-900 transition-all"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedSection() {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['featured-items'],
    queryFn: getFeaturedItems,
  });
  const { addItem } = useCart();

  return (
    <section className="max-w-6xl mx-auto px-4 mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-3xl font-bold text-brand-text dark:text-stone-100">Featured Dishes</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Chef&apos;s special selections for you.</p>
        </div>
        <Link to="/menu" className="text-sm text-brand-primary dark:text-brand-accent font-semibold flex items-center gap-1 hover:underline">
          View All <ChevronRight size={14} />
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <MenuItemSkeleton key={i} />)}
        </div>
      )}

      {error && <EmptyState title="No featured items yet." description="Check back soon!" />}

      {!isLoading && !error && items && items.length === 0 && (
        <EmptyState
          title="No featured items yet."
          description="Our chefs are curating the best for you."
          action={<Link to="/menu"><Button>Browse Full Menu</Button></Link>}
        />
      )}

      {!isLoading && items && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item: MenuItem & { categories?: { name: string; slug: string } | null }) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group border border-stone-100/80 dark:border-stone-800"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-playfair font-semibold text-stone-900 dark:text-stone-100">{item.name}</h3>
                  <span className="font-bold text-brand-secondary dark:text-brand-accent">&#x20B9;{item.price}</span>
                </div>
                <p className="text-stone-500 dark:text-stone-400 text-xs line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Star size={11} className="text-brand-accent fill-brand-accent" />
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Chef's Special</span>
                </div>
                <button
                  onClick={() => { addItem(item); toast.success(`${item.name} added!`); }}
                  className="w-full flex items-center justify-center gap-2 bg-brand-primary/10 dark:bg-brand-primary/20 hover:bg-brand-primary hover:text-white text-brand-primary dark:text-brand-accent border border-brand-primary/30 hover:border-brand-primary py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

function WhyUsSection() {
  const features = [
    { icon: Leaf, title: 'Farm Fresh', desc: 'We source only the freshest organic vegetables and high-quality artisanal breads daily.' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Optimized kitchen workflow ensures your food reaches you piping hot in under 30 minutes.' },
    { icon: Shield, title: 'Hygienic Prep', desc: '5-star kitchen rated with rigorous daily sanitation protocols and quality checks.' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 mb-16 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="font-playfair text-3xl font-bold text-brand-text dark:text-stone-100 mb-2">Why Lo Ji Khao?</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm mb-10">Redefining the standards of street-comfort food.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-2xl flex items-center justify-center">
                <Icon size={24} className="text-brand-primary dark:text-brand-accent" />
              </div>
              <h3 className="font-playfair font-bold text-brand-text dark:text-stone-100">{title}</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="bg-brand-secondary dark:bg-stone-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-playfair text-3xl font-bold mb-4">Visit or Call Us</h2>
            <p className="text-stone-400 mb-6 leading-relaxed">We&apos;re a cloud kitchen based in Bandra, Mumbai. Order online and we&apos;ll deliver straight to you.</p>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-3"><dt className="text-brand-accent w-24 shrink-0 flex items-center gap-1.5"><MapPin size={14} /> Address</dt><dd className="text-stone-300">Bandra West, Mumbai - 400050</dd></div>
              <div className="flex gap-3"><dt className="text-brand-accent w-24 shrink-0 flex items-center gap-1.5"><Phone size={14} /> Phone</dt><dd className="text-stone-300">+91 79060 39087</dd></div>
              <div className="flex gap-3"><dt className="text-brand-accent w-24 shrink-0">Email</dt><dd className="text-stone-300">nikitaprahri12@gmail.com</dd></div>
              <div className="flex gap-3"><dt className="text-brand-accent w-24 shrink-0 flex items-center gap-1.5"><Clock size={14} /> Hours</dt><dd className="text-stone-300">Mon&ndash;Sun: 10:00 AM &ndash; 11:00 PM</dd></div>
            </dl>
          </div>
          <div className="bg-white/10 rounded-2xl overflow-hidden h-56 flex items-center justify-center border border-white/10">
            <div className="text-center text-stone-400">
              <MapPin size={32} className="mx-auto mb-2 text-brand-accent" />
              <p className="text-sm">Bandra West, Mumbai</p>
              <p className="text-xs mt-1 text-stone-500">Cloud Kitchen &bull; Delivery Only</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="bg-brand-bg dark:bg-stone-950">
      <HeroSection />
      <OffersSection />
      <CategoriesSection />
      <FeaturedSection />
      <WhyUsSection />
      <ContactSection />
    </div>
  );
}
