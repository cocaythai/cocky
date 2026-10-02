import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceHighlights } from './components/ServiceHighlights';
import { ProductCatalog } from './components/ProductCatalog';
import { WaterSavingsCalculator } from './components/WaterSavingsCalculator';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { InquiryDrawer } from './components/InquiryDrawer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { Footer } from './components/Footer';

import { useProducts } from './hooks/useProducts';
import { useSiteSettings } from './hooks/useSiteSettings';
import { useAuth } from './hooks/useAuth';
import { AdminModal } from './components/admin/AdminModal';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { productService } from './services/productService';
import { CowayProduct, SubscriptionOption, InquiryItem } from './types';
import { MessageCircle, Phone, CheckCircle2, Loader2 } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProduct, setSelectedProduct] = useState<CowayProduct | null>(null);
  const [comparedProducts, setComparedProducts] = useState<CowayProduct[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [inquiryItems, setInquiryItems] = useState<InquiryItem[]>([]);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication State from Supabase Auth
  const { user, isAuthenticated, loading: authLoading, signIn, signOut } = useAuth();

  // Browser Path Routing State
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  // Listen to browser navigation (Back / Forward)
  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string, replace = false) => {
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Protected Route Guard
  React.useEffect(() => {
    if (authLoading) return;

    if (currentPath === '/admin' && !isAuthenticated) {
      // Not logged in -> redirect to /admin/login immediately and replace history
      window.history.replaceState(null, '', '/admin/login');
      setCurrentPath('/admin/login');
    } else if (currentPath === '/admin/login' && isAuthenticated) {
      // Already logged in -> redirect to /admin
      window.history.replaceState(null, '', '/admin');
      setCurrentPath('/admin');
    }
  }, [currentPath, isAuthenticated, authLoading]);

  // Handle Logout with history replacement so Back button cannot return
  const handleLogout = async () => {
    await signOut();
    window.history.replaceState(null, '', '/admin/login');
    setCurrentPath('/admin/login');
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  // Consume central product data service layer (live Supabase)
  const {
    products,
    loading,
    source,
    supabaseCount,
    statusMessage,
    refetch,
    seedSampleProducts,
  } = useProducts();

  // Consume dynamic site settings from Supabase
  const {
    settings: siteSettings,
    updateSettings,
    refreshSettings,
  } = useSiteSettings();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewDetails = (product: CowayProduct) => {
    setSelectedProduct(product);
  };

  const handleQuickInquiry = (product: CowayProduct) => {
    // Add default subscription option
    const defaultOption = product.subscriptionOptions[0];
    handleAddToInquiry(product, defaultOption);
  };

  const handleAddToInquiry = (product: CowayProduct, option: SubscriptionOption) => {
    setInquiryItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedOption.years === option.years
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedOption.years === option.years
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, selectedOption: option, quantity: 1 }];
    });
    showToast(`เพิ่ม "${product.name}" ในรายการที่สนใจแล้ว`);
    setIsInquiryDrawerOpen(true);
  };

  const handleToggleCompare = (product: CowayProduct) => {
    const isAlready = comparedProducts.some((p) => p.id === product.id);
    if (isAlready) {
      setComparedProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      if (comparedProducts.length >= 3) {
        showToast('สามารถเปรียบเทียบได้สูงสุด 3 รุ่นพร้อมกัน');
        return;
      }
      setComparedProducts((prev) => [...prev, product]);
      showToast(`เพิ่ม "${product.name}" ในตารางเปรียบเทียบแล้ว`);
    }
  };

  const handleSelectRecommendedModel = async (modelId: string) => {
    const product = await productService.getProductById(modelId);
    if (product) {
      setSelectedProduct(product);
    } else {
      handleNavigate('products');
    }
  };

  // 1. Initial Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p className="text-xs font-semibold text-slate-400">กำลังเชื่อมต่อระบบความปลอดภัย Coway...</p>
      </div>
    );
  }

  // 2. Admin Login Page Route (/admin/login)
  if (currentPath === '/admin/login') {
    return (
      <AdminLoginPage
        onLogin={async (email, pass) => {
          const res = await signIn(email, pass);
          if (res.success) {
            navigateTo('/admin', true);
          }
          return res;
        }}
        onBackToHome={() => navigateTo('/')}
      />
    );
  }

  // 3. Protected Admin Dashboard Route (/admin)
  if (currentPath === '/admin') {
    if (!isAuthenticated) {
      return (
        <AdminLoginPage
          onLogin={async (email, pass) => {
            const res = await signIn(email, pass);
            if (res.success) {
              navigateTo('/admin', true);
            }
            return res;
          }}
          onBackToHome={() => navigateTo('/')}
        />
      );
    }

    return (
      <AdminModal
        isOpen={true}
        isStandalonePage={true}
        onClose={() => navigateTo('/')}
        userEmail={user?.email}
        onLogout={handleLogout}
        siteSettings={siteSettings}
        onSaveSettings={updateSettings}
        products={products}
        onRefreshProducts={refetch}
        onRefreshSettings={refreshSettings}
      />
    );
  }

  // 4. Public Website (Default Route /)
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        inquiryCount={inquiryItems.length}
        onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
        siteSettings={siteSettings}
        onOpenAdmin={() => navigateTo(isAuthenticated ? '/admin' : '/admin/login')}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onExploreProducts={() => handleNavigate('products')}
          onContactClick={() => handleNavigate('contact')}
          siteSettings={siteSettings}
        />

        {/* 2. Service & Cody Highlights */}
        <ServiceHighlights />

        {/* 3. Product Catalog (All products with filter tabs & search) */}
        <ProductCatalog
          products={products}
          loading={loading}
          dataSource={source}
          supabaseCount={supabaseCount}
          statusMessage={statusMessage}
          onSeedSampleProducts={seedSampleProducts}
          onRefetch={refetch}
          onViewDetails={handleViewDetails}
          onQuickInquiry={handleQuickInquiry}
          comparedProducts={comparedProducts}
          onToggleCompare={handleToggleCompare}
          onOpenCompareModal={() => setIsCompareModalOpen(true)}
        />

        {/* 4. Interactive Savings Calculator */}
        <WaterSavingsCalculator
          onSelectRecommendedModel={handleSelectRecommendedModel}
        />

        {/* 5. About Us & Customer Reviews */}
        <AboutSection />

        {/* 6. Contact & Consultation Request Form */}
        <ContactSection siteSettings={siteSettings} />
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} siteSettings={siteSettings} />

      {/* Floating Action Button (Desktop & Tablet) */}
      <aside aria-label="ช่องทางติดต่อด่วน" className="hidden md:flex fixed bottom-6 right-6 z-30 flex-col gap-3.5">
        {/* Floating LINE Button - Green with Pulsing Radar Effect */}
        <div className="relative group">
          {/* Subtle Outer Glowing Pulse Ring */}
          <span className="absolute -inset-1 rounded-2xl bg-emerald-500 opacity-60 blur-xs animate-pulse" />
          
          {/* Attention Blinking Ping Indicator */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-10 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#06c755] border-2 border-white"></span>
          </span>

          <a
            href={siteSettings.lineUrl || "https://line.me"}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-13 h-13 rounded-2xl bg-[#06c755] hover:bg-[#05b34c] text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="แอด LINE สอบถามโปรโมชั่น"
          >
            <MessageCircle className="w-6 h-6 animate-pulse" />
            <span className="absolute right-15 bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              แอด LINE สอบถามโปรโมชั่น ({siteSettings.lineId || '@cowaythailand'})
            </span>
          </a>
        </div>

        {/* Floating Call Button - Black with Subtle Glow */}
        <div className="relative group">
          {/* Subtle Glow */}
          <span className="absolute -inset-0.5 rounded-2xl bg-slate-900 opacity-30 blur-xs animate-pulse" />

          <a
            href={`tel:${siteSettings.phoneNumber || '020000000'}`}
            className="relative w-13 h-13 rounded-2xl bg-black hover:bg-slate-800 text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title={`โทรติดต่อด่วน ${siteSettings.phoneDisplay || '02-000-0000'}`}
          >
            <Phone className="w-5 h-5 animate-pulse" />
            <span className="absolute right-15 bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              โทรด่วน {siteSettings.phoneDisplay || '02-000-0000'}
            </span>
          </a>
        </div>
      </aside>

      {/* Mobile Bottom Sticky Bar (Strict 15% height constraint) */}
      <MobileStickyBar
        inquiryCount={inquiryItems.length}
        onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
        onContactClick={() => handleNavigate('contact')}
        siteSettings={siteSettings}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToInquiry={handleAddToInquiry}
        onDirectContact={(product, option) => {
          handleAddToInquiry(product, option);
          setSelectedProduct(null);
        }}
      />

      <ProductComparisonModal
        products={comparedProducts}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveFromCompare={(p) => handleToggleCompare(p)}
        onViewDetails={(p) => {
          setIsCompareModalOpen(false);
          setSelectedProduct(p);
        }}
        onSelectProduct={(p) => {
          setIsCompareModalOpen(false);
          handleQuickInquiry(p);
        }}
      />

      <InquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        items={inquiryItems}
        onRemoveItem={(idx) =>
          setInquiryItems((prev) => prev.filter((_, i) => i !== idx))
        }
        onClearItems={() => setInquiryItems([])}
      />
    </div>
  );
}
