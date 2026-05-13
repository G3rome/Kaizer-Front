import { http } from './http';

type LoginResponse = {
  token: string;
};

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>(
    '/api/auth/login',
    { email, password }
  );

  return data;
}

export async function register(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>(
    '/api/auth/register',
    { email, password }
  );

  return data;
}
