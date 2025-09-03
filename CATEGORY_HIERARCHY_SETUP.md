# Category Hierarchy Setup Guide

## Setting Up Parent-Child Category Relationships

The CMS already supports subcategories through the `parent_id` field in the categories table. Here's how to set up the category hierarchy for proper storefront navigation:

### Current Grit Collective Categories
Based on the database, you currently have these parent categories:
- **Apparel** (parent_id: null)
- **Wall Art** (parent_id: null) 
- **Accessories** (parent_id: null)

### Step 1: Create Subcategories

Use the Categories page in the admin to add subcategories. When creating a subcategory:

1. Go to `/dashboard/grit-collective/categories`
2. Click "Add Category"
3. Fill in the category details
4. **Important**: Select the parent category from the dropdown (this sets the `parent_id`)
5. Set appropriate sort order for display ordering

### Step 2: Recommended Subcategory Structure

For Grit Collective, consider this hierarchy:

**Apparel:**
- T-Shirts & Tees
- Hoodies & Sweatshirts
- Tank Tops
- Long Sleeve Shirts

**Wall Art:**
- Motivational Prints
- Botanical Art
- Abstract Art
- Custom Designs

**Accessories:**
- Candles & Vessels
- Stickers & Decals
- Keychains
- Personalized Items

### Step 3: Database Structure

The categories table supports this with these key fields:
```sql
- id (UUID)
- name (text)
- slug (text)
- parent_id (UUID, references categories.id)
- sort_order (integer)
- brand_profile_id (UUID)
```

### Step 4: API Support

The categories API at `/api/brands/[brand]/categories` already:
- ✅ Fetches all categories with parent_id field
- ✅ Includes sort_order for proper ordering
- ✅ Has CORS headers for storefront access
- ✅ Returns data in storefront-compatible format

### Step 5: Storefront Integration

For the storefront to display the hierarchy properly, it should:

1. **Group categories by parent_id**:
```javascript
const categorizeHierarchy = (categories) => {
  const parents = categories.filter(cat => !cat.parent_id)
  const children = categories.filter(cat => cat.parent_id)
  
  return parents.map(parent => ({
    ...parent,
    children: children
      .filter(child => child.parent_id === parent.id)
      .sort((a, b) => a.sort_order - b.sort_order)
  })).sort((a, b) => a.sort_order - b.sort_order)
}
```

2. **Fetch categories from CMS API**:
```javascript
const response = await fetch('https://content.grittysystems.com/api/brands/grit-collective/categories')
const { categories } = await response.json()
const hierarchicalCategories = categorizeHierarchy(categories)
```

3. **Display navigation structure**:
```jsx
{hierarchicalCategories.map(parent => (
  <div key={parent.id}>
    <h3>{parent.name}</h3>
    {parent.children.length > 0 && (
      <ul>
        {parent.children.map(child => (
          <li key={child.id}>
            <Link href={`/category/${child.slug}`}>
              {child.name}
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
))}
```

### Step 6: Testing the Setup

1. Add a few subcategories through the admin interface
2. Verify they appear in the API response with correct parent_id
3. Test the storefront navigation displays the hierarchy
4. Ensure category pages work for both parent and child categories

### Notes for Admin Agent

When setting up categories:
- Always set meaningful sort_order values (0, 10, 20, etc.) for easy reordering
- Keep category names consistent with your product catalog
- Use descriptive slugs for SEO-friendly URLs
- Consider customer shopping patterns when organizing hierarchy
- Test category navigation flow from customer perspective

The API structure is already built to support this - you just need to create the subcategories through the admin interface and update the storefront to display the hierarchical structure.