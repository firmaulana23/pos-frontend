'use client';

import { useEffect, useState } from 'react';
import { adminMenuAPI, MenuItem, Category, stockAPI, RawMaterial, MenuItemMaterial } from '@/app/lib/api';
import { Card, LoadingSkeleton, Button } from '@/app/components/ui';
import { useProtectedRoute } from '@/app/lib/auth';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function MenuPage() {
  const { isLoading: routeLoading } = useProtectedRoute();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: 0,
    price: 0,
    cogs: 0,
    is_available: true,
  });

  // Recipe Modal States
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipeItem, setSelectedRecipeItem] = useState<MenuItem | null>(null);
  const [recipeMaterials, setRecipeMaterials] = useState<MenuItemMaterial[]>([]);
  const [availableRawMaterials, setAvailableRawMaterials] = useState<RawMaterial[]>([]);
  const [recipeFormData, setRecipeFormData] = useState({ raw_material_id: 0, quantity: 0 });
  const [recipeLoading, setRecipeLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await adminMenuAPI.getCategories();
      setCategories(response);
      if (response.length > 0 && selectedCategory === 0) {
        setSelectedCategory(response[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  // Fetch menu items
  const fetchItems = async (pageNum: number, currentSearch?: string) => {
    try {
      setLoading(true);
      setError(null);

      const categoryId = selectedCategory === 'all' ? undefined : (selectedCategory as number);
      const activeSearch = currentSearch !== undefined ? currentSearch : searchTerm;
      const response = await adminMenuAPI.getMenuItems(categoryId, pageNum, 10, activeSearch || undefined);

      setItems(response.data);
      setTotalPages(response.total ? Math.ceil(response.total / 10) : 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems(page, searchTerm);
    }, 400); // debounce API calls
    return () => clearTimeout(timer);
  }, [page, selectedCategory, searchTerm]);

  const handleCreate = async () => {
    if (!formData.name || !formData.category_id || formData.price <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await adminMenuAPI.createMenuItem({
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        price: formData.price,
        cogs: formData.cogs,
        is_available: formData.is_available,
      });

      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        category_id: selectedCategory === 'all' ? 0 : (selectedCategory as number),
        price: 0,
        cogs: 0,
        is_available: true,
      });
      await fetchItems(1);
      setPage(1);
    } catch (err: any) {
      setError(err.message || 'Failed to create menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem || !formData.name || !formData.category_id || formData.price <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await adminMenuAPI.updateMenuItem(selectedItem.id, {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        price: formData.price,
        cogs: formData.cogs,
        is_available: formData.is_available,
      });

      setShowEditModal(false);
      setSelectedItem(null);
      setFormData({
        name: '',
        description: '',
        category_id: 0,
        price: 0,
        cogs: 0,
        is_available: true,
      });
      await fetchItems(page);
    } catch (err: any) {
      setError(err.message || 'Failed to update menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      setDeletingId(id);
      setError(null);
      await adminMenuAPI.deleteMenuItem(id);
      await fetchItems(page);
    } catch (err: any) {
      setError(err.message || 'Failed to delete menu item');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      setError(null);
      await adminMenuAPI.updateMenuItem(item.id, {
        is_available: !item.is_available,
      });
      await fetchItems(page);
    } catch (err: any) {
      setError(err.message || 'Failed to update menu item');
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      category_id: selectedCategory === 'all' ? 0 : (selectedCategory as number),
      price: 0,
      cogs: 0,
      is_available: true,
    });
    setShowCreateModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      category_id: item.category_id,
      price: item.price,
      cogs: item.cogs,
      is_available: item.is_available,
    });
    setSelectedItem(item);
    setShowEditModal(true);
  };

  // Recipe Functions
  const openRecipeModal = async (item: MenuItem) => {
    setSelectedRecipeItem(item);
    setShowRecipeModal(true);
    setRecipeLoading(true);
    setError(null);
    setRecipeFormData({ raw_material_id: 0, quantity: 0 });
    try {
      const [rawMatRes, recipeMatRes] = await Promise.all([
        stockAPI.getRawMaterials(),
        stockAPI.getMenuItemMaterials(item.id)
      ]);
      setAvailableRawMaterials(rawMatRes || []);
      setRecipeMaterials(recipeMatRes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load recipe data');
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleAddRecipeMaterial = async () => {
    if (!selectedRecipeItem || !recipeFormData.raw_material_id || recipeFormData.quantity <= 0) {
      setError('Please select a material and enter a valid positive quantity');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await stockAPI.addMenuItemMaterial({
        menu_item_id: selectedRecipeItem.id,
        raw_material_id: recipeFormData.raw_material_id,
        quantity_used: recipeFormData.quantity
      });
      // refresh materials list
      const recipeMatRes = await stockAPI.getMenuItemMaterials(selectedRecipeItem.id);
      setRecipeMaterials(recipeMatRes || []);
      setRecipeFormData({ raw_material_id: 0, quantity: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to add recipe material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRecipeMaterial = async (rawMaterialId: number) => {
    if (!selectedRecipeItem) return;
    try {
      setSubmitting(true);
      setError(null);
      await stockAPI.removeMenuItemMaterial(selectedRecipeItem.id, rawMaterialId);
      // refresh materials list
      const recipeMatRes = await stockAPI.getMenuItemMaterials(selectedRecipeItem.id);
      setRecipeMaterials(recipeMatRes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to remove recipe material');
    } finally {
      setSubmitting(false);
    }
  };

  // Client-side filtering is removed in favor of backend search queries
  const filteredItems = items;

  if (routeLoading) {
    return <LoadingSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Menu Items</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage and view all menu items</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-500 hover:bg-blue-600">
          + Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Category filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
                setSelectedCategory(val);
                setPage(1);
              }}
              className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Refresh button */}
          <Button
            onClick={() => fetchItems(page)}
            variant="secondary"
            className="whitespace-nowrap"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Category
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  Price
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  COGS
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Margin
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="inline-block">
                      <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-3 text-slate-600 dark:text-slate-400">Loading menu items...</p>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-slate-600 dark:text-slate-400">No menu items found</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {item.name}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {item.description || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {item.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-50">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-400">
                      {formatCurrency(item.cogs)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {item.margin?.toFixed(1) || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${item.is_available
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200'
                          }`}
                      >
                        {item.is_available ? '✓ Available' : '✕ Hidden'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openRecipeModal(item)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900 rounded transition-colors"
                      >
                        🍲 Recipe
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                      >
                        {deletingId === item.id ? '⏳' : '🗑'} Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredItems.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Add Menu Item
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  placeholder="Item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  placeholder="Item description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                >
                  <option value={0}>Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    COGS *
                  </label>
                  <input
                    type="number"
                    value={formData.cogs}
                    onChange={(e) => setFormData({ ...formData, cogs: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available-create"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="available-create" className="text-sm text-slate-700 dark:text-slate-300">
                  Available for sale
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? '⏳ Adding...' : 'Add Item'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Edit Menu Item
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  placeholder="Item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  placeholder="Item description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    COGS *
                  </label>
                  <input
                    type="number"
                    value={formData.cogs}
                    onChange={(e) => setFormData({ ...formData, cogs: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available-edit"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="available-edit" className="text-sm text-slate-700 dark:text-slate-300">
                  Available for sale
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? '⏳ Saving...' : 'Save Changes'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Recipe Modal */}
      {showRecipeModal && selectedRecipeItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Recipe for {selectedRecipeItem.name}
                </h3>
                <p className="text-sm text-slate-500">Manage required raw materials per portion</p>
              </div>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4">
              {/* Add Material Form */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg flex items-end gap-3 border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Raw Material *
                  </label>
                  <select
                    value={recipeFormData.raw_material_id}
                    onChange={(e) => setRecipeFormData({ ...recipeFormData, raw_material_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  >
                    <option value={0}>Select a material...</option>
                    {availableRawMaterials.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.name} ({mat.unit_of_measure})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Qty Used *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={recipeFormData.quantity || ''}
                    onChange={(e) => setRecipeFormData({ ...recipeFormData, quantity: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleAddRecipeMaterial}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? '...' : '+ Add'}
                </button>
              </div>

              {/* Recipe List Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Material</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Quantity Used</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeLoading ? (
                      <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Loading recipe...</td></tr>
                    ) : recipeMaterials.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No materials added yet.</td></tr>
                    ) : (
                      recipeMaterials.map((rm) => (
                        <tr key={rm.raw_material_id} className="border-t border-slate-200 dark:border-slate-700">
                          <td className="px-4 py-3 text-slate-900 dark:text-slate-50">
                            {rm.raw_material?.name} <span className="text-slate-500 text-xs">({rm.raw_material?.unit_of_measure})</span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                            {rm.quantity_used}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveRecipeMaterial(rm.raw_material_id)}
                              disabled={submitting}
                              className="text-red-500 hover:text-red-600 font-medium px-2 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded transition-colors disabled:opacity-50 text-xs"
                            >
                              ✕ Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowRecipeModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Close Formulation
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
