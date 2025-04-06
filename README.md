# Disaster Management Inventory System

## Project Overview

The Disaster Management Inventory System is a web-based application designed to track and manage emergency inventory items across different states, districts, and departments. The system provides a comprehensive dashboard for viewing, filtering, and managing inventory data.

## Architecture

### Frontend-Backend Connection

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Frontend │ ──── │  Next.js API    │ ──── │    Supabase     │
│  Components     │      │  Endpoints      │      │    Database     │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Technology Stack

### Frontend
- **Next.js**: React framework for building the UI
- **React**: Frontend library for building user interfaces
- **Shadcn UI Components**: Custom UI component library
- **Framer Motion**: Animation library for UI transitions
- **Weather API**: Integration with Indian Weather API for real-time weather data

### Backend
- **Supabase**: PostgreSQL database with built-in authentication
- **Next.js API Routes**: Serverless functions to handle API requests
- **TypeScript**: Type-safe code across both frontend and backend

## Data Flow

### Direct Client-Database Connection
The application uses Supabase JavaScript client to directly connect to the database:

1. The frontend components (e.g., `inventory-management.tsx`) import functions from `backend/inventory.ts`
2. These functions use the Supabase client to query the database
3. Row Level Security (RLS) in Supabase controls data access permissions

### API Routes
For more complex operations or as fallbacks, the application uses Next.js API routes:

1. API endpoints like `/api/get-states.ts` and `/api/get-districts.ts` provide data to the frontend
2. These endpoints connect to Supabase using service role or anonymous keys
3. They process and return formatted data to the frontend components

## Key Features

### Authentication & Authorization
- Anonymous and authenticated access modes
- Row Level Security (RLS) policies to control data access
- Service role key for admin operations

### State Management
- React hooks for local component state
- Efficient data fetching with loading states and error handling
- Data filtering performed client-side with backend fallbacks

### Inventory Management
- CRUD operations for inventory items
- Filtering by state, district, and department
- Pagination for handling large datasets
- Form validation for data entry

### Weather Monitoring
- Real-time weather data for disaster-prone areas
- Weather alerts and warnings
- Historical weather data analysis
- Location-based weather forecasts

## Environment Configuration

The application requires the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key for client-side access
- `SUPABASE_SERVICE_ROLE_KEY`: Private service role key for admin operations
- `NEXT_PUBLIC_WEATHER_API_KEY`: API key for weather service
- `WEATHER_API_BASE_URL`: Base URL for weather API endpoints

## Database Structure

The main table is `inventory` with the following fields:
- `id`: UUID primary key
- `state`: State name
- `district`: District name
- `department_type`: Type of department (Fire, Health, Police, etc.)
- `department_name`: Name of department
- `item_code`: Unique identifier for inventory item
- `item_name`: Name of inventory item
- `quantity`: Quantity of item in stock
- `created_at`: Timestamp of record creation

## Implementation Details

### Backend Functions
Backend functions in `inventory.ts` provide a clean interface for database operations:
- `getInventoryItems`: Fetch inventory items with filtering options
- `getUniqueStates`, `getUniqueDistricts`, `getUniqueDepartmentTypes`: Get unique values for filters
- `createInventoryItem`, `updateInventoryItem`, `deleteInventoryItem`: CRUD operations

### API Endpoints
API routes provide alternative access methods:
- `/api/get-states`: Get all unique states
- `/api/get-districts`: Get districts, optionally filtered by state
- `/api/fix-rls`: Helper endpoint to manage Row Level Security policies

### Frontend Components
The main component `inventory-management.tsx` handles:
- Data fetching and state management
- Filtering and pagination
- Form handling for adding/updating items
- UI rendering with responsive design

## Error Handling and Fallbacks
The system implements multiple fallback strategies:
1. Primary approach: Direct Supabase queries
2. Secondary approach: API endpoints
3. Final fallback: Default values

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- Supabase account and project

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yourusername/disaster-management.git
   cd disaster-management
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

4. Run the development server
   ```
   npm run dev
   ```

### Database Setup
1. Create an `inventory` table in Supabase with the fields mentioned above
2. Set up Row Level Security policies as described in `/pages/api/fix-rls.ts`
3. Run initial seed data scripts if available in the `/scripts` directory
4. Verify database connections through the Supabase dashboard

## UI Styling

The application uses Tailwind CSS for styling:

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Theme**: Defined in global CSS variables using HSL color format
- **Responsive Design**: Mobile-first approach with breakpoints for different screen sizes
- **Dark/Light Modes**: Theme switching capabilities

See `docs/ui-theme.md` for detailed theme documentation.

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set the required environment variables in the Vercel dashboard
3. Deploy with the following settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Manual Deployment
1. Build the production version
   ```
   npm run build
   ```
2. Start the production server
   ```
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines
- Follow TypeScript best practices
- Use ES6+ features where appropriate
- Format code with Prettier
- Follow the existing component structure

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/yourusername/disaster-management](https://github.com/yourusername/disaster-management)