# Dynamic Role-Based Dashboard Implementation

## Overview

The SmartMark CRM now features a complete dynamic, role-based dashboard that provides analytics and reporting capabilities tailored to different user roles. The dashboard supports:

- **SuperAdmin/Admin/CRM Manager**: Full access to all analytics, user selection, and comprehensive reporting
- **Sales/Support**: Access to personal analytics and individual performance metrics

## Architecture

### Frontend Components

1. **Home.tsx** - Main dashboard component with role-based rendering
2. **UserSelector** - Component for selecting users (managers only)
3. **RoleBasedAnalytics** - Dynamic analytics display based on user role
4. **DynamicReportGenerator** - Report generation with role-specific access
5. **dashboardService.ts** - Service layer for API communications

### Key Features

- ✅ Dynamic user selection for managers
- ✅ Role-based data filtering
- ✅ Real-time analytics dashboard
- ✅ Comprehensive report generation
- ✅ Loading states and error handling
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript type safety

## Backend API Endpoints

### Authentication

```
GET /auth/isauthenticated
```

**Response:**

```json
{
  "success": true,
  "isauthenticated": true,
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "SuperAdmin", // SuperAdmin, Admin, CRM Manager, Sales, Support
    "can_generate_report": true,
    "department": "Sales",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### User Management

```
GET /users/all
```

**Access:** SuperAdmin, Admin, CRM Manager only
**Response:**

```json
{
  "success": true,
  "users": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "Sales",
      "can_generate_report": true,
      "department": "Sales",
      "created_at": "2024-01-01T00:00:00Z"
    }
    // ... more users
  ]
}
```

### Analytics Endpoints

#### 1. Get All Analytics (Company-wide)

```
GET /dashboard/analytics/all
```

**Access:** SuperAdmin, Admin, CRM Manager only
**Response:**

```json
{
  "success": true,
  "analytics": {
    "totalSales": 150000,
    "totalLeads": 1250,
    "conversionRate": 12.5,
    "totalRevenue": 2500000,
    "monthlyPerformance": [
      {
        "month": "2024-01",
        "sales": 25000,
        "leads": 200,
        "conversion_rate": 12.5,
        "revenue": 400000
      }
      // ... more months
    ],
    "demographicData": {
      "age_groups": {
        "18-25": 150,
        "26-35": 350,
        "36-45": 400,
        "46-60": 300,
        "60+": 50
      },
      "locations": {
        "North America": 600,
        "Europe": 400,
        "Asia": 200,
        "Others": 50
      },
      "sources": {
        "Website": 500,
        "Social Media": 300,
        "Email Campaign": 250,
        "Referral": 150,
        "Direct": 45
      }
    },
    "categoryData": {
      "categories": [
        {
          "name": "Enterprise Software",
          "leads": 400,
          "sales": 50,
          "revenue": 800000
        },
        {
          "name": "SaaS Solutions",
          "leads": 600,
          "sales": 75,
          "revenue": 1200000
        }
        // ... more categories
      ]
    },
    "channelData": {
      "channels": [
        {
          "name": "Google Ads",
          "leads": 300,
          "conversion_rate": 15.2,
          "cost_per_lead": 45.5
        },
        {
          "name": "Facebook Ads",
          "leads": 250,
          "conversion_rate": 12.8,
          "cost_per_lead": 38.2
        }
        // ... more channels
      ]
    },
    "recentOrders": [
      {
        "id": "order123",
        "customer_name": "ABC Corp",
        "amount": 25000,
        "status": "completed",
        "date": "2024-01-15T10:30:00Z",
        "product": "Enterprise CRM License"
      }
      // ... more orders
    ],
    "topPerformers": [
      {
        "user_id": "user456",
        "user_name": "Jane Smith",
        "sales": 45000,
        "leads": 180,
        "conversion_rate": 25.0
      }
      // ... more performers
    ]
  }
}
```

#### 2. Get Personal Analytics

```
GET /dashboard/analytics/me
```

**Access:** All authenticated users
**Response:** Same structure as above, but filtered to user's own data

#### 3. Get Specific User Analytics

```
GET /dashboard/analytics/{userId}
```

**Access:** SuperAdmin, Admin, CRM Manager only
**Response:** Same structure as above, but filtered to specific user's data

### Report Generation

#### 1. Generate Company Report

```
POST /dashboard/generate-report/all
```

**Access:** SuperAdmin, Admin, CRM Manager only
**Request Body:**

```json
{
  "includeMetrics": true,
  "includeTrends": true,
  "includeComparisons": true,
  "dateRange": "month", // week, month, quarter, year
  "format": "pdf" // pdf, excel, csv
}
```

**Response:** Binary file download (PDF/Excel/CSV)

#### 2. Generate Personal Report

```
POST /dashboard/generate-report/me
```

**Access:** All authenticated users
**Request Body:** Same as above
**Response:** Binary file download

#### 3. Generate User-Specific Report

```
POST /dashboard/generate-report/{userId}
```

**Access:** SuperAdmin, Admin, CRM Manager only
**Request Body:** Same as above
**Response:** Binary file download

## Implementation Details

### Role-Based Access Control

The dashboard implements strict role-based access:

1. **SuperAdmin/Admin/CRM Manager:**

   - Can view company-wide analytics
   - Can select and view individual user analytics
   - Can generate comprehensive reports
   - Full access to user management

2. **Sales/Support:**
   - Can only view their own analytics
   - Can generate personal reports
   - No access to other users' data

### Data Flow

1. **Authentication Check** → Determine user role
2. **Initial Data Load** → Load appropriate default view
3. **User Selection** (if manager) → Update analytics view
4. **Analytics Fetch** → Load role-appropriate data
5. **Report Generation** → Create role-specific reports

### Error Handling

- Graceful degradation for API failures
- Loading states for better UX
- Default empty data structures
- User-friendly error messages

### Performance Optimizations

- useCallback for expensive operations
- Conditional rendering based on role
- Efficient re-renders with proper dependencies
- Service layer for API abstraction

## Usage

### For Managers (SuperAdmin/Admin/CRM Manager)

1. **Company Overview**: Default view showing all company analytics
2. **User Selection**: Use dropdown to select specific users
3. **Report Generation**: Generate comprehensive reports for all or specific users

### For Individual Contributors (Sales/Support)

1. **Personal Dashboard**: View only personal analytics
2. **My Performance**: Track individual metrics and trends
3. **Personal Reports**: Generate reports for personal data

## Development

### Adding New Analytics

1. Update `AnalyticsData` interface in `dashboardService.ts`
2. Add corresponding backend endpoint
3. Update `RoleBasedAnalytics` component to display new data
4. Add role-based access controls if needed

### Adding New User Roles

1. Update `User` interface role enum
2. Add role checks in components
3. Update backend authorization
4. Test role-specific access patterns

## Security Considerations

- All API calls use `withCredentials: true` for session management
- Role-based authorization on both frontend and backend
- Input validation for user selections
- Secure file download handling for reports

## Dependencies

- React 18+ with hooks
- TypeScript for type safety
- Axios for HTTP requests
- Tailwind CSS for styling
- React Router for navigation
