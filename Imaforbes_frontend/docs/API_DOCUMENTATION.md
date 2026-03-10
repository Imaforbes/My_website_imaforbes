# 🚀 API Fetch System Documentation

## Overview

This portfolio project now includes a comprehensive API Fetch system that provides centralized API management, error handling, loading states, and reusable hooks for all API interactions.

## 📁 File Structure

```
src/
├── services/
│   └── api.js                 # Centralized API service
├── hooks/
│   └── useApi.js             # Custom React hooks for API calls
├── components/
│   ├── ErrorBoundary.jsx     # React error boundary
│   ├── LoadingSpinner.jsx    # Loading components
│   └── ErrorMessage.jsx      # Error display components
└── pages/
    └── ContactPage.jsx       # Updated to use new API system
```

## 🛠️ Core Components

### 1. API Service (`src/services/api.js`)

The central API service that handles all HTTP requests with built-in error handling.

```javascript
import apiService, { api, apiUtils } from "../services/api";

// Basic usage
const result = await api.contact.send({
  name: "John Doe",
  email: "john@example.com",
  message: "Hello!",
});

// With error handling
if (result.success) {
  console.log("Success:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### 2. Custom Hooks (`src/hooks/useApi.js`)

Pre-built hooks for common API patterns with loading states and error handling.

#### Available Hooks:

- `useApi()` - Generic API hook
- `useApiOnMount()` - API hook that runs on component mount
- `useContact()` - Contact form management
- `useProjects()` - Project management
- `useAdminMessages()` - Admin message management
- `useAuth()` - Authentication management
- `useFileUpload()` - File upload functionality

## 📖 Usage Examples

### Contact Form Hook

```javascript
import { useContact } from "../hooks/useApi";

const ContactForm = () => {
  const { formData, status, handleChange, sendMessage, clearStatus } =
    useContact();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Your name"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Your email"
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Your message"
      />
      <button type="submit" disabled={status.sending}>
        {status.sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};
```

### Projects Management

```javascript
import { useProjects } from "../hooks/useApi";

const ProjectsPage = () => {
  const {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {projects?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
```

### Authentication

```javascript
import { useAuth } from "../hooks/useApi";

const LoginForm = () => {
  const { login, loading, isAuthenticated } = useAuth();

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      // Redirect to dashboard
    }
  };

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <LoginForm onSubmit={handleLogin} loading={loading} />;
};
```

## 🎨 UI Components

### Loading States

```javascript
import LoadingSpinner, { LoadingOverlay, SkeletonCard } from '../components/LoadingSpinner';

// Basic spinner
<LoadingSpinner size="lg" text="Loading..." />

// Full screen loading
<LoadingSpinner fullScreen text="Loading application..." />

// Loading overlay
<LoadingOverlay isLoading={loading} text="Saving...">
  <YourContent />
</LoadingOverlay>

// Skeleton loading
<SkeletonCard />
```

### Error Handling

```javascript
import ErrorMessage, { ErrorToast, NetworkStatus } from '../components/ErrorMessage';

// Error message
<ErrorMessage
  error={error}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>

// Toast notification
<ErrorToast
  error={error}
  onDismiss={handleDismiss}
  duration={5000}
/>

// Network status (automatically shows when offline)
<NetworkStatus />
```

## 🔧 API Endpoints

### Contact Endpoints

```javascript
// Send contact message
const result = await api.contact.send({
  name: "John Doe",
  email: "john@example.com",
  message: "Hello!",
});

// Get messages (admin)
const messages = await api.contact.getMessages();

// Delete message (admin)
await api.contact.deleteMessage(messageId);
```

### Project Endpoints

```javascript
// Get all projects
const projects = await api.projects.getAll();

// Get project by ID
const project = await api.projects.getById(projectId);

// Create project
const newProject = await api.projects.create({
  title: "New Project",
  description: "Project description",
  image: "image-url",
});

// Update project
await api.projects.update(projectId, updateData);

// Delete project
await api.projects.delete(projectId);
```

### Authentication Endpoints

```javascript
// Login
const result = await api.auth.login({
  email: "user@example.com",
  password: "password",
});

// Logout
await api.auth.logout();

// Verify token
const user = await api.auth.verify();
```

### File Upload

```javascript
// Upload image
const result = await api.upload.image(file);

// Upload document
const result = await api.upload.document(file);
```

## 🚨 Error Handling

The API system includes comprehensive error handling:

### Error Types

- `NETWORK_ERROR` - Connection issues
- `SERVER_ERROR` - Server-side errors (5xx)
- `AUTH_ERROR` - Authentication/authorization errors
- `VALIDATION_ERROR` - Input validation errors
- `NOT_FOUND` - Resource not found (404)

### Error Handling Pattern

```javascript
import { handleApiError, ApiError } from "../services/api";

try {
  const result = await api.contact.send(data);
  if (result.success) {
    // Handle success
  } else {
    // Handle API error
    const error = handleApiError(result.error);
    setError(error);
  }
} catch (error) {
  // Handle network or other errors
  const apiError = handleApiError(error);
  setError(apiError);
}
```

## 🔄 Loading States

### Using Loading Hooks

```javascript
const { data, loading, error, execute } = useApi(api.projects.getAll);

// Execute with loading state
const handleRefresh = async () => {
  await execute();
};
```

### Manual Loading States

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    const result = await api.contact.send(data);
    // Handle result
  } finally {
    setLoading(false);
  }
};
```

## 🎯 Best Practices

### 1. Use Custom Hooks

```javascript
// ✅ Good - Use custom hooks
const { formData, status, sendMessage } = useContact();

// ❌ Avoid - Manual state management
const [formData, setFormData] = useState({});
const [loading, setLoading] = useState(false);
```

### 2. Handle Errors Gracefully

```javascript
// ✅ Good - Comprehensive error handling
const handleSubmit = async (data) => {
  try {
    const result = await api.contact.send(data);
    if (result.success) {
      showSuccess("Message sent!");
    } else {
      showError(result.error.message);
    }
  } catch (error) {
    showError("Network error. Please try again.");
  }
};
```

### 3. Use Loading States

```javascript
// ✅ Good - Show loading state
<button disabled={loading}>
  {loading ? 'Sending...' : 'Send'}
</button>

// ❌ Avoid - No loading feedback
<button onClick={handleSubmit}>Send</button>
```

### 4. Implement Error Boundaries

```javascript
// ✅ Good - Wrap components in error boundaries
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## 🔧 Configuration

### Environment Variables

```javascript
// .env
REACT_APP_API_URL=http://localhost/api_db
REACT_APP_API_TIMEOUT=10000
```

### API Service Configuration

```javascript
// src/services/api.js
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost/api_db";
    this.timeout = process.env.REACT_APP_API_TIMEOUT || 10000;
  }
}
```

## 📱 Responsive Design

All components are fully responsive and work on:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Styling

The API system uses Tailwind CSS for styling and includes:

- Consistent color schemes
- Responsive breakpoints
- Accessibility features
- Dark/light mode support

## 🚀 Performance

### Optimizations

- Request debouncing
- Automatic retry logic
- Request caching
- Lazy loading
- Error boundary isolation

### Monitoring

```javascript
// Performance monitoring
const result = await apiUtils.withRetry(
  () => api.contact.send(data),
  3, // max retries
  1000 // delay between retries
);
```

## 📚 Additional Resources

- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Error Boundaries Guide](https://reactjs.org/docs/error-boundaries.html)

---

**🎉 Your portfolio now has a complete, production-ready API Fetch system!**
