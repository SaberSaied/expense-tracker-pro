import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import { toast } from "sonner";
import { Plus, FolderPlus, Pencil, Trash2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { categoriesApi } from "@/services/categories";
import { ApiError } from "@/services/api";
import type { ApiCategory } from "@/services/categories";

const COLOR_PALETTE = [
  "#10B981", "#F59E0B", "#06B6D4", "#8B5CF6", "#F43F5E", "#EC4899",
  "#6366F1", "#D946EF", "#14B8A6", "#EAB308", "#3B82F6", "#EF4444",
];

const ICON_OPTIONS = [
  { value: "Tag", label: "\uD83C\uDFF7\uFE0F Tag" },
  { value: "UtensilsCrossed", label: "\uD83C\uDF74 Dining" },
  { value: "Car", label: "\uD83D\uDE97 Car" },
  { value: "Home", label: "\uD83C\uDFE0 Home" },
  { value: "Zap", label: "\u26A1 Utilities" },
  { value: "Film", label: "\uD83C\uDFAC Film" },
  { value: "Heart", label: "\u2764\uFE0F Health" },
  { value: "Cloud", label: "\u2601\uFE0F Cloud" },
  { value: "Wine", label: "\uD83C\uDF77 Wine" },
  { value: "ShoppingBag", label: "\uD83D\uDED2 Shopping" },
  { value: "Briefcase", label: "\uD83D\uDCBC Work" },
  { value: "GraduationCap", label: "\uD83C\uDF93 Education" },
  { value: "Plane", label: "\u2708\uFE0F Travel" },
  { value: "Gift", label: "\uD83C\uDF81 Gift" },
  { value: "PawPrint", label: "\uD83D\uDC3E Pets" },
  { value: "Dumbbell", label: "\uD83D\uDCAA Fitness" },
];

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ApiCategory | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("Tag");
  const [formColor, setFormColor] = useState(COLOR_PALETTE[0]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search: wait 300ms after user stops typing
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = async (query?: string) => {
    try {
      const data = await categoriesApi.findAll(query);
      setCategories(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load categories";
      toast.error("Load failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  // Initial load and re-fetch on debounced query change
  useEffect(() => {
    fetchCategories(debouncedQuery || undefined);
  }, [debouncedQuery]);

  // Initial load on mount (no debouncedQuery yet — fetchCategories() called by debounce effect)

  const systemCategories = categories.filter((c) => c.isSystem);
  const customCategories = categories.filter((c) => !c.isSystem);

  const openCreateModal = () => {
    setSelectedCategory(null);
    setFormName("");
    setFormIcon("Tag");
    setFormColor(COLOR_PALETTE[0]);
    setShowCreateModal(true);
  };

  const openEditModal = (cat: ApiCategory) => {
    setSelectedCategory(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon);
    setFormColor(cat.color);
    setShowCreateModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setFormSubmitting(true);
    try {
      if (selectedCategory) {
        await categoriesApi.update(selectedCategory.id, {
          name: formName.trim(),
          icon: formIcon,
          color: formColor,
        });
        toast.success("Category updated");
      } else {
        await categoriesApi.create({
          name: formName.trim(),
          icon: formIcon,
          color: formColor,
        });
        toast.success("Category created");
      }
      setShowCreateModal(false);
      await fetchCategories();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save category";
      toast.error("Save failed", { description: message });
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDeleteDialog = (cat: ApiCategory) => {
    setSelectedCategory(cat);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory || deleteLoading) return;

    setDeleteLoading(true);
    try {
      await categoriesApi.delete(selectedCategory.id);
      toast.success("Category \"" + selectedCategory.name + "\" deleted");
      setShowDeleteDialog(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete category";
      toast.error("Delete failed", { description: message });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-60 mt-2" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="size-11 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 mb-3" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Categories</h2>
          <p className="text-sm text-text-secondary mt-1">
            Organize your expenses into categories
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full sm:w-56 rounded-lg border border-border-card bg-bg-app pl-9 pr-8 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={openCreateModal}>
            Create Category
          </Button>
        </div>
      </div>

      {systemCategories.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
            System Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} onEdit={openEditModal} onDelete={openDeleteDialog} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
          Custom Categories
        </h3>
        {customCategories.length === 0 ? (
          <EmptyState
            icon={FolderPlus}
            title="No Custom Categories Yet"
            description="Create custom categories tailored to your unique financial tracking needs."
            actionLabel="+ Create Your First Category"
            onAction={openCreateModal}
            iconColor="text-secondary"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} onEdit={openEditModal} onDelete={openDeleteDialog} />
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={selectedCategory ? "Edit Category" : "Create Category"}
        description="Define a name, color, and optional icon for this category."
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <Input
            label="Category Name"
            type="text"
            placeholder="e.g. Software Subscriptions"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormColor(color)}
                  className={clsx(
                    "size-8 rounded-full transition-all",
                    formColor === color
                      ? "ring-2 ring-offset-2 ring-offset-bg-app ring-primary scale-110"
                      : "hover:scale-110",
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={"Select color " + color}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Icon</label>
            <select
              value={formIcon}
              onChange={(e) => setFormIcon(e.target.value)}
              className="w-full rounded-lg border border-border-card bg-bg-app px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={formSubmitting}>
              {selectedCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={"Delete \"" + (selectedCategory?.name ?? "") + "\"?"}
        description="This will permanently delete this category. Any transactions using this category may be affected."
        confirmLabel="Confirm Delete"
      />
    </div>
  );
};

interface CategoryCardProps {
  category: ApiCategory;
  onEdit: (cat: ApiCategory) => void;
  onDelete: (cat: ApiCategory) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => (
  <div className="glass rounded-xl p-5 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-150 group">
    <div className="flex items-center gap-3 mb-4">
      <div
        className="size-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: category.color + "20" }}
      >
        <span className="text-lg font-bold" style={{ color: category.color }}>
          {category.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary truncate">
          {category.name}
        </h3>
        <p className="text-xs text-text-muted">
          {category.isSystem ? "System" : "Custom"}
        </p>
      </div>
    </div>

    {!category.isSystem && (
      <div className="flex items-center gap-2 pt-3 border-t border-border-card/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Pencil className="size-3.5" />}
          onClick={() => onEdit(category)}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-error/70 hover:text-error"
          leftIcon={<Trash2 className="size-3.5" />}
          onClick={() => onDelete(category)}
        >
          Delete
        </Button>
      </div>
    )}
  </div>
);
