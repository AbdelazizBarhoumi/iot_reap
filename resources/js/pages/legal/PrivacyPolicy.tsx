import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PrivacyPolicy() {
    const sections = [
        {
            id: 'introduction',
            title: '1. Introduction',
            content:
                'IoT-REAP ("we," "us," "our," or "Company") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and otherwise process your personal information in connection with the IoT-REAP platform (the "Service"). This Policy applies to all users, including engineers, instructors, administrators, and institutional partners.',
        },
        {
            id: 'information-collection',
            title: '2. Information We Collect',
            subsections: [
                {
                    subtitle: '2.1 Account Information',
                    content:
                        'When you create an account, we collect: name, email address, password (hashed), institutional affiliation, role/permissions, phone number (if provided), and profile picture. This information is necessary to provide the Service and authenticate your identity.',
                },
                {
                    subtitle: '2.2 Operational Data',
                    content:
                        'During your use of the Service, we collect: session logs (start/end times, duration), VM/lab access history, commands executed, telemetry data, camera feeds (if applicable), audio/video recordings (if recording is enabled), and IP addresses. This data is collected for security, audit, and compliance purposes.',
                },
                {
                    subtitle: '2.3 Device and Technical Data',
                    content:
                        'We automatically collect: browser type and version, operating system, device information, connection type, and usage analytics. We use cookies and similar technologies to track your preferences and improve the Service.',
                },
                {
                    subtitle: '2.4 Communication Data',
                    content:
                        'When you contact support or communicate through the Service, we collect and store: email messages, support tickets, chat transcripts, and any attached files. This helps us provide customer support and improve our services.',
                },
                {
                    subtitle: '2.5 Payment Information',
                    content:
                        'If applicable, payment processing is handled by third-party payment processors (e.g., Stripe). We do not store complete credit card numbers; payment information is processed and stored by these providers in compliance with PCI-DSS standards.',
                },
            ],
        },
        {
            id: 'legal-basis',
            title: '3. Legal Basis for Processing',
            content:
                'We process personal data on the following legal bases: (a) Contract - to fulfill our obligations under the Terms of Service; (b) Legitimate Interests - for security, fraud prevention, and service improvement; (c) Compliance with Legal Obligations - to meet regulatory and security requirements; (d) Consent - where you have explicitly opted in to certain data processing.',
        },
        {
            id: 'data-use',
            title: '4. How We Use Your Information',
            subsections: [
                {
                    subtitle: '4.1 Service Provision',
                    content:
                        'We use your information to create and maintain your account, provide access to labs and VMs, authenticate your identity, and deliver the features of the Service.',
                },
                {
                    subtitle: '4.2 Security and Compliance',
                    content:
                        'We process data for security monitoring, fraud detection, abuse prevention, audit logging, compliance with industry standards (IEC 62443, NIST), and to investigate potential violations of our Terms of Service.',
                },
                {
                    subtitle: '4.3 Analytics and Improvement',
                    content:
                        'We use aggregated and anonymized data to analyze usage patterns, improve performance, develop new features, conduct research, and understand user behavior. Individual identifiers are removed during this process.',
                },
                {
                    subtitle: '4.4 Communication',
                    content:
                        'We send you service-related emails (account notifications, session reminders, security alerts) and marketing communications if you have opted in. You can unsubscribe from marketing emails at any time.',
                },
                {
                    subtitle: '4.5 Legal Compliance',
                    content:
                        'We process data to comply with applicable laws, regulations, court orders, and legal processes, as well as to protect the rights, privacy, and safety of our users and the public.',
                },
            ],
        },
        {
            id: 'data-sharing',
            title: '5. Data Sharing and Disclosure',
            subsections: [
                {
                    subtitle: '5.1 Service Providers',
                    content:
                        'We share data with third-party service providers who assist in operating the Service: cloud infrastructure providers (servers, storage), payment processors, communication platforms (email, support), and analytics providers. All service providers are bound by confidentiality agreements.',
                },
                {
                    subtitle: '5.2 Institutional Administrators',
                    content:
                        "For institutional accounts, we share appropriate user data with your institution's administrators and security officers to enable account management and compliance monitoring.",
                },
                {
                    subtitle: '5.3 Legal Disclosure',
                    content:
                        'We may disclose information when required by law, court order, or government request, and when necessary to protect the security, rights, and safety of our users, employees, and the public.',
                },
                {
                    subtitle: '5.4 Business Transfers',
                    content:
                        'If IoT-REAP is involved in a merger, acquisition, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will provide notice and honor the choices you make regarding your data.',
                },
                {
                    subtitle: '5.5 No Sale of Data',
                    content:
                        'We do not sell, rent, or trade your personal information to third parties for marketing purposes. Any sharing is strictly for operational and compliance reasons.',
                },
            ],
        },
        {
            id: 'data-retention',
            title: '6. Data Retention',
            subsections: [
                {
                    subtitle: '6.1 Active Accounts',
                    content:
                        'While your account is active, we retain account information and operational logs for the duration of your subscription plus a retention period to support billing, dispute resolution, and compliance.',
                },
                {
                    subtitle: '6.2 Session and Activity Data',
                    content:
                        'Session logs, telemetry data, and video recordings are retained for 12 months by default. Institutional accounts may request different retention periods for compliance with their internal policies.',
                },
                {
                    subtitle: '6.3 Deleted Accounts',
                    content:
                        'Upon account deletion, most personal information is removed from our active systems within 30 days. However, some data may be retained for legal, compliance, or operational reasons (audit logs, fraud prevention) for up to 3 years.',
                },
                {
                    subtitle: '6.4 Backups',
                    content:
                        'We maintain encrypted backups for disaster recovery. Deleted data may remain in backups for up to 30 days before being purged as part of our backup lifecycle.',
                },
            ],
        },
        {
            id: 'data-security',
            title: '7. Data Security',
            subsections: [
                {
                    subtitle: '7.1 Security Measures',
                    content:
                        'We implement industry-standard security controls including: end-to-end encryption for sensitive data, TLS/SSL for data in transit, AES-256 encryption for data at rest, regular security audits and penetration testing, role-based access control, multi-factor authentication, and comprehensive logging and monitoring.',
                },
                {
                    subtitle: '7.2 Incident Response',
                    content:
                        'We maintain incident response procedures and will notify affected users of any unauthorized access or data breach in accordance with applicable laws. We aim to notify users within 72 hours of discovering a breach.',
                },
                {
                    subtitle: '7.3 Security Limitations',
                    content:
                        'While we implement strong security measures, no transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security, and you use the Service at your own risk.',
                },
                {
                    subtitle: '7.4 Your Responsibilities',
                    content:
                        'You are responsible for maintaining the confidentiality of your credentials and for notifying us immediately of any unauthorized access to your account. Do not share your login information with others.',
                },
            ],
        },
        {
            id: 'user-rights',
            title: '8. Your Rights and Choices',
            subsections: [
                {
                    subtitle: '8.1 Access and Portability',
                    content:
                        'You have the right to access your personal information and request a portable copy in a structured, machine-readable format (where applicable under data protection laws).',
                },
                {
                    subtitle: '8.2 Correction and Deletion',
                    content:
                        'You may request correction of inaccurate information or deletion of your data (subject to legal and operational requirements). Some data may need to be retained for compliance purposes.',
                },
                {
                    subtitle: '8.3 Marketing Communications',
                    content:
                        'You can opt out of marketing emails by clicking the "unsubscribe" link in any email or adjusting your notification preferences in your account settings. Service notifications cannot be disabled as they are essential.',
                },
                {
                    subtitle: '8.4 Cookie Management',
                    content:
                        'You can control cookies through your browser settings, though disabling some cookies may affect your ability to use certain features of the Service.',
                },
                {
                    subtitle: '8.5 Privacy Rights Under Law',
                    content:
                        'Depending on your location (e.g., GDPR in Europe, CCPA in California), you may have additional rights including the right to restrict processing, object to processing, and lodge complaints with data protection authorities.',
                },
            ],
        },
        {
            id: 'regional-provisions',
            title: '9. Regional Data Protection Laws',
            subsections: [
                {
                    subtitle: '9.1 GDPR (European Union)',
                    content:
                        'If you are in the EU/EEA, your data is processed in accordance with GDPR. You have the right to request access, deletion, rectification, and portability. You also have the right to lodge a complaint with your local data protection authority.',
                },
                {
                    subtitle: '9.2 CCPA (California)',
                    content:
                        'If you are a California resident, you have rights under CCPA including the right to know what personal information is collected, delete data, and opt out of certain processing activities.',
                },
                {
                    subtitle: '9.3 Other Jurisdictions',
                    content:
                        'We comply with applicable data protection laws in all jurisdictions where we operate. Contact us if you have specific questions about your local data protection rights.',
                },
            ],
        },
        {
            id: 'third-party-links',
            title: '10. Third-Party Links and Services',
            content:
                'The Service may contain links to third-party websites and services that are not operated by IoT-REAP. This Privacy Policy does not apply to these third-party services, and we are not responsible for their privacy practices. Please review their privacy policies before using their services.',
        },
        {
            id: 'children-privacy',
            title: '11. Childrens Privacy',
            content:
                "The Service is not intended for children under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete such information and terminate the child's access to the Service.",
        },
        {
            id: 'policy-changes',
            title: '12. Changes to This Privacy Policy',
            content:
                'We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of material changes by email or by posting the updated policy on the Service. Your continued use of the Service following the posting of changes constitutes your acceptance of those changes.',
        },
        {
            id: 'contact-privacy',
            title: '13. Contact Us',
            content:
                'If you have questions about this Privacy Policy, want to exercise your privacy rights, or wish to lodge a complaint, please contact: IoT-REAP Privacy Team, Email: privacy@iot-reap.io, Data Protection Officer: dpo@iot-reap.io. For institutional accounts, you may also contact your account administrator.',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <Head title="Privacy Policy" />
            {/* Header */}
            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <Link href="/">
                        <Button className="mb-4">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Home
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Privacy Policy
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Last updated: April 2026
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <Card className="bg-white/80 backdrop-blur-sm">
                    <div className="prose prose-sm max-w-none space-y-8 p-8">
                        {sections.map((section) => (
                            <section key={section.id} id={section.id}>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    {section.title}
                                </h2>
                                {section.content && (
                                    <p className="mt-3 leading-relaxed text-slate-700">
                                        {section.content}
                                    </p>
                                )}
                                {section.subsections && (
                                    <div className="mt-4 space-y-4">
                                        {section.subsections.map((sub, idx) => (
                                            <div key={idx}>
                                                <h3 className="font-medium text-slate-800">
                                                    {sub.subtitle}
                                                </h3>
                                                <p className="mt-2 leading-relaxed text-slate-700">
                                                    {sub.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}

                        {/* Table of Contents */}
                        <div className="border-t border-slate-200 pt-8">
                            <div className="rounded-lg bg-slate-50 p-6">
                                <h3 className="font-semibold text-slate-900">
                                    Quick Links
                                </h3>
                                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                                    {sections.map((section) => (
                                        <li key={section.id}>
                                            <a
                                                href={`#${section.id}`}
                                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {section.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Footer CTA */}
                <div className="mt-2 text-center">
                    <Link href="/">
                        <Button className="mt-4" size="lg">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
