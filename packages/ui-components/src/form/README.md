# Unified Form Components

This package provides a consistent set of form input components that should be used throughout the application for design consistency and maintainability.

## Components

### Core Input Components

- **TextInput** - For single-line text input
- **TextArea** - For multi-line text input  
- **NumberInput** - For numeric input
- **Select** - For dropdown selection
- **Checkbox** - For boolean input
- **FormField** - Complete field with label and help text

### Security Features

All input components support:
- **readonly** - Makes field read-only for security
- **secretPlaceholder** - Shows environment variable references instead of actual secrets

## Usage Examples

### Basic Text Input
```tsx
import { TextInput } from '@docs-as-code/ui-components';

<TextInput 
  placeholder="Enter your name"
  maxLength={100}
/>
```

### Secure Secret Field
```tsx
import { TextInput } from '@docs-as-code/ui-components';

<TextInput 
  readonly={true}
  secretPlaceholder="${CLIENT_ID}"
  help="Actual value will be read from environment variables"
/>
```

### Complete Form Field
```tsx
import { FormField, TextInput } from '@docs-as-code/ui-components';

<FormField 
  label="Project Name" 
  help="A descriptive name for your project"
  required={true}
>
  <TextInput placeholder="e.g., Springfield Data Platform" />
</FormField>
```

### Number Input
```tsx
import { NumberInput } from '@docs-as-code/ui-components';

<NumberInput 
  placeholder="Enter count"
  min={0}
  max={100}
  step={1}
/>
```

### Text Area
```tsx
import { TextArea } from '@docs-as-code/ui-components';

<TextArea 
  placeholder="Enter description"
  rows={4}
  resize="vertical"
  maxLength={500}
/>
```

### Select Dropdown
```tsx
import { Select } from '@docs-as-code/ui-components';

<Select>
  <option value="">Choose...</option>
  <option value="dev">Development</option>
  <option value="prod">Production</option>
</Select>
```

## Design System

All components follow consistent design patterns:

### Styling
- **Normal State**: White background, slate border, blue focus ring
- **Readonly State**: Gray background, darker text, no focus
- **Disabled State**: Light gray background, muted text
- **Error State**: Red border and background tint

### Accessibility
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### Security
- **Password managers disabled** with `data-lpignore="true"`
- **Grammar tools disabled** with `data-gramm="false"`
- **Auto-features disabled** (autocomplete, autocorrect, etc.)
- **Secret field protection** with readonly and environment variable references

## Migration Guide

### Before (inconsistent):
```tsx
// Multiple different implementations:
<input className="w-full rounded-md px-3 py-2..." />
<textarea className="w-full rounded-md px-3 py-2..." />
<select className="rounded-md px-3 py-2..." />
```

### After (unified):
```tsx
import { TextInput, TextArea, Select } from '@docs-as-code/ui-components';

<TextInput placeholder="..." />
<TextArea placeholder="..." />
<Select>...</Select>
```

## Benefits

1. **Consistency** - All inputs look and behave the same
2. **Maintainability** - Single place to update styles and behavior
3. **Security** - Built-in protection for sensitive fields
4. **Accessibility** - Consistent keyboard and screen reader support
5. **Performance** - Optimized for React and form libraries
6. **Type Safety** - Full TypeScript support with proper interfaces
