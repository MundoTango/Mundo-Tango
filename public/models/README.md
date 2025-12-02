# Mr Blue 3D Avatar Models

This directory is intended to store the GLB models used by the Mr Blue 3D avatar.

## Current Implementation

The project currently uses an **abstract procedural avatar** that doesn't require external 3D models. This abstract representation:

- Uses Three.js primitives (spheres with distortion materials)
- Responds to emotions dynamically (color, distortion, animation)
- Works without any external model files

## Future: Custom GLB Models

To use custom 3D avatar models, place your `.glb` files here with the following names:

### Required Files

- **mr_blue_real.glb** - Realistic human-style Mr Blue avatar
  - Polycount: < 20k triangles recommended
  - Rigging: Full body rig with facial bones
  - Textures: PBR materials (albedo, normal, roughness, metalness)
  
- **mr_blue_pixar.glb** - Pixar-style stylized avatar
  - Polycount: < 15k triangles recommended
  - Rigging: Full body rig with blend shapes
  - Style: Cartoony, expressive features

### Model Sources

You can obtain or create models from:

1. **Ready Player Me** (https://readyplayer.me) - Free customizable avatars
2. **Luma AI** (https://lumalabs.ai) - AI-generated 3D from photos
3. **Mixamo** (https://mixamo.com) - Free rigged characters
4. **Custom Creation** - Blender, Maya, or other 3D software

### File Format Requirements

- Format: `.glb` (binary glTF)
- Animations: Embedded in the model or separate
- Scale: 1 unit = 1 meter
- Origin: Feet at Y=0
- Facing: -Z direction

### License Note

Ensure you have proper licensing rights for any 3D models used. Some sources require attribution or have commercial use restrictions.

## Loading Custom Models

To switch from the abstract avatar to custom GLB models, update the `modelType` prop in `Avatar3D.tsx`:

```tsx
<Avatar3D 
  modelType="real"  // or "pixar"
  emotion={emotion}
/>
```

And update the component to use `useGLTF` from `@react-three/drei` to load the models.
