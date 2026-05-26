# Image Viewer Modal - Complete Implementation Guide

**Version:** 1.0  
**Last Updated:** January 12, 2026  
**Status:** Production Ready

---

## Overview

The Image Viewer Modal is a full-screen lightbox component designed to display employee profile photos and other images with zoom, download, and keyboard control functionality. This component follows design guidelines for modal interactions and provides an enhanced user experience for viewing images.

---

## Features

✅ **Full-Screen Display** - Image displayed in a dedicated overlay with backdrop blur  
✅ **Zoom Controls** - Zoom in/out from 50% to 200% in 25% increments  
✅ **Download Functionality** - Download images with proper filename formatting  
✅ **Keyboard Support** - ESC key to close modal  
✅ **Smooth Animations** - Fade-in and zoom-in entrance animations  
✅ **Dark Mode Support** - Proper styling for light and dark themes  
✅ **Responsive Design** - Works on all screen sizes  
✅ **High Z-Index** - z-[150] ensures it appears above all other UI elements

---

## Component Specifications

### File Location
`/src/app/components/ImageViewerModal.tsx`

### Props Interface

```typescript
interface ImageViewerModalProps {
  isOpen: boolean;          // Controls modal visibility
  onClose: () => void;      // Callback when modal closes
  imageUrl: string;         // URL of image to display
  employeeName: string;     // Name for title and download filename
}
```

### Visual Design

**Modal Structure:**
- Backdrop: `bg-black/80` with `backdrop-blur-sm`
- Z-Index: `z-[150]` (above modals at z-50 and dropdowns at z-[100])
- Max Width: `max-w-5xl` (80rem / 1280px)
- Border Radius: `rounded-lg` (8px top corners for header, bottom for image container)

**Header:**
- Background: White (light) / Neutral-900 (dark)
- Height: Auto (padding: 12px vertical)
- Border Bottom: 1px neutral-200/neutral-800
- Content: Employee name (base text, semibold) + "Profile Photo" subtitle (xs text, neutral-500)

**Controls:**
- Zoom Out Button: 32x32px (w-8 h-8)
- Zoom Display: 45px min-width, centered text
- Zoom In Button: 32x32px (w-8 h-8)
- Divider: 1px x 20px vertical line
- Download Button: 32x32px (w-8 h-8)
- Close Button: 32x32px (w-8 h-8)

**Image Container:**
- Background: Neutral-100 (light) / Neutral-950 (dark)
- Padding: 24px (p-6)
- Max Height: `calc(100vh - 200px)` - allows space for header and hints
- Overflow: Auto (scrollable if image is large)
- Min Height: 400px

**Keyboard Hint:**
- Position: Below modal, centered
- Text: xs size, neutral-400/neutral-500
- KBD styling: `px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded text-[10px] font-mono`

---

## Usage Examples

### Basic Implementation

```typescript
import ImageViewerModal from '@/app/components/ImageViewerModal';

function EmployeePage() {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

  const handleAvatarClick = (imageUrl: string, employeeName: string) => {
    setSelectedImage({ url: imageUrl, name: employeeName });
    setShowImageViewer(true);
  };

  return (
    <>
      {/* Your employee content */}
      <img 
        src={employee.avatar}
        alt={employee.name}
        onClick={() => handleAvatarClick(employee.avatar, employee.name)}
        className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
      />

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={selectedImage?.url || ''}
        employeeName={selectedImage?.name || ''}
      />
    </>
  );
}
```

### List View Implementation

```typescript
{employee.avatar ? (
  <img
    src={employee.avatar}
    alt={employee.name}
    onClick={(e) => {
      e.stopPropagation(); // Prevent row click
      handleAvatarClick(employee.avatar!, employee.name);
    }}
    className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
  />
) : (
  <div className=\"w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0\">
    <User className=\"w-5 h-5 text-primary-600 dark:text-primary-400\" />
  </div>
)}
```

### Grid View Implementation

```typescript
{employee.avatar ? (
  <img
    src={employee.avatar}
    alt={employee.name}
    onClick={(e) => {
      e.stopPropagation(); // Prevent card click
      handleAvatarClick(employee.avatar!, employee.name);
    }}
    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
  />
) : (
  <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
    {employee.name.split(' ').map(n => n[0]).join('')}
  </div>
)}
```

### Table View Implementation

```typescript
{employee.avatar ? (
  <img
    src={employee.avatar}
    alt={employee.name}
    onClick={(e) => {
      e.stopPropagation(); // Prevent row click
      handleAvatarClick(employee.avatar!, employee.name);
    }}
    className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
  />
) : (
  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
    {employee.name.split(' ').map(n => n[0]).join('')}
  </div>
)}
```

---

## Interaction Patterns

### Opening the Modal

**Click on Avatar:**
1. User clicks on employee avatar image
2. Event stops propagation (prevents parent element click)
3. Selected image state is set with URL and employee name
4. Modal visibility state set to true
5. Modal animates in with fade + zoom effect

**Visual Feedback:**
- Avatar has `cursor-pointer` class
- Hover shows opacity change or ring effect
- Smooth transition on all hover states

### Zoom Functionality

**Zoom Levels:**
- Minimum: 50%
- Default: 100%
- Maximum: 200%
- Increment: 25%

**Controls:**
- Zoom Out button: Disabled at 50%
- Zoom In button: Disabled at 200%
- Smooth CSS transition: `transform 0.2s ease-in-out`

**State Management:**
```typescript
const [zoom, setZoom] = useState(100);

const handleZoomIn = () => {
  setZoom(prev => Math.min(prev + 25, 200));
};

const handleZoomOut = () => {
  setZoom(prev => Math.max(prev - 25, 50));
};
```

### Download Functionality

**Process:**
1. User clicks download button
2. Create temporary anchor element
3. Set href to image URL
4. Set download attribute with formatted filename
5. Programmatically click anchor
6. Remove anchor from DOM

**Filename Format:**
- Employee name with spaces replaced by underscores
- Appended with `_photo.jpg`
- Example: `Sarah_Johnson_photo.jpg`

```typescript
const handleDownload = () => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `${employeeName.replace(/\s+/g, '_')}_photo.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

### Closing the Modal

**Methods:**
1. Click Close (X) button
2. Click backdrop overlay
3. Press ESC key (future enhancement)

**Animation:**
- Reverse of opening animation
- Fade out + zoom out
- Duration: ~200ms

---

## Styling Guidelines

### Avatar Hover States

**List View (40x40px):**
```css
cursor-pointer
hover:ring-2
hover:ring-primary-500
transition-all
```

**Grid View (48x48px):**
```css
cursor-pointer  
hover:ring-2
hover:ring-primary-500
transition-all
```

**Table View (40x40px):**
```css
cursor-pointer
hover:ring-2
hover:ring-primary-500
transition-all
```

### Button States

**Default:**
```css
w-8 h-8
flex items-center justify-center
rounded-lg
border border-neutral-300 dark:border-neutral-700
hover:bg-neutral-100 dark:hover:bg-neutral-800
transition-colors
```

**Disabled:**
```css
opacity-50
cursor-not-allowed
```

### Animation Classes

**Modal Entrance:**
```css
animate-in
zoom-in-95
fade-in-0
```

**Backdrop Entrance:**
```css
animate-in
fade-in-0
```

---

## Accessibility

### Keyboard Support

**ESC Key:**
- Closes the modal
- Returns focus to triggering element (future enhancement)

**Tab Navigation:**
- Focus trap within modal (future enhancement)
- Tab through: Zoom Out → Zoom In → Download → Close

### Screen Reader Support

**ARIA Labels:**
- Close button: `aria-label="Close image viewer"`
- Zoom In: `aria-label="Zoom in"`
- Zoom Out: `aria-label="Zoom out"`
- Download: `aria-label="Download photo"`

**Announcements:**
- Modal open: "Image viewer opened, showing [Employee Name]'s profile photo"
- Zoom change: "Zoomed to [X]%"
- Modal close: "Image viewer closed"

### Focus Management

**On Open:**
- Focus moves to modal
- Previous focus saved

**On Close:**
- Focus returns to triggering avatar (future enhancement)

---

## Implementation Checklist

When integrating the Image Viewer Modal:

- [ ] Import ImageViewerModal component
- [ ] Add state for `showImageViewer` (boolean)
- [ ] Add state for `selectedImage` (object with url and name)
- [ ] Create `handleAvatarClick` function
- [ ] Add onClick handler to avatar images
- [ ] Add `e.stopPropagation()` to prevent parent clicks
- [ ] Add cursor-pointer and hover styles to avatars
- [ ] Render `<ImageViewerModal>` at end of component
- [ ] Test in all view modes (list, grid, table)
- [ ] Test keyboard navigation (ESC key)
- [ ] Test download functionality
- [ ] Test zoom controls
- [ ] Test dark mode styling

---

## Best Practices

### Do's ✓

1. **Stop Propagation** - Always use `e.stopPropagation()` when avatar is inside clickable parent
2. **Show Cursor** - Use `cursor-pointer` on all clickable avatars
3. **Visual Feedback** - Add hover states (ring, opacity, etc.)
4. **Proper Naming** - Use descriptive employee names for downloads
5. **High Z-Index** - Keep modal at z-[150] to appear above everything
6. **Test All Views** - Ensure functionality works in list, grid, and table views
7. **Handle Missing Images** - Always check if avatar exists before displaying
8. **Smooth Transitions** - Use CSS transitions for zoom and hover effects

### Don'ts ✗

1. **Don't Nest Modals** - Image viewer should be at root level
2. **Don't Block Clicks** - Ensure other UI elements remain functional
3. **Don't Remove Backdrop** - Users need a way to close by clicking outside
4. **Don't Hardcode Sizes** - Use responsive max-width and max-height
5. **Don't Skip Accessibility** - Always include ARIA labels and keyboard support
6. **Don't Forget Dark Mode** - Test styling in both themes
7. **Don't Use Low Z-Index** - Modal must appear above all other content
8. **Don't Ignore Mobile** - Ensure responsive sizing on small screens

---

## Troubleshooting

### Issue: Modal doesn't appear
**Solution:** Check z-index hierarchy. Image viewer uses z-[150], ensure no elements have higher z-index.

### Issue: Avatar click triggers parent element
**Solution:** Add `e.stopPropagation()` to avatar onClick handler.

### Issue: Download doesn't work
**Solution:** Verify image URL is accessible. Check browser console for CORS errors.

### Issue: Zoom doesn't work smoothly
**Solution:** Ensure CSS transition is applied: `transition: 'transform 0.2s ease-in-out'`

### Issue: Modal doesn't close on backdrop click
**Solution:** Verify backdrop div has `onClick={onClose}` handler.

### Issue: Image too small/large
**Solution:** Check container `max-h-[calc(100vh-200px)]` and image `max-w-full h-auto` classes.

---

## Related Documentation

- **Employee Management:** `/src/app/components/SampleDesign.tsx`
- **Form Components:** `/templates/form/form.md`
- **Modal Guidelines:** `/templates/dialog/` (future)
- **Avatar Policy:** `/docs/AVATAR_POLICY_GUIDELINE.md`

---

## Version History

**v1.0 (January 12, 2026)**
- Initial release
- Zoom functionality (50%-200%)
- Download with filename formatting
- Keyboard support (ESC key)
- Dark mode styling
- Responsive design
- Complete documentation

---

**Made generic for use across all projects with employee profile photos.**
