# High-Load Booking System - Frontend

A production-grade event booking system frontend built with Next.js 14+ that handles race conditions and overselling scenarios with proper state management and user experience.

## 🚀 Project Overview

This frontend application provides a seamless booking experience for events with real-time ticket availability, concurrent booking protection, and comprehensive error handling. It's designed to work with a NestJS backend API that implements transactional booking logic to prevent overselling.

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand (chosen for minimal boilerplate and fine-grained subscriptions)
- **HTTP Client**: Axios with interceptors for token management
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🏗 Architecture Decisions

### State Management: Zustand
- **Why Zustand?** Chosen for its minimal boilerplate and efficient re-rendering
- **Benefits**: Simple API, TypeScript support, and fine-grained subscriptions without complex selectors
- **Stores**: Separate stores for auth, events, and bookings for clean separation of concerns

### Token Storage Strategy
- **Access Token**: Stored in localStorage (acknowledged security trade-off for simplicity)
- **Refresh Token**: Stored in localStorage with automatic token rotation
- **Security Note**: In production, consider using httpOnly cookies for enhanced security

### Race Condition Handling
- **Optimistic Updates**: Immediate UI updates on booking attempts with rollback on errors
- **Error States**: Specific handling for "no tickets available" vs "already booked" scenarios
- **Real-time Feel**: Users see instant feedback while backend handles concurrency

## 📁 Project Structure

```
booking-front/
├── app/
│   ├── (auth)/                 # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/            # Protected routes
│   │   ├── events/
│   │   └── bookings/
│   ├── layout.tsx             # Root layout with toast provider
│   ├── page.tsx               # Home page with auth redirect
│   └── globals.css            # Global styles and utilities
├── components/
│   ├── EventCard.tsx          # Event card with booking functionality
│   └── Navbar.tsx             # Navigation bar with user info
├── lib/
│   ├── api.ts                 # API client with interceptors
│   └── utils.ts               # Utility functions
├── store/
│   ├── authStore.ts           # Authentication state
│   ├── eventStore.ts          # Events and filtering state
│   └── bookingStore.ts        # Booking operations state
├── middleware.ts              # Route protection
└── env.example               # Environment variables template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 3001

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure the API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔐 Authentication Flow

### Registration
- Email validation with format checking
- Password strength requirements (8+ chars, 1 letter, 1 number)
- Automatic login after successful registration
- Client-side validation with server-side confirmation

### Login
- JWT-based authentication with access/refresh tokens
- Automatic token refresh on expiration
- Generic error messages for security
- Redirect to events dashboard on success

### Route Protection
- Middleware-based route protection
- Client-side authentication state management
- Automatic redirects based on auth status
- Protected routes: `/events`, `/bookings`

## 🎫 Booking Flow

### Event Discovery
- Paginated event listing with search and sorting
- Real-time ticket availability indicators
- Visual status badges (green/yellow/red/sold out)
- Responsive grid layout

### Booking Process
1. **Click "Book Now"**: Shows loading state immediately
2. **Optimistic Update**: UI shows success while backend processes
3. **Error Handling**: 
   - "Sold Out": Updates UI to show sold out status
   - "Already Booked": Shows booked state
   - Network Error: Allows retry with proper messaging
4. **Success**: Confirms booking and updates ticket count

### Race Condition UX
- **No Crashes**: Graceful handling of all error scenarios
- **Clear Messaging**: Users understand exactly what happened
- **Visual Feedback**: Loading states, success/error indicators
- **State Consistency**: UI updates match backend reality

## 📱 Responsive Design

- **Mobile (375px+)**: Single column layout, stacked elements
- **Tablet (768px+)**: Two-column event grid, improved spacing
- **Desktop (1280px+)**: Three-column grid, optimal navigation
- **Accessibility**: Proper ARIA labels, keyboard navigation, focus management

## 🔧 Key Features

### Event Dashboard
- Search functionality with 300ms debouncing
- Sort by date, price, or title (ascending/descending)
- Pagination with meta information
- Empty states with helpful messaging
- Loading skeletons for better perceived performance

### My Bookings
- List of user's bookings with event details
- Booking cancellation with confirmation dialog
- Status indicators (confirmed/cancelled)
- Automatic ticket count updates on cancellation

### Error Handling
- Network error detection and retry prompts
- Specific error messages for different failure scenarios
- Toast notifications for all user actions
- Graceful degradation when API is unavailable

## 🧪 Testing Considerations

### Concurrency Testing
The frontend is designed to handle the backend's concurrency test where:
- 10 simultaneous booking requests for 2 tickets
- Exactly 2 succeed, 8 fail gracefully
- UI updates reflect actual backend state
- No crashes or ambiguous states

### Manual Testing Scenarios
1. **Race Condition**: Multiple users booking same event simultaneously
2. **Token Expiry**: Automatic refresh during active session
3. **Network Issues**: Graceful handling of API failures
4. **Form Validation**: Client and server-side validation alignment

## 🔒 Security Considerations

### Current Implementation
- JWT tokens with proper expiration
- Input validation and sanitization
- XSS protection through React's built-in safeguards
- Route protection with authentication checks

### Production Recommendations
- Use httpOnly cookies for token storage
- Implement CSRF protection
- Add rate limiting on client-side
- Consider Content Security Policy (CSP)

## 🚀 Deployment

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Build Commands
```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Code linting
```

## 🐛 Known Limitations

1. **Token Storage**: Using localStorage (security trade-off for simplicity)
2. **Real-time Updates**: No WebSocket implementation (polling could be added)
3. **Offline Support**: Limited offline functionality
4. **Browser Compatibility**: Focused on modern browsers

## 🔄 Future Improvements

1. **WebSocket Integration**: Real-time ticket count updates
2. **PWA Support**: Offline capabilities and app-like experience
3. **Advanced Search**: Filter by venue, date range, price range
4. **Social Features**: Event sharing, reviews, ratings
5. **Analytics**: User behavior tracking and insights

## 📞 API Integration

The frontend expects the following API endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `GET /events` - Event listing with pagination
- `GET /events/:id` - Single event details
- `POST /book` - Create booking
- `GET /bookings` - User's bookings
- `DELETE /bookings/:id` - Cancel booking

## 🎨 UI/UX Philosophy

- **Clarity**: Clear visual hierarchy and messaging
- **Responsiveness**: Fast feedback for all user actions
- **Accessibility**: WCAG compliance considerations
- **Consistency**: Unified design language throughout
- **Error Recovery**: Graceful handling of failure scenarios

---

This frontend implementation provides a robust, user-friendly interface for the high-load booking system, with special attention to handling concurrent booking scenarios and providing excellent user experience even under race conditions.
