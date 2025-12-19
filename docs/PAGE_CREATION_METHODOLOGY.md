# PAGE CREATION METHODOLOGY - MB.MD PROTOCOL v9.2
**Date:** November 20, 2025  
**Purpose:** Standardized process for creating new pages in Mundo Tango

---

## 🎯 OVERVIEW

After analyzing 323 existing pages, we've identified clear patterns for page creation. This methodology ensures consistency, maintainability, and adherence to Mundo Tango architecture.

---

## 📊 RESEARCH FINDINGS

### Page Pattern Statistics:
- **Layout Patterns:**
  - 79 pages use AppLayout (standard)
  - 12 pages use AdminLayout (admin features)
  
- **Data Fetching:**
  - 491 useQuery calls (React Query everywhere!)
  - 319 useMutation calls (data mutations)
  
- **Forms:**
  - 374 Form components (form-heavy application)
  - 22 useForm hooks (react-hook-form integration)
  
- **Navigation:**
  - 194 Link components (wouter routing)
  - 86 useLocation hooks (route awareness)
  
- **UI Components:**
  - 3,860 Card usages (card-based design)
  - 1,024 Button usages
  - 422 Table usages (data display)
  - 244 Dialog usages (modals)
  
- **State Management:**
  - 728 useState (local state)
  - 74 useEffect (side effects)
  - 44 useRef (refs)

---

## 🏗️ PAGE ARCHETYPES

Based on research, pages fall into these categories:

### 1. **Data Display Page** (Most Common)
**Examples:** EventsPage, HomePage, ProfilePage

**Structure:**
```tsx
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/layouts/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DataDisplayPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/resource'],
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Page Title</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map(item => (
            <Card key={item.id}>
              {/* Card content */}
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
```

**Key Elements:**
- AppLayout wrapper
- useQuery for data fetching
- Card-based layout
- Responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Loading state

---

### 2. **Form/Creation Page**
**Examples:** EventCreationPage, ProfileEditPage

**Structure:**
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppLayout } from '@/layouts/AppLayout';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { insertSchema, type InsertType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function FormCreationPage() {
  const queryClient = useQueryClient();
  
  const form = useForm<InsertType>({
    resolver: zodResolver(insertSchema),
    defaultValues: {
      // Set defaults
    }
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: InsertType) => {
      return await apiRequest('/api/resource', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resource'] });
      // Navigate or show toast
    }
  });
  
  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Create Resource</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}>
            <FormField
              control={form.control}
              name="fieldName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Label</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter value" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
```

**Key Elements:**
- useForm with zodResolver (form validation)
- useMutation for data creation
- queryClient.invalidateQueries (cache invalidation)
- Form component from shadcn
- Loading state on button

---

### 3. **Detail/View Page**
**Examples:** EventDetailPage, ProfilePage

**Structure:**
```tsx
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { AppLayout } from '@/layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DetailPage() {
  const { id } = useParams();
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/resource', id],
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Not found</div>;
  
  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>{data.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Detail content */}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
```

**Key Elements:**
- useParams for route params
- useQuery with ID
- Not found handling
- Card-based layout
- Max-width container (max-w-4xl)

---

### 4. **Admin/Dashboard Page**
**Examples:** AdminDashboard, UserManagement

**Structure:**
```tsx
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Button variant="ghost">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
```

**Key Elements:**
- AdminLayout (admin-specific layout)
- Table component for data display
- Action buttons in table rows

---

## 🛠️ STANDARD PAGE CREATION WORKFLOW

### Step 1: Define Page Type
Identify which archetype your page fits:
- Data Display (list, gallery, feed)
- Form/Creation (create, edit, input)
- Detail/View (show single item)
- Admin/Dashboard (admin features, tables)

### Step 2: Create File
```bash
# Location: client/src/pages/{category}/{PageName}Page.tsx
# Example: client/src/pages/events/EventsGalleryPage.tsx
```

### Step 3: Implement using Template
Use the appropriate archetype template from above

### Step 4: Register Route
Add to `client/src/App.tsx`:

```tsx
import EventsGalleryPage from '@/pages/events/EventsGalleryPage';

// In Router component:
<Route path="/events/gallery" component={EventsGalleryPage} />
```

### Step 5: Add Navigation (if needed)
If page needs navigation link:

```tsx
import { Link } from 'wouter';

<Link href="/events/gallery">
  <Button>View Gallery</Button>
</Link>
```

### Step 6: Create API Endpoint (if needed)
If page requires new API:

```typescript
// server/routes.ts
app.get('/api/events/gallery', async (req, res) => {
  const events = await storage.getEventGallery();
  res.json(events);
});
```

### Step 7: Update Database Schema (if needed)
If page requires new data model:

```typescript
// shared/schema.ts
export const eventGallery = pgTable('event_gallery', {
  id: serial("id").primaryKey(),
  // ... fields
});
```

Run: `npm run db:push --force`

### Step 8: Add Tests
Create Playwright test:

```typescript
// tests/e2e/events-gallery.spec.ts
test('events gallery page', async ({ page }) => {
  await page.goto('/events/gallery');
  await expect(page.getByRole('heading', { name: 'Events Gallery' })).toBeVisible();
});
```

---

## 📐 DESIGN GUIDELINES

### Layout Hierarchy:
1. **AppLayout** → Standard pages
2. **AdminLayout** → Admin-only pages
3. **DashboardLayout** → (Not used yet, reserved for future)

### Spacing:
- Container: `container mx-auto p-6`
- Max width: `max-w-4xl` (detail pages), `max-w-2xl` (forms)
- Grid gap: `gap-4` or `gap-6`

### Component Usage:
- **Card** → Primary content container (3,860 usages)
- **Button** → Actions (1,024 usages)
- **Table** → Data display (422 usages)
- **Dialog** → Modals (244 usages)

### Data Fetching:
- **ALWAYS** use React Query (useQuery, useMutation)
- **ALWAYS** invalidate cache after mutations
- **ALWAYS** show loading states

---

## ✅ QUALITY CHECKLIST

Before completing page:

- [ ] Uses appropriate archetype template
- [ ] Uses correct layout (AppLayout/AdminLayout)
- [ ] Data fetching with React Query
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Form validation (if form page)
- [ ] Cache invalidation (if mutation)
- [ ] Responsive design (mobile-first)
- [ ] Route registered in App.tsx
- [ ] API endpoint created (if needed)
- [ ] Database schema updated (if needed)
- [ ] Playwright test created
- [ ] data-testid attributes added
- [ ] Follows MT Ocean theme (design_guidelines.md)

---

## 🚀 AUTOMATED PAGE GENERATION (Future)

**Goal:** Mr. Blue generates pages from natural language

**Input:**
```
"Create an events gallery page with card-based layout, infinite scroll, and filter by date"
```

**Output:**
1. Page component (EventsGalleryPage.tsx)
2. Route registration (App.tsx update)
3. API endpoint (if needed)
4. Database schema (if needed)
5. Playwright test

**Implementation:** Phase 3 of MB.MD Protocol v9.2

---

## 📚 REFERENCES

- **React Query:** https://tanstack.com/query/latest
- **shadcn/ui:** https://ui.shadcn.com/
- **Wouter:** https://github.com/molefrog/wouter
- **Zod:** https://zod.dev/
- **Playwright:** https://playwright.dev/

---

**Version:** 1.0.0  
**Last Updated:** November 20, 2025  
**Status:** ✅ Research Complete, Ready for Implementation
