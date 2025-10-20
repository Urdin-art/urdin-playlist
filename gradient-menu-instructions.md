# Instructions for GradientMenu Configuration

This document outlines the steps to add new configuration options to the `GradientMenu` component.

## 1. Update Theme JSON File

In `public/theme-A.json`, add the following properties to the `menu` object inside the `complete` object:

```json
"menu": {
    "textColor": "hsla(258, 88%, 16%, 1.00)",
    "buttonGradientColor": "hsla(276, 97%, 85%, 1.00)",
    "gradientBottomColor": "rgba(0, 0, 0, 0.85)",
    "borderColor": "transparent",
    "borderWidth": "0px",
    "borderRadius": "9999px"
}
```

## 2. Update `useAppConfig.ts`

In `src/hooks/useAppConfig.ts`, update the `if (c.menu)` block to read the new menu configuration properties and set the corresponding CSS variables:

```typescript
    if (c.menu) {
      root.style.setProperty('--menu-text-color', c.menu.textColor);
      root.style.setProperty('--menu-button-gradient-color', c.menu.buttonGradientColor);
      root.style.setProperty('--menu-gradient-bottom-color', c.menu.gradientBottomColor);
      root.style.setProperty('--menu-border-color', c.menu.borderColor);
      root.style.setProperty('--menu-border-width', c.menu.borderWidth);
      root.style.setProperty('--menu-border-radius', c.menu.borderRadius);
    }
```

## 3. Update `gradient-menu.tsx`

In `src/components/ui/gradient-menu.tsx`, update the `style` prop of the `li` element to use the new CSS variables:

```tsx
            <li
              key={idx}
              style={{ 
                '--gradient-from': gradientFrom, 
                '--gradient-to': gradientTo,
                background: 'linear-gradient(to bottom, var(--menu-button-gradient-color), var(--menu-gradient-bottom-color))',
                borderColor: 'var(--menu-border-color)',
                borderWidth: 'var(--menu-border-width)',
                borderRadius: 'var(--menu-border-radius)',
                borderStyle: 'solid',
              }}
              className="relative w-[1.875rem] h-[1.875rem] md:w-[2.8125rem] md:h-[2.8125rem] shadow-lg flex items-center justify-center transition-all duration-500 hover:w-[5.625rem] md:hover:w-[8.4375rem] hover:shadow-none group cursor-pointer"
              onClick={action}
            >
```

Also, update the hover `span` to use the new `borderRadius` variable:

```tsx
              {/* Gradient background on hover */}
              <span
                className="absolute inset-0 bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"
                style={{
                  borderRadius: 'var(--menu-border-radius)',
                }}
              ></span>
```

## 4. Update `ThemeEditor.tsx`

In `src/components/admin/ThemeEditor.tsx`, add the new configuration options to the admin panel form inside the "Menú de Navegación" section:

```tsx
                      {renderFormField("menu.textColor", "Color Texto/Icono")}
                      {renderFormField("menu.buttonGradientColor", "Color Superior Gradiente")}
                      {renderFormField("menu.gradientBottomColor", "Color Inferior Gradiente")}
                      {renderFormField("menu.borderColor", "Color Borde")}
                      {renderFormField("menu.borderWidth", "Ancho Borde")}
                      {renderFormField("menu.borderRadius", "Radio Borde")}
```
