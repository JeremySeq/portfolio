let API_SERVER: string;

if (import.meta.env.MODE === 'development') {
    API_SERVER = 'http://localhost:5000/api';  // Local development API
} else {
    API_SERVER = window.location.origin + "/api";  // Production API
}

export default API_SERVER;
