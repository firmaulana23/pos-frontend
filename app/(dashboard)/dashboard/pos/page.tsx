'use client';

import { useEffect, useState } from 'react';
import { menuAPI, transactionsAPI, Category, MenuItem } from '@/app/lib/api';
import { Card } from '@/app/components/ui';

interface AddOn {
    id: number;
    name: string;
    price: number;
    menu_item_id: number | null;
}

interface CartItem {
    id: string; // unique string id for frontend handling of duplicate menu items with different addons
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    // Add-ons Modal State
    const [showAddonModal, setShowAddonModal] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [availableAddonsForItem, setAvailableAddonsForItem] = useState<AddOn[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({}); // addon_id -> quantity

    // Checkout State
    const [customerName, setCustomerName] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);

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
            setAddOns(addonsRes.data || addonsRes || []);
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
            // Ensure we hit the public endpoint with limit params from the api.ts signature
            const response: any = await menuAPI.getMenuItems(catId);
            // Public menu returns `{ data: [] }` wrapper by convention usually
            setMenuItems(response.data || response || []);
        } catch (err: any) {
            setError('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (item: MenuItem) => {
        // Check if this item has applicable add-ons (either global or specific to this item)
        const applicableAddons = addOns.filter(
            (addon) => addon.menu_item_id === null || addon.menu_item_id === item.id
        );

        if (applicableAddons.length > 0) {
            setSelectedMenuItem(item);
            setAvailableAddonsForItem(applicableAddons);
            setSelectedAddons({});
            setShowAddonModal(true);
        } else {
            // Direct add to cart
            addToCart(item, []);
        }
    };

    const handleAddonToggle = (addonId: number) => {
        setSelectedAddons((prev) => {
            const newSelections = { ...prev };
            if (newSelections[addonId]) {
                delete newSelections[addonId]; // toggle off
            } else {
                newSelections[addonId] = 1; // primary toggle on with quantity 1
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
        // Generate an ID based on item ID and specifically selected add-ons so that we can stack matching exact configs
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

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            setIsCheckingOut(true);
            setError(null);

            // Map our CartItem[] interface to the exact endpoint payload
            const orderPayload = {
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

            await transactionsAPI.createTransaction(orderPayload);

            // Clean up UI on success
            setCart([]);
            setCustomerName('');
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
                {/* Category Filters */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all'
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
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.id
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
                    ) : menuItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <span className="text-4xl mb-2">🍽️</span>
                            <p>No items found in this category</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                            {menuItems.map((item) => (
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
            <div className="w-96 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Current Order</h2>
                    {checkoutSuccess && (
                        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            ✓ Payment Success
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
                                            (cartItem.base_price + cartItem.add_ons.reduce((s, a) => s + (a.price), 0)) * cartItem.quantity
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Area */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl space-y-3">
                    <div>
                        <input
                            type="text"
                            placeholder="Customer Name (Optional)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 text-sm"
                        />
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-700 pt-3">
                        <span className="font-medium text-slate-900 dark:text-white">Total</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(cartSubtotal)}
                        </span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isCheckingOut}
                        className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
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
                            Add to Order - {formatCurrency(
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
