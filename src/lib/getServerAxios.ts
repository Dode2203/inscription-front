import { NextRequest } from "next/server";
import axios, { AxiosInstance } from "axios";

export function getServerAxios(request: NextRequest): AxiosInstance {
  const token = request.cookies.get("auth_token")?.value;

  const serverApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

//   serverApi.interceptors.response.use(
//   (response) => response,
//   (error: unknown) => {
//     if (axios.isAxiosError(error)) {
//       if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        
//         return Promise.reject(new Error("UNAUTHORIZED"));
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

  return serverApi;
}
