// Add your custom types here
export interface User {
  id: string;
  name: string;
  email: string;
}

// Example API response type
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
