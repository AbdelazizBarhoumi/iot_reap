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
    course?: {
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
 * Issue a certificate for a completed course.
 */
export async function issueCertificate(courseId: number): Promise<Certificate> {
    const response = await client.post<CertificateResponse>(
        `/certificates/courses/${courseId}`,
    );
    return response.data.data;
}
/**
 * Check if user has a certificate for a course.
 */
export async function checkCertificate(
    courseId: number,
): Promise<CheckCertificateResponse> {
    const response = await client.get<CheckCertificateResponse>(
        `/certificates/courses/${courseId}/check`,
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

