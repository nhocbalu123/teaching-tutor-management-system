# CSS Organization Guide

This document describes how the original monolithic `styles.css` file has been reorganized to follow the existing modular architecture of the teaching application.

## New Modular Structure

The original 1,351-line `styles.css` file has been broken down and distributed across the existing module structure:

```
src/modules/
├── core/styles/
│   ├── base.css                    # Base styles, animations, and layout components
│   ├── utilities.css               # Utility classes and button components
│   ├── organized-styles.css        # Main import file for reorganized styles
│   ├── components/
│   │   └── modal.css              # Modal component styles (shared across app)
│   └── organization-guide.md       # This documentation
├── home/styles/
│   └── hero.css                    # Hero section styles and stats
└── lecturer/styles/
    └── lecturer.css                # Lecturer card and grid styles
```

## File Breakdown

### 1. **Core Module Styles** (`src/modules/core/styles/`)

#### `base.css`

- **Purpose**: Fundamental styles that affect the entire application
- **Content**:
  - HTML and body base styles
  - Custom scrollbar styles
  - Animation keyframes (`fadeIn`, `gentle-rotate`, `float`, `pulse-slow`, etc.)
  - Layout components (`.section`, `.container`)

#### `utilities.css`

- **Purpose**: Reusable utility classes and common components
- **Content**:
  - Animation utility classes (`.animate-fadeIn`, `.animate-float`, etc.)
  - Flexbox utilities (`.flex`, `.flex-col`, `.items-center`, etc.)
  - Spacing utilities (`.space-x-2`, `.space-y-4`, etc.)
  - Typography utilities (`.text-2xl`, `.font-bold`, etc.)
  - Button components (`.btn`, `.btn-primary`, `.btn-outline`)
  - Card component (`.card`)
  - Feature section utilities
  - Footer link styles

#### `components/modal.css`

- **Purpose**: Modal dialog components (shared across modules)
- **Content**:
  - Modal overlay and container (`.modal-overlay`, `.modal-container`)
  - Modal content sections (`.modal-image-section`, `.modal-content`)
  - Modal elements (`.modal-close`, `.modal-title`, `.modal-subtitle`)
  - Modal lists and buttons (`.modal-info-list`, `.modal-contact-btn`)

#### `organized-styles.css`

- **Purpose**: Central import file for all reorganized styles
- **Content**: Import statements for all the reorganized CSS files

### 2. **Home Module Styles** (`src/modules/home/styles/`)

#### `hero.css`

- **Purpose**: Hero section and related components (specific to home page)
- **Content**:
  - Hero section layout (`.hero-section`)
  - Decoration elements (`.decoration-circle`, `.decoration-gradient-circle`)
  - Hero content (`.hero-title`, `.hero-subtitle`, `.hero-btn`)
  - Hero image container (`.hero-image-container`)
  - Floating cards (`.floating-card`, `.floating-icon-green`, etc.)
  - Stats section (`.stats-container`, `.stats-card`, `.stats-number`)
  - Avatar group styling (`.avatar-group`, `.avatar`, `.more-button`)

### 3. **Lecturer Module Styles** (`src/modules/lecturer/styles/`)

#### `lecturer.css`

- **Purpose**: Lecturer-related components and layouts
- **Content**:
  - Section title components (`.section-title-container`, `.section-title-bar`)
  - Lecturer grid layout (`.lecturer-grid`)
  - Lecturer card styles (`.lecturer-card`, `.lecturer-image-container`)
  - Lecturer card interactions and hover effects
  - Custom hover effects for different lecturer cards

## Integration with Existing System

The reorganized styles integrate seamlessly with the existing CSS architecture:

- **Main Entry**: `src/modules/core/styles/globals.css` imports `organized-styles.css`
- **Variables**: Uses existing CSS variables from `src/modules/core/styles/variables.css`
- **Themes**: Compatible with light/dark themes from `src/modules/core/styles/themes/`
- **Overrides**: Works with Tailwind overrides from `src/modules/core/styles/overrides.css`
- **Existing Components**: Coexists with existing component styles in `src/modules/core/styles/`

## Benefits of This Organization

1. **Module Alignment**: Follows the existing feature-based module structure
2. **Separation of Concerns**: Each module owns its specific styles
3. **Maintainability**: Easy to find and update module-specific styles
4. **Reusability**: Core utilities and components are shared appropriately
5. **Performance**: Better caching and loading strategies
6. **Collaboration**: Multiple developers can work on different modules without conflicts
7. **Debugging**: Easier to trace style issues to specific modules

## Usage Guidelines

### Adding New Styles

1. **Module-specific styles** → Add to the appropriate module's `styles/` directory
2. **Shared utilities** → Add to `core/styles/utilities.css`
3. **New animations** → Add to `core/styles/base.css`
4. **Shared components** → Add to `core/styles/components/`

### Creating New Components

1. Create component-specific CSS in the appropriate module
2. If the component is shared across modules, place it in `core/styles/components/`
3. Add import to `organized-styles.css` if needed
4. Follow existing naming conventions

### Modifying Existing Styles

1. Find the appropriate module using this documentation
2. Make changes in the specific module's CSS file
3. Test across different themes and screen sizes
4. Ensure changes don't break other modules

## File Import Structure

```css
/* In globals.css */
@import './organized-styles.css';

/* In organized-styles.css */
@import './base.css';
@import './utilities.css';
@import './components/modal.css';
@import '../../home/styles/hero.css';
@import '../../lecturer/styles/lecturer.css';
```

## Migration Notes

- **Original file**: `src/styles/styles.css` (1,351 lines) has been completely reorganized
- **No functionality lost**: All original styles have been preserved and relocated
- **Backward compatibility**: Existing class names and functionality remain unchanged
- **Import structure**: Updated to use the new modular organization

## Future Considerations

- Consider adding responsive design utilities to core utilities
- Evaluate CSS-in-JS solutions for component-specific styles
- Monitor bundle size and consider CSS purging strategies
- Add CSS custom properties for better theme support
- Consider creating style guides for each module
