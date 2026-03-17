'use client';

import { useEffect, useState, useCallback } from 'react';
import { menuAPI, transactionsAPI, membersAPI, promosAPI, Category, MenuItem, Member, Promo } from '@/app/lib/api';
import { Card } from '@/app/components/ui';

interface AddOn {
    id: number;
    name: string;
    price: number;
    menu_item_id: number | null;
}

interface CartItem {
    id: string;
    menu_item_id: number;
    name: string;
    base_price: number;
    quantity: number;
    add_ons: { add_on_id: number; name: string; price: number; quantity: number }[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

export default function POSPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);

    // Add-ons Modal State
    const [showAddonModal, setShowAddonModal] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [availableAddonsForItem, setAvailableAddonsForItem] = useState<AddOn[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({});

    // Checkout State
    const [customerName, setCustomerName] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);

    // Member State
    const [memberCardInput, setMemberCardInput] = useState('');
    const [memberInfo, setMemberInfo] = useState<Member | null>(null);
    const [memberLoading, setMemberLoading] = useState(false);
    const [memberError, setMemberError] = useState<string | null>(null);

    // Promo State
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [promoInfo, setPromoInfo] = useState<Promo | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchMenuItems();
    }, [selectedCategory]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [cats, addonsRes] = await Promise.all([
                menuAPI.getCategories() as Promise<Category[]>,
                menuAPI.getAddOns() as Promise<any>
            ]);
            setCategories(cats);
            setAddOns(addonsRes || []);
        } catch (err: any) {
            setError('Failed to load menu categories or addons');
        } finally {
            setLoading(false);
        }
    };

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const catId = selectedCategory === 'all' ? undefined : (selectedCategory as number);
            const response: any = await menuAPI.getMenuItems(catId);
            setMenuItems(response || []);
        } catch (err: any) {
            setError('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    // Filter menu items by search query (client-side)
    const filteredMenuItems = searchQuery.trim()
        ? menuItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : menuItems;

    // --- Member lookup ---
    const handleLookupMember = async () => {
        if (!memberCardInput.trim()) return;
        setMemberLoading(true);
        setMemberError(null);
        setMemberInfo(null);
        try {
            const member = await membersAPI.getMemberByCard(memberCardInput.trim());
            setMemberInfo(member);
        } catch (err: any) {
            setMemberError(err.message || 'Member not found');
        } finally {
            setMemberLoading(false);
        }
    };

    const handleClearMember = () => {
        setMemberCardInput('');
        setMemberInfo(null);
        setMemberError(null);
    };

    // --- Promo lookup ---
    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim()) return;
        setPromoLoading(true);
        setPromoError(null);
        setPromoInfo(null);
        try {
            const promo = await promosAPI.validatePromo(promoCodeInput.trim());
            setPromoInfo(promo);
        } catch (err: any) {
            setPromoError(err.message || 'Invalid or expired promo code');
        } finally {
            setPromoLoading(false);
        }
    };

    const handleClearPromo = () => {
        setPromoCodeInput('');
        setPromoInfo(null);
        setPromoError(null);
    };

    // --- Menu item click ---
    const handleMenuClick = (item: MenuItem) => {
        const applicableAddons = addOns.filter(
            (addon) => addon.menu_item_id === null || addon.menu_item_id === item.id
        );

        if (applicableAddons.length > 0) {
            setSelectedMenuItem(item);
            setAvailableAddonsForItem(applicableAddons);
            setSelectedAddons({});
            setShowAddonModal(true);
        } else {
            addToCart(item, []);
        }
    };

    const handleAddonToggle = (addonId: number) => {
        setSelectedAddons((prev) => {
            const newSelections = { ...prev };
            if (newSelections[addonId]) {
                delete newSelections[addonId];
            } else {
                newSelections[addonId] = 1;
            }
            return newSelections;
        });
    };

    const confirmAddonSelection = () => {
        if (!selectedMenuItem) return;

        const formattedAddons = Object.entries(selectedAddons).map(([idStr, qty]) => {
            const addonId = parseInt(idStr);
            const addon = addOns.find((a) => a.id === addonId)!;
            return {
                add_on_id: addonId,
                name: addon.name,
                price: addon.price,
                quantity: qty
            };
        });

        addToCart(selectedMenuItem, formattedAddons);
        setShowAddonModal(false);
        setSelectedMenuItem(null);
    };

    const addToCart = (item: MenuItem, addons: { add_on_id: number; name: string; price: number; quantity: number }[]) => {
        const addonKey = addons.map(a => `${a.add_on_id}-${a.quantity}`).sort().join('_');
        const uniqueCartId = `${item.id}_${addonKey}`;

        setCart((prev) => {
            const existing = prev.find((c) => c.id === uniqueCartId);
            if (existing) {
                return prev.map((c) =>
                    c.id === uniqueCartId ? { ...c, quantity: c.quantity + 1 } : c
                );
            }
            return [
                ...prev,
                {
                    id: uniqueCartId,
                    menu_item_id: item.id,
                    name: item.name,
                    base_price: item.price,
                    quantity: 1,
                    add_ons: addons,
                },
            ];
        });
    };

    const removeFromCart = (cartId: string) => {
        setCart((prev) => prev.filter((c) => c.id !== cartId));
    };

    const updateCartQuantity = (cartId: string, delta: number) => {
        setCart((prev) => prev.map((c) => {
            if (c.id === cartId) {
                const newQty = Math.max(1, c.quantity + delta);
                return { ...c, quantity: newQty };
            }
            return c;
        }));
    };

    const cartSubtotal = cart.reduce((sum, item) => {
        const itemAddonsTotal = item.add_ons.reduce((addonSum, a) => addonSum + (a.price * a.quantity), 0);
        return sum + ((item.base_price + itemAddonsTotal) * item.quantity);
    }, 0);

    // Compute member discount
    const memberDiscount = memberInfo
        ? Math.floor(cartSubtotal * (memberInfo.discount / 100))
        : 0;

    // Compute promo discount
    const computePromoDiscount = () => {
        if (!promoInfo) return 0;
        if (promoInfo.discount_type === 'percentage') {
            const raw = Math.floor(cartSubtotal * (promoInfo.discount_value / 100));
            return promoInfo.max_discount > 0 ? Math.min(raw, promoInfo.max_discount) : raw;
        }
        return promoInfo.discount_value;
    };
    const promoDiscount = computePromoDiscount();

    const cartTotal = Math.max(0, cartSubtotal - memberDiscount - promoDiscount);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            setIsCheckingOut(true);
            setError(null);

            const orderPayload: any = {
                customer_name: customerName.trim() || undefined,
                items: cart.map(c => ({
                    menu_item_id: c.menu_item_id,
                    quantity: c.quantity,
                    add_ons: c.add_ons.map(a => ({
                        add_on_id: a.add_on_id,
                        quantity: a.quantity
                    }))
                }))
            };

            if (memberInfo) orderPayload.member_id = memberInfo.id;
            if (promoInfo) orderPayload.promo_id = promoInfo.id;

            await transactionsAPI.createTransaction(orderPayload);

            setCart([]);
            setCustomerName('');
            setMemberCardInput('');
            setMemberInfo(null);
            setMemberError(null);
            setPromoCodeInput('');
            setPromoInfo(null);
            setPromoError(null);
            setCheckoutSuccess(true);
            setTimeout(() => setCheckoutSuccess(false), 3000);

        } catch (err: any) {
            setError(err.message || 'Failed to process transaction');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] p-4 gap-4 bg-slate-50 dark:bg-slate-900 overflow-hidden">

            {/* Left Area: Menu Browser */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">

                {/* Search + Category Filters */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Category pills */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            All Items
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto p-4 relative">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-40 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredMenuItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <span className="text-4xl mb-2">🔍</span>
                            <p>{searchQuery ? `No items match "${searchQuery}"` : 'No items found in this category'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                            {filteredMenuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleMenuClick(item)}
                                    disabled={!item.is_available}
                                    className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${item.is_available
                                        ? 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 hover:shadow-md cursor-pointer'
                                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex-1 w-full">
                                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight mb-1">
                                            {item.name}
                                        </h4>
                                        {item.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-end justify-between w-full">
                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(item.price)}
                                        </span>
                                        {!item.is_available && (
                                            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded">
                                                Sold Out
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Area: Cart Panel */}
            <div className="w-96 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Current Order</h2>
                    {checkoutSuccess && (
                        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            ✓ Order Placed
                        </span>
                    )}
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <span className="text-4xl mb-4">🛒</span>
                            <p>Your cart is empty.</p>
                            <p className="text-sm mt-1 text-slate-500">Select items from the menu to get started.</p>
                        </div>
                    ) : (
                        cart.map((cartItem) => (
                            <div key={cartItem.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h5 className="font-bold text-slate-900 dark:text-white text-sm">{cartItem.name}</h5>
                                        <p className="text-xs text-slate-500">{formatCurrency(cartItem.base_price)}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(cartItem.id)} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
                                </div>

                                {cartItem.add_ons.length > 0 && (
                                    <div className="space-y-1 mt-1 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                                        {cartItem.add_ons.map((ao) => (
                                            <div key={ao.add_on_id} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                                                <span>+ {ao.name}</span>
                                                <span>{formatCurrency(ao.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                                        <button onClick={() => updateCartQuantity(cartItem.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-slate-700 dark:text-slate-300">-</button>
                                        <span className="w-6 text-center text-sm font-bold text-slate-900 dark:text-white">{cartItem.quantity}</span>
                                        <button onClick={() => updateCartQuantity(cartItem.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-slate-700 dark:text-slate-300">+</button>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                                        {formatCurrency(
                                            (cartItem.base_price + cartItem.add_ons.reduce((s, a) => s + a.price, 0)) * cartItem.quantity
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Area */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl space-y-3">

                    {/* Customer Name */}
                    <input
                        type="text"
                        placeholder="Customer Name (Optional)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 text-sm"
                    />

                    {/* Member Card */}
                    <div>
                        {memberInfo ? (
                            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2">
                                <div>
                                    <p className="text-xs font-semibold text-green-800 dark:text-green-200">👤 {memberInfo.full_name}</p>
                                    <p className="text-xs text-green-700 dark:text-green-300">Member discount: {memberInfo.discount}%</p>
                                </div>
                                <button onClick={handleClearMember} className="text-green-600 dark:text-green-400 hover:text-red-500 text-lg leading-none">✕</button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Member card number"
                                    value={memberCardInput}
                                    onChange={(e) => setMemberCardInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLookupMember()}
                                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 text-sm"
                                />
                                <button
                                    onClick={handleLookupMember}
                                    disabled={memberLoading || !memberCardInput.trim()}
                                    className="px-3 py-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                                >
                                    {memberLoading ? '...' : 'Apply'}
                                </button>
                            </div>
                        )}
                        {memberError && <p className="text-xs text-red-500 mt-1">{memberError}</p>}
                    </div>

                    {/* Promo Code */}
                    <div>
                        {promoInfo ? (
                            <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg px-3 py-2">
                                <div>
                                    <p className="text-xs font-semibold text-purple-800 dark:text-purple-200">🏷️ {promoInfo.code} – {promoInfo.name}</p>
                                    <p className="text-xs text-purple-700 dark:text-purple-300">
                                        {promoInfo.discount_type === 'percentage'
                                            ? `${promoInfo.discount_value}% off${promoInfo.max_discount > 0 ? ` (max ${formatCurrency(promoInfo.max_discount)})` : ''}`
                                            : `${formatCurrency(promoInfo.discount_value)} off`
                                        }
                                    </p>
                                </div>
                                <button onClick={handleClearPromo} className="text-purple-600 dark:text-purple-400 hover:text-red-500 text-lg leading-none">✕</button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Promo code"
                                    value={promoCodeInput}
                                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-purple-500 text-sm"
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    disabled={promoLoading || !promoCodeInput.trim()}
                                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                                >
                                    {promoLoading ? '...' : 'Apply'}
                                </button>
                            </div>
                        )}
                        {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1">
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span>{formatCurrency(cartSubtotal)}</span>
                        </div>
                        {memberDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>Member Discount ({memberInfo!.discount}%)</span>
                                <span>-{formatCurrency(memberDiscount)}</span>
                            </div>
                        )}
                        {promoDiscount > 0 && (
                            <div className="flex justify-between text-sm text-purple-600 dark:text-purple-400">
                                <span>Promo ({promoInfo!.code})</span>
                                <span>-{formatCurrency(promoDiscount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end pt-1 border-t border-slate-200 dark:border-slate-700">
                            <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(cartTotal)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isCheckingOut}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
                    >
                        {isCheckingOut ? 'Processing...' : 'Charge Order'}
                    </button>
                </div>
            </div>

            {/* Add-ons Selection Modal */}
            {showAddonModal && selectedMenuItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Customize {selectedMenuItem.name}
                            </h3>
                            <button
                                onClick={() => setShowAddonModal(false)}
                                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
                            {availableAddonsForItem.map((addon) => {
                                const isSelected = !!selectedAddons[addon.id];
                                return (
                                    <button
                                        key={addon.id}
                                        onClick={() => handleAddonToggle(addon.id)}
                                        className={`w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all ${isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                {isSelected && '✓'}
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">{addon.name}</span>
                                        </div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">+{formatCurrency(addon.price)}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={confirmAddonSelection}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Add to Order – {formatCurrency(
                                selectedMenuItem.price + Object.keys(selectedAddons).reduce((sum, id) => {
                                    return sum + (addOns.find(a => a.id === parseInt(id))?.price || 0);
                                }, 0)
                            )}
                        </button>
                    </Card>
                </div>
            )}

        </div>
    );
}
