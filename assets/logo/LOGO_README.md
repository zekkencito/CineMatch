# CineMatch Logo Assets

## Logo Files Required

Place your logo files in this directory:

### Required Files:
- `logo.png` - Main logo (512x512px recommended, transparent background)
- `logo-icon.png` - Icon only (for app icon, 1024x1024px)
- `logo-text.png` - Text logo (for splash screen)

### Color Scheme:
The logo should use the app's color palette:
- Primary: Yellow (#FFD700)
- Secondary: Black (#000000)
- Accent: White (#FFFFFF)

### Usage:
Once logos are added, update the following files:
1. `app.json` - Update icon and splash screen paths
2. `LoginScreen.js` - Replace emoji with logo image
3. `HomeScreen.js` - Replace emoji with logo icon
4. `ProfileScreen.js` - Add logo to header if needed

### Example Import:
```javascript
import logo from '../../assets/logo/logo.png';

// In component:
<Image source={logo} style={styles.logo} />
```

### Current Status:
🎬 Using emoji placeholders until logo files are provided
- LoginScreen: Using 🎬 emoji
- HomeScreen: Using 🎬 emoji  
- MatchesScreen: Using 🍿 emoji
- ProfileScreen: Using photo avatar

### Next Steps:
1. Add logo files to this directory
2. Update imports in screens
3. Test on both iOS and Android
4. Generate app icons with `npx expo prebuild`
