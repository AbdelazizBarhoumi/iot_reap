import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TermsOfService() {
    const sections = [
        {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            content:
                'By accessing and using the IoT-REAP platform (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you may not use the Service. We reserve the right to modify these terms at any time, and your continued use of the Service constitutes acceptance of any changes.',
        },
        {
            id: 'service-description',
            title: '2. Service Description',
            content:
                'IoT-REAP is a secure industrial remote operations platform that provides access to virtual lab environments, hands-on operational training, remote industrial control capabilities, and real-time telemetry data. The Service is designed for educational and industrial training purposes within authorized institutions and organizations.',
        },
        {
            id: 'account-registration',
            title: '3. Account Registration',
            subsections: [
                {
                    subtitle: '3.1 Account Creation',
                    content:
                        'To access the Service, you must create an account using valid credentials. You are responsible for maintaining the confidentiality of your login credentials and are fully responsible for all activities that occur under your account.',
                },
                {
                    subtitle: '3.2 Eligibility',
                    content:
                        'You represent and warrant that you are at least 18 years old and have the legal authority to enter into this agreement. Access is restricted to authorized users of accredited institutions, training organizations, and industrial enterprises.',
                },
                {
                    subtitle: '3.3 Accurate Information',
                    content:
                        'You agree to provide accurate, current, and complete information during registration and to update this information as needed. Providing false information may result in immediate account termination.',
                },
            ],
        },
        {
            id: 'acceptable-use',
            title: '4. Acceptable Use Policy',
            subsections: [
                {
                    subtitle: '4.1 Prohibited Activities',
                    content:
                        'You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorized access to the Service or its systems; (c) transmit viruses, malware, or harmful code; (d) reverse engineer or attempt to extract source code; (e) harass, abuse, or threaten other users; (f) access or use the Service in any way that violates industrial safety standards or OT security protocols.',
                },
                {
                    subtitle: '4.2 Security Protocols',
                    content:
                        'Users must comply with all security protocols, authentication requirements, and operational procedures established by their institution or organization. Any attempt to circumvent security measures will result in immediate suspension and potential legal action.',
                },
                {
                    subtitle: '4.3 Industrial Safety',
                    content:
                        'Users acknowledge that the Service involves virtual control of industrial systems. All operations must be performed following established safety procedures, incident response protocols, and emergency procedures. Unauthorized access or misuse of the Service could pose risks to operational systems.',
                },
            ],
        },
        {
            id: 'user-responsibilities',
            title: '5. User Responsibilities',
            subsections: [
                {
                    subtitle: '5.1 Training and Competency',
                    content:
                        'Users acknowledge that they have received appropriate training and possess the necessary competency to perform the operations they conduct through the Service. Users are responsible for maintaining their knowledge and certifications.',
                },
                {
                    subtitle: '5.2 Session Management',
                    content:
                        'Users are responsible for properly managing their sessions, including logging out when finished and not sharing session tokens or access URLs. Sessions automatically terminate after the scheduled duration.',
                },
                {
                    subtitle: '5.3 Data Security',
                    content:
                        'Users must protect any credentials, tokens, or data accessed through the Service and must not transmit sensitive information through insecure channels. Users are responsible for backing up any important work before session termination.',
                },
            ],
        },
        {
            id: 'intellectual-property',
            title: '6. Intellectual Property Rights',
            subsections: [
                {
                    subtitle: '6.1 Service Content',
                    content:
                        'All content, features, and functionality of the Service, including but not limited to text, graphics, logos, images, and software, are owned by IoT-REAP or its content suppliers and are protected by copyright, trademark, and other intellectual property laws.',
                },
                {
                    subtitle: '6.2 User Content',
                    content:
                        'You retain ownership of any content you upload or create through the Service ("User Content"). You grant IoT-REAP a non-exclusive, royalty-free license to use, reproduce, and display User Content for the purposes of providing the Service, including generating reports, analytics, and training materials.',
                },
                {
                    subtitle: '6.3 License Grant',
                    content:
                        'We grant you a limited, non-exclusive, non-transferable license to access and use the Service solely for your authorized purpose. This license does not include any right to sell, transfer, or assign your access to others.',
                },
            ],
        },
        {
            id: 'limitation-of-liability',
            title: '7. Limitation of Liability',
            subsections: [
                {
                    subtitle: '7.1 Disclaimer',
                    content:
                        'THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.',
                },
                {
                    subtitle: '7.2 Liability Cap',
                    content:
                        'IN NO EVENT SHALL IOT-REAP BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR REVENUE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
                },
                {
                    subtitle: '7.3 Operational Liability',
                    content:
                        'Users acknowledge that the Service is a virtual training platform. Any decisions made based on information obtained through the Service are the sole responsibility of the user. IoT-REAP is not responsible for operational consequences or decisions made by users.',
                },
            ],
        },
        {
            id: 'privacy-compliance',
            title: '8. Privacy and Data Protection',
            content:
                'Your use of the Service is subject to our Privacy Policy. We collect, process, and protect user data in accordance with applicable data protection regulations. For details, please refer to our Privacy Policy.',
        },
        {
            id: 'termination',
            title: '9. Termination',
            subsections: [
                {
                    subtitle: '9.1 Termination by User',
                    content:
                        'You may terminate your account at any time by contacting support. Upon termination, all access to the Service will be revoked and data retention will follow our Privacy Policy.',
                },
                {
                    subtitle: '9.2 Termination by IoT-REAP',
                    content:
                        'We may terminate or suspend your account immediately if you violate these Terms of Service, engage in unauthorized access, or pose a security risk. We will provide notice where applicable, except in cases of clear security threats.',
                },
            ],
        },
        {
            id: 'governing-law',
            title: '10. Governing Law',
            content:
                'These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction where IoT-REAP operates, without regard to its conflict of law provisions. Any legal action or proceeding shall be resolved through binding arbitration or in the courts of that jurisdiction.',
        },
        {
            id: 'modifications',
            title: '11. Modifications to Terms',
            content:
                'IoT-REAP reserves the right to modify these Terms of Service at any time. We will provide notice of material changes via email or by posting the updated terms on the Service. Your continued use of the Service following the posting of modified terms constitutes your acceptance of those changes.',
        },
        {
            id: 'contact',
            title: '12. Contact Information',
            content:
                'If you have questions about these Terms of Service or need to report a violation, please contact our support team at support@iot-reap.io. For institutional accounts, contact your account administrator.',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <Head title="Terms of Service" />

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
                        Terms of Service
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
                                    <p className="mt-3 text-slate-700 leading-relaxed">
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
                                                <p className="mt-2 text-slate-700 leading-relaxed">
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
