export const BASE_URL =
  'https://asoszydi6wv2y5mwdbqdh2upfm0evcft.lambda-url.ap-south-1.on.aws';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';

async function request<T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
  authToken?: string,
  timeoutMs = 10000
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!res.ok) {
      let err: any = {};
      try {
        err = await res.json();
      } catch {}
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

export interface AuthSignupReq {
  email?: string;
  phone?: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthSignupRes {
  status: string;
  user: {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    first_name: string;
    last_name: string;
    profile_pic_url?: string;
    kpis?: string[];
    gender?: string;
    date_of_birth?: string;
    meta?: any;
  };
  auth_token: string;
}

export const authSignup = (data: AuthSignupReq) =>
  request<AuthSignupRes>('/auth/signup', 'POST', data);

export interface AuthSigninReq {
  identifier: string;
  password: string;
}

export interface AuthSigninRes {
  status: string;
  user: {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    first_name: string;
    last_name: string;
    profile_pic_url?: string;
    kpis?: string[];
    gender?: string;
    date_of_birth?: string;
    meta?: any;
  };
  auth_token: string;
}

export const authSignin = (data: AuthSigninReq) =>
  request<AuthSigninRes>('/auth/signin', 'POST', data);

export interface GetUserDetailsReq {
  identifier: string;
}

export interface GetUserDetailsRes {
  status: string;
  user: {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    first_name: string;
    last_name: string;
    profile_pic_url?: string;
    kpis?: string[];
    gender?: string;
    date_of_birth?: string;
    meta?: any;
  };
}

export const getUserDetails = (identifier: string) =>
  request<GetUserDetailsRes>(`/getUserDetails?identifier=${encodeURIComponent(identifier)}`, 'GET');

export interface UpdateUserReq {
  username?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  kpis?: string[];
  profile_pic_url?: string;
}

export interface UpdateUserRes {
  status: string;
  user: {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    first_name: string;
    last_name: string;
    profile_pic_url?: string;
    kpis?: string[];
    gender?: string;
    date_of_birth?: string;
    meta?: any;
  };
}

export const updateUser = (userId: string, data: UpdateUserReq, authToken: string) =>
  request<UpdateUserRes>(`/user/${userId}`, 'PUT', data, authToken);

