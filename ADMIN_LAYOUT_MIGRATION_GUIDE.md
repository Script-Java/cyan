# Admin Layout Migration Guide

## Overview

A new `AdminLayout` component has been created that provides:

- Consistent header (Header component)
- Consistent navigation bar (AdminNavbar component)
- **Desktop**: Sidebar with navigation grid (visible at 1024px+)
- **Mobile**: Floating menu button with navigation grid overlay

## Pages Already Updated

The following pages have been successfully updated to use `AdminLayout`:

- ✅ `AdminDashboard.tsx`
- ✅ `AdminOrders.tsx`
- ✅ `AdminProducts.tsx`
- ✅ `AdminProofs.tsx`
- ✅ `AdminFinance.tsx`

## How to Update Remaining Pages

### For Pages Using Simple Header + AdminNavbar Pattern:

**Before:**

```tsx
import Header from "@/components/Header";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminPage() {
  return (
    <>
      <Header />
      <AdminNavbar />
      <main className="min-h-screen bg-black text-white">
        <div>Page content here</div>
      </main>
    </>
  );
}
```

**After:**

```tsx
import AdminLayout from "@/components/AdminLayout";

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="w-full">
        <div>Page content here</div>
      </div>
    </AdminLayout>
  );
}
```

### Pages That Need Updating:

1. **AdminAnalytics.tsx**
   - Currently uses: `Header`, `AdminSidebar`, `MobileAdminPanel`
   - Replace all three with `AdminLayout`
   - Remove the flex layout and AdminSidebar wrapper

2. **AdminSettings.tsx**
   - Currently uses: `Header`, `AdminSidebar`, `MobileAdminPanel`
   - Same pattern as AdminAnalytics

3. **Customers.tsx**
   - Currently uses: `Header`, `AdminSidebar`, `MobileAdminPanel`
   - Same pattern as AdminAnalytics

4. **AdminProductImport.tsx** (if exists)
   - Check imports and update accordingly

5. **AdminSupport.tsx** (if exists)
   - Check imports and update accordingly

6. **StoreCreditAdmin.tsx** (if exists)
   - Check imports and update accordingly

## New Navigation Components

### AdminLayout

Wrapper component that provides:

- Header + AdminNavbar at the top
- Desktop sidebar navigation (on lg screens)
- Mobile floating menu button
- Main content area

```tsx
<AdminLayout>
  <div className="w-full">{/* Your page content */}</div>
</AdminLayout>
```

### AdminNavigationGrid

Grid-based navigation component with 9 items:

- Home, Orders, Proofs, Products
- Customers, Finance, Analytics
- Settings, Logout

Can be used standalone for custom layouts.

## Navigation Items Available

The navigation grid includes:

- 🏠 **Home** - `/admin`
- 📦 **Orders** - `/admin/orders`
- ✅ **Proofs** - `/admin/proofs`
- 📷 **Products** - `/admin/products`
- 👥 **Customers** - `/admin/customers`
- 💰 **Finance** - `/admin/finance`
- 📊 **Analytics** - `/admin/analytics`
- ⚙️ **Settings** - `/admin/settings`
- 🚪 **Logout** - Handles logout and redirects to login

## Styling Notes

- The layout maintains the existing black background (`bg-black`)
- White text color (`text-white`)
- Uses Tailwind CSS for styling
- Mobile-first responsive design
- Uses glassmorphism effects with backdrop blur

## Key Differences from Old Layout

| Feature          | Old                    | New                       |
| ---------------- | ---------------------- | ------------------------- |
| Header           | Separate import        | Built into AdminLayout    |
| Navigation       | Horizontal AdminNavbar | Navbar + Sidebar grid     |
| Mobile Nav       | MobileAdminPanel       | Built-in floating menu    |
| Consistency      | Manual in each page    | Automatic via AdminLayout |
| Code Duplication | High                   | Low                       |

## Testing

After updating a page:

1. Navigate to the page
2. Check desktop view - sidebar should be visible on lg+ screens
3. Check mobile view - floating menu button should appear
4. Click menu items to ensure navigation works
5. Check that the page header and content still displays correctly

## Rollback

If you need to revert a page to the old layout:

1. Replace `AdminLayout` wrapper with `Header` and `AdminNavbar`
2. Add back `<main>` and `</>` tags
3. Remove `<div className="w-full">` wrapper

## Questions?

Refer to the implemented pages (AdminDashboard, AdminOrders, etc.) for reference implementations.
