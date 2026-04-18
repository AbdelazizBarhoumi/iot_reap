/**
 * Certificates API module.
 */
import client from './client';
export interface Certificate {
    id: number;
    hash: string;
    issued_at: string;
    verification_url: string;
    download_url: string;
    has_pdf: boolean;
    trainingPath?: {
        id: number;
        title: string;
        thumbnail: string | null;
    };
    user?: {
        id: string;
        name: string;
    };
}
interface CertificatesResponse {
    data: Certificate[];
}
interface CertificateResponse {
    data: Certificate;
    message?: string;
}
interface CheckCertificateResponse {
    has_certificate: boolean;
    data: Certificate | null;
}
interface VerifyResponse {
    valid: boolean;
    certificate?: Certificate;
    message?: string;
}
/**
 * Get all certificates for the current user.
 */
export async function getCertificates(): Promise<Certificate[]> {
    const response = await client.get<CertificatesResponse>('/certificates');
    return response.data.data;
}
/**
 * Issue a certificate for a completed trainingPath.
 */
export async function issueCertificate(trainingPathId: number): Promise<Certificate> {
    const response = await client.post<CertificateResponse>(
        `/certificates/trainingPaths/${trainingPathId}`,
    );
    return response.data.data;
}
/**
 * Check if user has a certificate for a trainingPath.
 */
export async function checkCertificate(
    trainingPathId: number,
): Promise<CheckCertificateResponse> {
    const response = await client.get<CheckCertificateResponse>(
        `/certificates/trainingPaths/${trainingPathId}/check`,
    );
    return response.data;
}
/**
 * Verify a certificate by hash.
 */
export async function verifyCertificate(hash: string): Promise<VerifyResponse> {
    const response = await client.get<VerifyResponse>(
        `/certificates/verify/${hash}`,
    );
    return response.data;
}
/**
 * Get download URL for a certificate.
 */
export function getCertificateDownloadUrl(hash: string): string {
    return `/certificates/${hash}/download`;
}
export const certificatesApi = {
    getCertificates,
    issueCertificate,
    checkCertificate,
    verifyCertificate,
    getCertificateDownloadUrl,
};

