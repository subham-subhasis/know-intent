import CryptoJS from 'crypto-js';
import { PickedAsset } from '@/lib/imagePicker';
import { BASE_URL } from '@/src/api/userService';

type InitiateResp = {
  uploadSessionId: string;
  videoId: string;
  s3: {
    presignedUrl: string;
    headers: Record<string, string>;
  };
};

type InitiateUploadBody = {
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  checksum: {
    algorithm: 'SHA256';
    value: string;
  };
  title: string;
  description: string;
  declaredKpis: string[];
  language: string;
  uploadMode: 'SINGLE_PART';
  idempotencyKey: string;
};

const DEFAULT_API_BASE = BASE_URL;

export class UploadServiceError extends Error {
  userMessage: string;

  constructor(message: string, userMessage: string) {
    super(message);
    this.name = 'UploadServiceError';
    this.userMessage = userMessage;
  }
}

type LocalAssetFile = {
  blob: any;
  size: number;
};

async function readLocalAsset(uri: string): Promise<LocalAssetFile> {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Unable to read file URI: ${response.status}`);
    }

    const blob = await response.blob();
    return { blob, size: blob.size };
  } catch (error) {
    throw new UploadServiceError(
      `Unable to read selected file: ${String(error)}`,
      'We could not read the selected file. Please choose it again and retry.'
    );
  }
}

function readBlobAsBase64(blob: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Unable to read selected file.'));
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;

      if (!base64) {
        reject(new Error('Selected file could not be processed.'));
        return;
      }

      resolve(base64);
    };

    reader.readAsDataURL(blob);
  });
}

export async function sha256HexForBlob(blob: any): Promise<string> {
  const base64 = await readBlobAsBase64(blob);
  return CryptoJS.SHA256(CryptoJS.enc.Base64.parse(base64)).toString(CryptoJS.enc.Hex);
}

export async function sha256HexForFile(uri: string): Promise<string> {
  const { blob } = await readLocalAsset(uri);
  return sha256HexForBlob(blob);
}

export async function initiateUpload(params: {
  baseUrl?: string;
  creatorId: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  checksumHex: string;
  title?: string;
  description?: string;
  declaredKpis?: string[];
  language?: string;
}): Promise<InitiateResp> {
  const baseUrl = params.baseUrl ?? DEFAULT_API_BASE;
  const body = buildInitiateUploadBody(params);

  const res = await fetch(`${baseUrl}/v1/uploads/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Creator-Id': params.creatorId,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await parseUploadError(res);
    throw new UploadServiceError(
      `Initiate failed: ${res.status} ${message}`,
      message || 'We could not prepare your upload. Please check your connection and try again.'
    );
  }

  return (await res.json()) as InitiateResp;
}

export async function uploadFileToS3(presignedUrl: string, headers: Record<string, string>, file: any) {
  const result = await fetch(presignedUrl, {
    method: 'PUT',
    headers,
    body: file as any,
  });

  if (!result.ok) {
    throw new UploadServiceError(
      `S3 upload failed: ${result.status}`,
      'The file could not be uploaded to storage. Please check your connection and retry.'
    );
  }

  return result;
}

export async function completeUpload(baseUrl: string | undefined, uploadSessionId: string, creatorId: string) {
  const base = baseUrl ?? DEFAULT_API_BASE;
  const res = await fetch(`${base}/v1/uploads/${uploadSessionId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Creator-Id': creatorId,
    },
  });

  if (!res.ok) {
    const message = await parseUploadError(res);
    throw new UploadServiceError(
      `Complete failed: ${res.status} ${message}`,
      message || 'Your file uploaded, but we could not finish saving it. Please retry.'
    );
  }

  return await res.json().catch(() => ({}));
}

export async function uploadAsset(
  asset: PickedAsset,
  creatorId: string,
  opts?: {
    baseUrl?: string;
    title?: string;
    description?: string;
    declaredKpis?: string[];
    language?: string;
    complete?: boolean;
  }
) {
  const baseUrl = opts?.baseUrl ?? DEFAULT_API_BASE;
  const contentType = getContentType(asset);
  const localFile = await readLocalAsset(asset.uri);
  const checksumHex = await sha256HexForBlob(localFile.blob);

  const init = await initiateUpload({
    baseUrl,
    creatorId,
    fileName: asset.fileName ?? 'file',
    contentType,
    fileSizeBytes: asset.fileSize ?? localFile.size,
    checksumHex,
    title: opts?.title,
    description: opts?.description,
    declaredKpis: opts?.declaredKpis,
    language: opts?.language,
  });

  await uploadFileToS3(init.s3.presignedUrl, init.s3.headers, localFile.blob);

  if (opts?.complete ?? true) {
    await completeUpload(baseUrl, init.uploadSessionId, creatorId);
  }

  return { uploadSessionId: init.uploadSessionId, videoId: init.videoId };
}

function cryptoRandomUuid() {
  const hex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

function buildInitiateUploadBody(params: {
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  checksumHex: string;
  title?: string;
  description?: string;
  declaredKpis?: string[];
  language?: string;
}): InitiateUploadBody {
  return {
    fileName: params.fileName,
    contentType: params.contentType,
    fileSizeBytes: params.fileSizeBytes,
    checksum: {
      algorithm: 'SHA256',
      value: params.checksumHex,
    },
    title: params.title ?? '',
    description: params.description ?? '',
    declaredKpis: params.declaredKpis ?? [],
    language: params.language ?? 'en',
    uploadMode: 'SINGLE_PART',
    idempotencyKey: cryptoRandomUuid(),
  };
}

function getContentType(asset: PickedAsset) {
  if (asset.mimeType) return asset.mimeType;

  const fileName = asset.fileName?.toLowerCase() || '';
  if (fileName.endsWith('.mp4')) return 'video/mp4';
  if (fileName.endsWith('.mov')) return 'video/quicktime';
  if (fileName.endsWith('.jpeg') || fileName.endsWith('.jpg')) return 'image/jpeg';
  if (fileName.endsWith('.png')) return 'image/png';
  if (fileName.endsWith('.heic')) return 'image/heic';
  if (fileName.endsWith('.heif')) return 'image/heif';
  if (fileName.endsWith('.webp')) return 'image/webp';

  if (asset.type.startsWith('video')) return 'video/mp4';
  return 'image/jpeg';
}

async function parseUploadError(response: Response) {
  try {
    const data = await response.json();
    return data?.message || data?.error || `Upload request failed (${response.status}).`;
  } catch {
    const text = await response.text().catch(() => '');
    return text || `Upload request failed (${response.status}).`;
  }
}

export function getUploadUserMessage(error: unknown) {
  if (error instanceof UploadServiceError) {
    return error.userMessage;
  }

  const message = error instanceof Error ? error.message : '';
  if (/network request failed|failed to fetch|network/i.test(message)) {
    return 'We could not connect to the upload service. Please check your internet connection and try again.';
  }

  return 'We could not upload your content right now. Please try again in a moment.';
}
