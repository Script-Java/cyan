# StickerHub - Custom Sticker Ecommerce Platform

A modern, production-ready ecommerce platform for custom sticker creation and sales. Built with React, TypeScript, and integrates with BigCommerce for customer management and payments.

## Features

### 🎨 Core Features

- **Custom Sticker Designer**: Intuitive interface for creating custom stickers
- **Multiple Sticker Types**:
  - Vinyl Stickers - Durable, waterproof
  - Holographic Stickers - Shimmering iridescent finish
  - Chrome Stickers - Metallic mirror effect
  - Glitter Stickers - Sparkly designs
- **Professional Homepage**: Modern, responsive landing page
- **Shopping Cart**: Manage selected items before checkout
- **User Accounts**: Registration and authentication

### 🔐 Authentication

- **Traditional Login/Signup**: Email and password authentication
- **BigCommerce Integration**: OAuth 2.0 authentication with BigCommerce
- **Password Validation**: Strong password requirements
- **Session Management**: Secure token-based authentication

### 📱 Responsive Design

- Mobile-first responsive design
- Desktop, tablet, and mobile optimized
- Touch-friendly navigation
- Accessible color scheme (WCAG compliant)

## Tech Stack

### Frontend

- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **React Router 6**: Client-side routing
- **Tailwind CSS 3**: Utility-first styling
- **Lucide React**: Beautiful icon library
- **React Query**: Server state management

### Backend

- **Express.js**: Node.js web framework
- **TypeScript**: Type-safe backend
- **CORS**: Cross-origin resource sharing
- **Zod**: Schema validation

### Build Tools

- **Vite**: Lightning-fast build tool
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## Project Structure

```
StickerHub/
├── client/
│   ├── components/
│   │   ├── Header.tsx          # Navigation header (shared across all pages)
│   │   └── ui/                 # Radix UI component library
│   ├── pages/
│   │   ├── Index.tsx           # Homepage with hero section
│   │   ├── Login.tsx           # Login page
│   │   ├── Signup.tsx          # User registration
│   │   ├── Products.tsx        # Product catalog (placeholder)
│   │   ├── Cart.tsx            # Shopping cart (placeholder)
│   │   └── NotFound.tsx        # 404 error page
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   ├── hooks/
│   │   └── use-mobile.tsx      # Mobile detection hook
│   ├── App.tsx                 # Main app and routing configuration
│   └── global.css              # Global styles and CSS variables
├── server/
│   ├── routes/
│   │   ├── auth.ts             # Authentication endpoints
│   │   └── demo.ts             # Demo API endpoint
│   └── index.ts                # Express server configuration
├── shared/
│   └── api.ts                  # Shared type definitions
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── BIGCOMMERCE_SETUP.md        # BigCommerce integration guide
```

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your BigCommerce credentials (optional)
```

### Development

```bash
# Start the development server (Vite + Express)
pnpm dev

# Visit http://localhost:5173 in your browser
```

### Production Build

```bash
# Build for production
pnpm build

# Start the production server
pnpm start
```

### Other Commands

```bash
# Type checking
pnpm typecheck

# Run tests
pnpm test

# Format code
pnpm format.fix
```

## Pages Overview

### 🏠 Homepage (/)

The landing page showcasing the StickerHub brand and value proposition.

**Features:**

- Hero section with call-to-action
- Sticker type showcase (Vinyl, Holographic, Chrome, Glitter)
- Feature highlights
- CTA sections linking to signup and shopping

**Responsive:** ✅ Mobile, Tablet, Desktop

### 🔐 Login Page (/login)

User authentication with email and password.

**Features:**

- Email and password input fields
- Remember me checkbox
- Forgot password link
- BigCommerce OAuth button
- Link to signup for new users
- Form validation and error handling

**Responsive:** ✅ Mobile, Tablet, Desktop

### ���� Signup Page (/signup)

New user registration with validation.

**Features:**

- Full name, email, and password inputs
- Password strength indicator
- Password confirmation field
- Real-time password validation
- Terms and conditions agreement
- BigCommerce OAuth option
- Link to login for existing users

**Responsive:** ✅ Mobile, Tablet, Desktop

### 🛍️ Products Page (/products)

Product catalog and sticker designer (placeholder).

**Status:** Placeholder - Ready for implementation

### 🛒 Cart Page (/cart)

Shopping cart management (placeholder).

**Status:** Placeholder - Ready for implementation

## Color Scheme

| Color      | Value   | Usage                   |
| ---------- | ------- | ----------------------- |
| Navy       | #030140 | Header background, text |
| Gold       | #FFD713 | Primary CTA buttons     |
| Gold Hover | #FFA500 | Button hover state      |
| White      | #FFFFFF | Text, icons, borders    |
| Light Gray | #F3F4F6 | Backgrounds             |

## API Endpoints

### Authentication

```
POST   /api/auth/login                    # Email/password login
POST   /api/auth/signup                   # User registration
GET    /api/auth/bigcommerce              # BigCommerce OAuth flow
GET    /api/auth/bigcommerce/callback     # OAuth callback handler
GET    /api/auth/bigcommerce/signup       # BigCommerce signup
POST   /api/auth/logout                   # User logout
```

### Demo

```
GET    /api/demo                          # Demo endpoint
GET    /api/ping                          # Health check
```

## BigCommerce Integration

The platform supports OAuth 2.0 authentication with BigCommerce, allowing customers to:

- Log in with their BigCommerce account
- Access their BigCommerce store data
- Place orders and manage account from one dashboard

For detailed setup instructions, see [BIGCOMMERCE_SETUP.md](./BIGCOMMERCE_SETUP.md)

## Design System

The application uses a clean, modern design system with:

- **Typography**: Inter font family, multiple font weights
- **Spacing**: Consistent 4px grid system
- **Rounded Corners**: 8px default border radius for components
- **Shadows**: Subtle shadows for depth
- **Gradients**: Gradient overlays and backgrounds
- **Icons**: Lucide React icons throughout

## Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (lg)
- **Desktop**: > 1024px (lg)

## Performance

- Vite for fast development and optimized production builds
- React Query for efficient data fetching and caching
- Code splitting via React Router
- Lazy loading of components
- Optimized images and assets

## Security

- TypeScript for type safety
- CORS enabled for secure cross-origin requests
- Environment variables for sensitive data
- Input validation on forms
- Password strength requirements
- Session management with JWT tokens

## Future Enhancements

- [ ] Complete products catalog with filtering
- [ ] Shopping cart with persistent storage
- [ ] Payment processing integration
- [ ] Order management system
- [ ] User dashboard and order history
- [ ] Design customization tools
- [ ] Print-on-demand integration
- [ ] Customer reviews and ratings
- [ ] Bulk order discounts
- [ ] Analytics and reporting

## Contributing

When making changes:

1. Follow the existing code style and conventions
2. Maintain TypeScript type safety
3. Keep components modular and reusable
4. Update documentation as needed
5. Test on multiple devices and browsers

## Troubleshooting

### Dev server not starting?

- Clear node_modules: `rm -rf node_modules pnpm-lock.yaml`
- Reinstall: `pnpm install`
- Clear cache: `pnpm run build --force`

### Tailwind styles not working?

- Ensure all template files are in `content` array in `tailwind.config.ts`
- Check that classes use proper Tailwind format
- Clear build cache and restart dev server

### BigCommerce OAuth not working?

- Verify environment variables are set correctly
- Check BigCommerce app credentials
- Ensure redirect URI matches in BigCommerce settings
- Review BIGCOMMERCE_SETUP.md for detailed instructions

## License

This project is created for StickerHub ecommerce platform.

## Support

For issues or questions about the implementation, refer to:

- [BIGCOMMERCE_SETUP.md](./BIGCOMMERCE_SETUP.md) - BigCommerce integration
- [AGENTS.md](./AGENTS.md) - Project architecture and conventions
