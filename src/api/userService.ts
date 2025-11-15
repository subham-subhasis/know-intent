export const BASE_URL =
  'https://asoszydi6wv2y5mwdbqdh2upfm0evcft.lambda-url.ap-south-1.on.aws';

type HttpMethod = 'GET' | 'POST';

async function request<T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
  timeoutMs = 10000
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
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

export interface SignupReq {
  email: string;
  password_hash: string;
  date_of_birth: string;
  interests: string[];
}

export interface SignupRes {
  ok: boolean;
  uid: string;
  profile_id: string;
}

export const signup = (data: SignupReq) =>
  request<SignupRes>('/signup', 'POST', data);

export interface SigninReq {
  identifier: string;
  otp_verified: boolean;
  device_info?: string;
  location_info?: string;
}

export interface SigninRes {
  ok: boolean;
  uid: string;
  session_id: string;
}

export const signin = (data: SigninReq) =>
  request<SigninRes>('/signin', 'POST', data);

export interface UpdateUsernameReq {
  current_uid: string;
  new_username: string;
}

export interface UpdateUsernameRes {
  ok: boolean;
  uid: string;
}

export const updateUsername = (data: UpdateUsernameReq) =>
  request<UpdateUsernameRes>('/update_username', 'POST', data);

export interface UpsertContactsReq {
  uid: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_verified?: boolean;
}

export interface UpsertContactsRes {
  ok: boolean;
  uid: string;
}

export const upsertContacts = (data: UpsertContactsReq) =>
  request<UpsertContactsRes>('/upsert_contacts', 'POST', data);

export type InterestLevel = 'primary' | 'secondary' | 'tertiary';

export interface UpsertInterestsReq {
  uid: string;
  operations: {
    op: 'add' | 'remove';
    interestKey: string;
    level: InterestLevel;
  }[];
}

export interface UpsertInterestsRes {
  ok: boolean;
  uid: string;
  profile_id: string;
}

export const upsertInterests = (data: UpsertInterestsReq) =>
  request<UpsertInterestsRes>('/upsert_interests', 'POST', data);

export interface GetPresignedUrlReq {
  uid: string;
  profile_id: string;
  file_name: string;
  content_type: string;
}

export interface GetPresignedUrlRes {
  ok: boolean;
  upload_url: string;
  image_url: string;
  key: string;
}

export const getPresignedUrl = (data: GetPresignedUrlReq) =>
  request<GetPresignedUrlRes>('/get_presigned_url', 'POST', data);

export interface UpdateProfileImageReq {
  uid: string;
  profile_id: string;
  image_url: string;
}

export interface UpdateProfileImageRes {
  ok: boolean;
  uid: string;
  profile_id: string;
  profile_image_url: string;
}

export const updateProfileImage = (data: UpdateProfileImageReq) =>
  request<UpdateProfileImageRes>('/update_profile_image', 'POST', data);

export interface GetInterestsRes {
  ok: boolean;
  count: number;
  interests: {
    slug: string;
    display_name: string;
  }[];
}

export const getInterests = () =>
  request<GetInterestsRes>('/get_interests', 'GET');

export interface ImportInterestsReq {
  bucket: string;
  key: string;
}

export interface ImportInterestsRes {
  ok: boolean;
  count: number;
  bucket: string;
  key: string;
}

export const importInterestsFromS3 = (data: ImportInterestsReq) =>
  request<ImportInterestsRes>('/import_interests_from_s3', 'POST', data);

export interface UpdateInterestsSeedReq {
  bucket: string;
  key: string;
  column: string;
}

export interface UpdateInterestsSeedRes {
  ok: boolean;
  new_added: number;
  marked_inactive: number;
  total: number;
}

export const updateInterestsSeed = (data: UpdateInterestsSeedReq) =>
  request<UpdateInterestsSeedRes>('/update_interests_seed', 'POST', data);

export interface GetUserProfileReq {
  uid: string;
}

export interface GetUserProfileRes {
  ok: boolean;
  uid: string;
  identifier: string;
  profile_id?: string;
  profile_image_url?: string;
  email?: string;
  phone_number?: string;
}

export const getUserProfile = (data: GetUserProfileReq) =>
  request<GetUserProfileRes>('/get_user_profile', 'POST', data);
