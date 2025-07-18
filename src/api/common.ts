interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export default ApiResponse;