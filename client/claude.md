# ChainAlign Client - Design Principles

## Core Philosophy

ChainAlign follows a **brutalist minimalist** design aesthetic with a focus on clean, functional interfaces. The design prioritizes clarity, smooth animations, and precise user interactions.

## Visual Design

### Color Palette
- **Primary**: Pure black (`#000000`) and white (`#FFFFFF`)
- **Accent**: Light gray (`#f0f0f0`) for hover states
- **No gradients, shadows, or effects** - flat, brutalist aesthetic

### Typography
- **Font Stack**: System fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`)
- **Style**: Bold, uppercase headings for emphasis
- **No decorative fonts** - prioritize readability

### Layout
- **Borders**: Heavy 3px black borders on interactive elements
- **Spacing**: Consistent, generous spacing for clarity
- **Alignment**: Center-aligned chain flow with precise vertical centering

## Component Design Patterns

### Chain Node System

#### Empty Nodes (40px)
- Small, compact squares with `+` icon
- **Behavior**: Expand inline on hover
- **Animation**: Smooth pop-in when added to chain
- **CSS Variable**: `--empty-node-size` in `index.css`

#### Selected Nodes (80px)
- Larger squares displaying model names
- **Behavior**: Click to expand and change selection
- **Hover**: Subtle gray background (`#f0f0f0`)
- **Transition**: 0.3s cubic-bezier easing

#### Expanded Nodes (auto-size)
- Grid layout: max 3 items per row, centered
- **Selection buttons**: 60px squares with black/white inversion
- **Hover**: Instant color flip for feedback

### Animation Philosophy

#### Sequenced Animations
Animations flow naturally, one after another:
1. **Line expands** (0-0.3s): Width grows from 0 to 60px
2. **Node pops in** (0.3-0.6s): Size grows from 0 to full

#### Layout-Aware
- Use `width`/`height` instead of `transform: scale()` for layout impact
- Elements smoothly adjust as space requirements change
- No jarring jumps or layout shifts

#### Timing
- **Duration**: 0.6s total for coordinated animations
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth, natural feel
- **Keyframes**: 50% midpoint for sequencing

## Technical Patterns

### CSS Custom Properties
Use CSS variables for values that sync across CSS and components:
```css
:root {
  --empty-node-size: 40px;
}
```

Benefits:
- Single source of truth
- Animation keyframes stay in sync with component sizes
- Easy to adjust globally

### Component State Management

#### Node Expansion Logic
- **Empty nodes**: Expand on hover
- **Selected nodes**: Expand on click only
- **Expanded state**: Collapses on selection or mouse leave

#### Animation Triggers
- **Initial load**: Line animates when `chain.length === 0`
- **New additions**: Line animates for last item in chain
- **Node pop-in**: Triggered by `showEmpty` state with 10ms delay

### Code Organization

#### Component Hierarchy
```
ChainSelector (manages chain state)
├── AnimatedLine (reusable line component)
├── ChainNode (individual node with expansion logic)
│   └── Model buttons (selection grid)
└── ArrowLine (static arrow to OUTPUT)
```

#### Clean Patterns
- **Single responsibility**: Each component has one clear purpose
- **Prop-driven**: Behavior controlled through simple boolean props
- **Stateless where possible**: Minimize local state

## Interaction Design

### Hover States
- **Empty nodes**: Expand immediately on hover
- **Selected nodes**: Show gray background hint
- **Model buttons**: Instant black/white inversion

### Click Behavior
- **Empty nodes**: Select and add to chain
- **Selected nodes**: Toggle expansion for editing
- **Model buttons**: Update selection and collapse

### Flow
1. User hovers over empty `+` node → Expands to show options
2. User selects model → Node collapses, line expands, new empty node pops in
3. Chain grows naturally: `INPUT → [Node] → [Node] → [+] → OUTPUT`

## Performance Considerations

- **CSS animations**: Hardware-accelerated, smooth 60fps
- **Minimal re-renders**: State changes only affect relevant nodes
- **Efficient updates**: Animations triggered by boolean flags
- **Layout optimization**: Flex-based layouts adjust naturally

## Future Extensibility

The design system is built to scale:
- **CSS variables**: Easy theme adjustments
- **Reusable components**: `AnimatedLine`, `ChainNode` are modular
- **Clean interfaces**: TypeScript interfaces define clear contracts
- **Animation system**: Keyframe-based for easy modification
