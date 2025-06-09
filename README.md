# NOT Store - Telegram Mini App
## 🤖 Try It Out
**Bot Link**: https://t.me/not_store_test_bot

## ✨ Cool Features

### Enhanced User Experience
- **Swipeable product images** - Navigate through product photos both on individual product pages and in the main menu
- **Multi-select functionality** - Long-press (0.5s) on items in the main menu to enable multi-selection mode
- **Gesture-based navigation** - Swipe between product photos on product detail pages
- **Fullscreen image viewer** - Tap to view product images in fullscreen mode
- **Smart cart display** - Clear quantity indicators for each item to avoid confusion with total amounts

### Delightful Interactions
- **Smooth animations** - Thoughtful micro-interactions throughout the app
- **Animated illustrations** - Custom animations for post-purchase success and 404/not found states
- **Adaptive theming** - Automatic dark/light mode support based on user's system preferences
- **Haptic feedback** - Vibration responses for user actions (where supported)

### Easter Egg 🥚
Hmm, try tapping the Notcoin icon (Store button) 5 times in a row... something special might happen! 


## 🚀 Technologies & Architecture

### Core Stack
- **Next.js 14** - The React framework for production
- **TypeScript** - Type safety and better developer experience
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework

### Why Next.js?
Next.js provides the perfect foundation for this Telegram Mini App because:
- **Automatic code splitting** - Only load what users need, improving initial load times
- **Built-in optimization** - Image optimization, font optimization, and automatic static optimization
- **Server-side rendering** - Better perceived performance with faster initial renders
- **File-based routing** - Clean, intuitive navigation structure
- **Production-ready** - Built-in performance optimizations and deployment features
- **Telegram Web App integration** - Seamless integration with Telegram's Web App APIs

## 🔧 Technical Implementation

### API Integration
- **Catalogue API** - Dynamic product loading and display
- **Purchase History** - User transaction history with proper empty states
- **Error Handling** - Graceful fallbacks and retry mechanisms

### Performance Optimizations
- Optimized loading states and skeleton screens
- Image lazy loading and optimization
- Efficient state management with Zustand
- Smooth page transitions and navigation

### Testing Mode
- **Fixed pricing** - All purchases cost 0.1 TON regardless of quantity (test mode)
- **Safe testing environment** - No real transactions, perfect for exploration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yuzvak/not-fe-contest
cd not-store

# Install dependencies
npm install
# or
yarn install

# Run the development server
npm run dev
# or
yarn dev

Open http://localhost:3000 in your browser to see the app.

### Build for Production

```bash
# Create production build
npm run build
npm run start

# or
yarn build
yarn start
```

### Environment Setup
For full Telegram Mini App functionality, make sure to test within the Telegram environment using the bot link above.

## 🎯 Contest Submission

This project was built for the NOT Front Contest, focusing on:
- Pixel-perfect implementation of provided designs
- Production-ready code quality and architecture
- Enhanced user experience beyond basic specifications
- Thoughtful integration of Telegram Web App features
- Creative enhancements and attention to detail

---

*Built with ❤️ for the NOT Front Contest*
