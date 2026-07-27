import React, { useState } from "react";
import { clsx } from "clsx";
import { Plus, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MOCK_CATEGORIES } from "@/data";
import type { Category } from "@/types";

const COLOR_PALETTE = [
  "#10B981", "#F59E0B", "#06B6D4", "#8B5CF6", "#F43F5E", "#EC4899",
  "#6366F1", "#D946EF", "#14B8A6", "#EAB308", "#3B82F6", "#EF4444",
];

/**
 * Categories page — manage system and custom expense categories.
 * Route: /categories
 */
export const CategoriesPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);

  const systemCategories = MOCK_CATEGORIES.filter((c) => c.isSystem);
  const customCategories = MOCK_CATEGORIES.filter((c) => !c.isSystem);

  const handleEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedColor(cat.color);
    setShowCreateModal(true);
  };

  const handleDelete = (cat: Category) => {
    setSelectedCategory(cat);
    setShowDeleteDialog(true);
  };

  const CategoryCard: React.FC<{ category: Category }> = ({ category }) => (
    <div className="glass rounded-xl p-5 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-150 group">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="size-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <span className="text-lg font-bold" style={{ color: category.color }}>
            {category.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {category.name}
          </h3>
          <p className="text-xs text-text-muted">
            {category.transactionCount} Transactions
          </p>
        </div>
      </div>
      <p className="text-lg font-bold text-text-primary tabular-nums mb-3">
        ${category.totalSpent.toLocaleString()}
      </p>
      {category.budgetLimit && (
        <p className="text-xs text-text-muted mb-3">
          Budget: ${category.budgetLimit.toLocaleString()}/mo
        </p>
      )}
      {!category.isSystem && (
        <div className="flex items-center gap-2 pt-3 border-t border-border-card/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Pencil className="size-3.5" />}
            onClick={() => handleEdit(category)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error/70 hover:text-error"
            leftIcon={<Trash2 className="size-3.5" />}
            onClick={() => handleDelete(category)}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Categories</h2>
          <p className="text-sm text-text-secondary mt-1">
            Organize your expenses into categories
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={() => { setSelectedCategory(null); setShowCreateModal(true); }}>
          Create Category
        </Button>
      </div>

      {/* System Categories */}
      <section>
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
          System Categories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Custom Categories */}
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
            onAction={() => setShowCreateModal(true)}
            iconColor="text-secondary"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={selectedCategory ? "Edit Category" : "Create Category"}
        description="Define a name, color, and optional budget for this category."
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowCreateModal(false); }}>
          <Input
            label="Category Name"
            type="text"
            placeholder="e.g. Software Subscriptions"
            defaultValue={selectedCategory?.name}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={clsx(
                    "size-8 rounded-full transition-all",
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-offset-bg-app ring-primary scale-110"
                      : "hover:scale-110",
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
          <Input
            label="Monthly Budget (Optional)"
            type="number"
            placeholder="$0.00"
            step="0.01"
            min="0"
            defaultValue={selectedCategory?.budgetLimit?.toString()}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => setShowDeleteDialog(false)}
        title={`Delete "${selectedCategory?.name}"?`}
        description={`This will permanently delete this category. ${
          selectedCategory && selectedCategory.transactionCount > 0
            ? `${selectedCategory.transactionCount} transactions will be reassigned to "General".`
            : ""
        }`}
        confirmLabel="Confirm Delete"
      />
    </div>
  );
};
