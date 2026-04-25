/**
 * Connection Preferences Page
 *
 * Allows users to manage Guacamole connection configurations per protocol (RDP/VNC/SSH).
 * These preferences are applied when building the Guacamole connection to a VM.
 */
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Loader2,
    Monitor,
    Plus,
    Save,
    Settings2,
    Star,
    Terminal,
    Trash2,
    Wifi,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import client from '@/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';
interface ConnectionProfile {
    profile_name: string;
    is_default: boolean;
    parameters: Record<string, string>;
}
interface ConnectionPreferencesPageProps {
    profiles?: {
        rdp: ConnectionProfile[];
        vnc: ConnectionProfile[];
        ssh: ConnectionProfile[];
    };
    // Support legacy preferences format for backward compatibility
    preferences?: {
        rdp: Record<string, string>;
        vnc: Record<string, string>;
        ssh: Record<string, string>;
    };
}
// Helper to convert any null/undefined values to empty strings and ensure all entries are strings.
function normalizeParams(
    raw: Record<string, unknown> | undefined | null,
): Record<string, string> {
    if (!raw) return {};
    const result: Record<string, string> = {};
    Object.entries(raw).forEach(([key, value]) => {
        result[key] = value == null ? '' : String(value);
    });
    return result;
}
// Extract default profile parameters from profiles array, or fallback to legacy format
function getDefaultParams(
    profiles: ConnectionProfile[] | undefined,
    legacyParams: Record<string, string> | undefined,
): Record<string, string> {
    if (profiles?.length) {
        const defaultProfile =
            profiles.find((p) => p.is_default) ?? profiles[0];
        return normalizeParams(defaultProfile?.parameters);
    }
    return normalizeParams(legacyParams);
}

// Helper to extract and log validation errors from axios error responses
function getErrorMessage(error: unknown): string {
    const isAxiosError = (
        err: unknown,
    ): err is { response?: { data?: { errors?: Record<string, string[]> } } } =>
        typeof err === 'object' && err !== null && 'response' in err;

    if (isAxiosError(error) && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.entries(validationErrors)
            .map(
                ([field, messages]) =>
                    `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`,
            )
            .join('\n');
        console.error('Validation errors:', validationErrors);
        return errorMessages;
    }
    if (error instanceof Error) {
        console.error('Error:', error);
        return error.message;
    }
    console.error('Unknown error:', error);
    return 'Failed to save';
}

// ─── Profile Manager Component ───
interface ProfileManagerProps {
    protocol: string;
    profiles: ConnectionProfile[];
    selectedProfile: ConnectionProfile | null;
    onSelectProfile: (profile: ConnectionProfile) => void;
    onProfilesChange: () => void;
}
function ProfileManager({
    protocol,
    profiles,
    selectedProfile,
    onSelectProfile,
    onProfilesChange,
}: ProfileManagerProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [settingDefault, setSettingDefault] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const handleCreateProfile = async () => {
        if (!newProfileName.trim()) return;
        setCreating(true);
        setError(null);
        try {
            await client.post(`/connection-preferences/${protocol}`, {
                profile_name: newProfileName.trim(),
                is_default: profiles.length === 0, // First profile is default
                parameters: {},
            });
            setShowCreateDialog(false);
            setNewProfileName('');
            onProfilesChange();
        } catch (e) {
            setError(
                e instanceof Error ? e.message : 'Failed to create profile',
            );
        } finally {
            setCreating(false);
        }
    };
    const handleDeleteProfile = async (profileName: string) => {
        if (!confirm(`Delete profile "${profileName}"? This cannot be undone.`))
            return;
        setDeleting(profileName);
        setError(null);
        try {
            await client.delete(
                `/connection-preferences/${protocol}/${encodeURIComponent(profileName)}`,
            );
            onProfilesChange();
        } catch (e) {
            setError(
                e instanceof Error ? e.message : 'Failed to delete profile',
            );
        } finally {
            setDeleting(null);
        }
    };
    const handleSetDefault = async (profileName: string) => {
        setSettingDefault(profileName);
        setError(null);
        try {
            await client.patch(
                `/connection-preferences/${protocol}/${encodeURIComponent(profileName)}/default`,
            );
            onProfilesChange();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to set default');
        } finally {
            setSettingDefault(null);
        }
    };
    return (
        <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Profiles</h3>
                <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Profile
                </Button>
            </div>
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {profiles.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>
                            No profiles yet. Create one to save your{' '}
                            {protocol.toUpperCase()} connection settings.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-2">
                    {profiles.map((profile) => (
                        <div
                            key={profile.profile_name}
                            className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                                selectedProfile?.profile_name ===
                                profile.profile_name
                                    ? 'border-secondary bg-secondary/5'
                                    : 'hover:bg-muted/50'
                            }`}
                            onClick={() => onSelectProfile(profile)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-medium">
                                    {profile.profile_name}
                                </span>
                                {profile.is_default && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        Default
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {!profile.is_default && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSetDefault(
                                                profile.profile_name,
                                            );
                                        }}
                                        disabled={
                                            settingDefault ===
                                            profile.profile_name
                                        }
                                    >
                                        {settingDefault ===
                                        profile.profile_name ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Star className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProfile(
                                            profile.profile_name,
                                        );
                                    }}
                                    disabled={
                                        deleting === profile.profile_name ||
                                        profiles.length === 1
                                    }
                                >
                                    {deleting === profile.profile_name ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Create {protocol.toUpperCase()} Profile
                        </DialogTitle>
                        <DialogDescription>
                            Create a new connection profile with custom
                            settings.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="profile-name">Profile Name</Label>
                        <Input
                            id="profile-name"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            placeholder="e.g., Work PC, Lab Machine"
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateProfile}
                            disabled={creating || !newProfileName.trim()}
                        >
                            {creating && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
export default function ConnectionPreferencesPage({
    profiles,
    preferences,
}: ConnectionPreferencesPageProps) {
    const { auth } = usePage().props as { auth: { user?: { role?: string } } };
    const isAdmin = auth?.user?.role === 'admin';
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: isAdmin ? admin.dashboard().url : dashboard().url,
        },
        { title: 'Connection Preferences', href: '/connection-preferences' },
    ];
    // State to track profiles and selected profile per protocol
    const [rdpProfiles, setRdpProfiles] = useState<ConnectionProfile[]>(
        profiles?.rdp ?? [],
    );
    const [vncProfiles, setVncProfiles] = useState<ConnectionProfile[]>(
        profiles?.vnc ?? [],
    );
    const [sshProfiles, setSshProfiles] = useState<ConnectionProfile[]>(
        profiles?.ssh ?? [],
    );
    const [selectedRdpProfile, setSelectedRdpProfile] =
        useState<ConnectionProfile | null>(
            rdpProfiles.find((p) => p.is_default) ?? rdpProfiles[0] ?? null,
        );
    const [selectedVncProfile, setSelectedVncProfile] =
        useState<ConnectionProfile | null>(
            vncProfiles.find((p) => p.is_default) ?? vncProfiles[0] ?? null,
        );
    const [selectedSshProfile, setSelectedSshProfile] =
        useState<ConnectionProfile | null>(
            sshProfiles.find((p) => p.is_default) ?? sshProfiles[0] ?? null,
        );
    // Refresh profiles from server
    const refreshProfiles = useCallback(async () => {
        try {
            const response = await client.get('/connection-preferences');
            const data = response.data.data;
            setRdpProfiles(data.rdp ?? []);
            setVncProfiles(data.vnc ?? []);
            setSshProfiles(data.ssh ?? []);
            // Update selected profiles
            setSelectedRdpProfile((prev) => {
                const updated = (data.rdp ?? []).find(
                    (p: ConnectionProfile) =>
                        p.profile_name === prev?.profile_name,
                );
                return (
                    updated ??
                    (data.rdp ?? []).find(
                        (p: ConnectionProfile) => p.is_default,
                    ) ??
                    (data.rdp ?? [])[0] ??
                    null
                );
            });
            setSelectedVncProfile((prev) => {
                const updated = (data.vnc ?? []).find(
                    (p: ConnectionProfile) =>
                        p.profile_name === prev?.profile_name,
                );
                return (
                    updated ??
                    (data.vnc ?? []).find(
                        (p: ConnectionProfile) => p.is_default,
                    ) ??
                    (data.vnc ?? [])[0] ??
                    null
                );
            });
            setSelectedSshProfile((prev) => {
                const updated = (data.ssh ?? []).find(
                    (p: ConnectionProfile) =>
                        p.profile_name === prev?.profile_name,
                );
                return (
                    updated ??
                    (data.ssh ?? []).find(
                        (p: ConnectionProfile) => p.is_default,
                    ) ??
                    (data.ssh ?? [])[0] ??
                    null
                );
            });
        } catch (e) {
            console.error('Failed to refresh profiles', e);
        }
    }, []);
    // Support both new profiles and legacy preferences format
    const rdpParams = normalizeParams(
        selectedRdpProfile?.parameters ??
            getDefaultParams(profiles?.rdp, preferences?.rdp),
    );
    const vncParams = normalizeParams(
        selectedVncProfile?.parameters ??
            getDefaultParams(profiles?.vnc, preferences?.vnc),
    );
    const sshParams = normalizeParams(
        selectedSshProfile?.parameters ??
            getDefaultParams(profiles?.ssh, preferences?.ssh),
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Connection Preferences" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                        <Settings2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-foreground">
                            Connection Preferences
                        </h1>
                        <p className="text-muted-foreground">
                            Configure default Guacamole connection settings per
                            protocol. These are applied when launching sessions.
                        </p>
                    </div>
                </motion.div>
                <Tabs defaultValue="rdp" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                            value="rdp"
                            className="flex items-center gap-2"
                        >
                            <Monitor className="h-4 w-4" />
                            RDP
                        </TabsTrigger>
                        <TabsTrigger
                            value="vnc"
                            className="flex items-center gap-2"
                        >
                            <Wifi className="h-4 w-4" />
                            VNC
                        </TabsTrigger>
                        <TabsTrigger
                            value="ssh"
                            className="flex items-center gap-2"
                        >
                            <Terminal className="h-4 w-4" />
                            SSH
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="rdp">
                        <ProfileManager
                            protocol="rdp"
                            profiles={rdpProfiles}
                            selectedProfile={selectedRdpProfile}
                            onSelectProfile={setSelectedRdpProfile}
                            onProfilesChange={refreshProfiles}
                        />
                        {selectedRdpProfile && (
                            <RDPPreferences
                                key={selectedRdpProfile.profile_name}
                                initialParams={rdpParams}
                                profileName={selectedRdpProfile.profile_name}
                                onSaved={refreshProfiles}
                            />
                        )}
                        {!selectedRdpProfile && rdpProfiles.length === 0 && (
                            <p className="py-8 text-center text-muted-foreground">
                                Create a profile above to configure RDP
                                settings.
                            </p>
                        )}
                    </TabsContent>
                    <TabsContent value="vnc">
                        <ProfileManager
                            protocol="vnc"
                            profiles={vncProfiles}
                            selectedProfile={selectedVncProfile}
                            onSelectProfile={setSelectedVncProfile}
                            onProfilesChange={refreshProfiles}
                        />
                        {selectedVncProfile && (
                            <VNCPreferences
                                key={selectedVncProfile.profile_name}
                                initialParams={vncParams}
                                profileName={selectedVncProfile.profile_name}
                                onSaved={refreshProfiles}
                            />
                        )}
                        {!selectedVncProfile && vncProfiles.length === 0 && (
                            <p className="py-8 text-center text-muted-foreground">
                                Create a profile above to configure VNC
                                settings.
                            </p>
                        )}
                    </TabsContent>
                    <TabsContent value="ssh">
                        <ProfileManager
                            protocol="ssh"
                            profiles={sshProfiles}
                            selectedProfile={selectedSshProfile}
                            onSelectProfile={setSelectedSshProfile}
                            onProfilesChange={refreshProfiles}
                        />
                        {selectedSshProfile && (
                            <SSHPreferences
                                key={selectedSshProfile.profile_name}
                                initialParams={sshParams}
                                profileName={selectedSshProfile.profile_name}
                                onSaved={refreshProfiles}
                            />
                        )}
                        {!selectedSshProfile && sshProfiles.length === 0 && (
                            <p className="py-8 text-center text-muted-foreground">
                                Create a profile above to configure SSH
                                settings.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
// ─── RDP ───
interface PreferencesPanelProps {
    initialParams: Record<string, string>;
    profileName: string;
    onSaved?: () => void;
}
function RDPPreferences({
    initialParams,
    profileName,
    onSaved,
}: PreferencesPanelProps) {
    const [params, setParams] = useState<Record<string, string>>({
        // Concurrency Limits
        'max-connections': '',
        'max-connections-per-user': '2',

        // Load Balancing
        weight: '',
        'failover-only': 'false',

        // Guacamole Proxy Parameters (guacd)
        'guacd-hostname': '',
        'guacd-port': '',
        'guacd-encryption': 'none',

        // Network
        port: '3389',
        timeout: '10',

        // Authentication
        username: '',
        password: '',
        domain: '',
        security: 'nla',
        'ignore-cert': 'true',
        'cert-tofu': 'false',
        'cert-fingerprints': '',
        'disable-auth': 'false',

        // Session
        'client-name': 'guacamole',
        console: 'false',
        'initial-program': '',
        'server-layout': 'en-us-qwerty',
        timezone: 'Africa/Tunis',

        // Display
        'color-depth': '24',
        width: '1920',
        height: '1080',
        dpi: '96',
        'resize-method': 'display-update',
        'force-lossless': 'false',

        // Clipboard
        'normalize-clipboard': 'preserve',
        'disable-copy': 'false',
        'disable-paste': 'false',

        // Device Redirection
        'disable-audio': 'false',
        'enable-audio-input': 'false',
        'enable-touch': 'false',
        'console-audio': 'false',
        'enable-printing': 'false',
        'printer-name': '',
        'enable-drive': 'false',
        'drive-name': 'Guacamole Drive',
        'drive-path': '/tmp/guacamole-drive',
        'create-drive-path': 'false',
        'disable-download': 'false',
        'disable-upload': 'false',
        'static-channels': '',

        // Preconnection PDU / Hyper-V
        'preconnection-id': '',
        'preconnection-blob': '',

        // Remote Desktop Gateway
        'gateway-hostname': '',
        'gateway-port': '443',
        'gateway-username': '',
        'gateway-password': '',
        'gateway-domain': '',

        // Load balance info / cookie
        'load-balance-info': '',

        // Performance
        'enable-wallpaper': 'false',
        'enable-theming': 'false',
        'enable-font-smoothing': 'true',
        'enable-full-window-drag': 'false',
        'enable-desktop-composition': 'false',
        'enable-menu-animations': 'false',
        'disable-bitmap-caching': 'false',
        'disable-offscreen-caching': 'false',
        'disable-glyph-caching': 'false',
        'disable-gfx': 'false',

        // RemoteApp
        'remote-app': '',
        'remote-app-dir': '',
        'remote-app-args': '',

        // SFTP
        'enable-sftp': 'false',
        'sftp-hostname': '',
        'sftp-port': '22',
        'sftp-timeout': '10',
        'sftp-host-key': '',
        'sftp-username': '',
        'sftp-password': '',
        'sftp-private-key': '',
        'sftp-passphrase': '',
        'sftp-directory': '',
        'sftp-root-directory': '/',
        'sftp-server-alive-interval': '',
        'sftp-disable-download': 'false',
        'sftp-disable-upload': 'false',

        // Recording
        'recording-path': '',
        'create-recording-path': 'false',
        'recording-name': '',
        'recording-exclude-output': 'false',
        'recording-exclude-mouse': 'false',

        // Wake-on-LAN
        'wol-send-packet': 'false',
        'wol-mac-addr': '',
        'wol-broadcast-addr': '255.255.255.255',
        'wol-udp-port': '9',
        'wol-wait-time': '0',

        ...normalizeParams(initialParams),
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const update = useCallback((key: string, value: string) => {
        setParams((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);
    const toggleBool = useCallback((key: string) => {
        setParams((prev) => ({
            ...prev,
            [key]: prev[key] === 'true' ? 'false' : 'true',
        }));
        setSaved(false);
    }, []);
    const handleSave = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            // Convert boolean strings to actual booleans for the API
            const apiParams: Record<string, string | boolean | number> = {};
            for (const [key, value] of Object.entries(params)) {
                // Skip empty values — backend will use defaults
                if (!value && value !== 'false' && value !== '0') {
                    continue;
                }
                if (value === 'true' || value === 'false') {
                    apiParams[key] = value === 'true';
                } else if (/^\d+$/.test(value)) {
                    apiParams[key] = parseInt(value, 10);
                } else {
                    apiParams[key] = value;
                }
            }
            // Use PUT to update the specific profile
            await client.put(
                `/connection-preferences/rdp/${encodeURIComponent(profileName)}`,
                {
                    parameters: apiParams,
                },
            );
            setSaved(true);
            onSaved?.();
        } catch (e) {
            const errorMsg = getErrorMessage(e);
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    }, [params, profileName, onSaved]);
    return (
        <div className="mt-4 space-y-6">
            {/* Concurrency Limits */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Concurrency Limits
                    </CardTitle>
                    <CardDescription>
                        Restrict simultaneous connections to this profile.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Maximum Connections</Label>
                        <Input
                            type="number"
                            value={params['max-connections']}
                            onChange={(e) =>
                                update('max-connections', e.target.value)
                            }
                            placeholder="Unlimited if empty"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Max Connections Per User</Label>
                        <Input
                            type="number"
                            value={params['max-connections-per-user']}
                            onChange={(e) =>
                                update(
                                    'max-connections-per-user',
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Load Balancing */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Load Balancing</CardTitle>
                    <CardDescription>
                        Configure connection weight and failover behavior.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Connection Weight</Label>
                        <Input
                            type="number"
                            value={params.weight}
                            onChange={(e) => update('weight', e.target.value)}
                            placeholder="Higher weight = higher priority"
                        />
                    </div>
                    <CheckboxRow
                        id="failover-only"
                        label="Use for failover only"
                        checked={params['failover-only'] === 'true'}
                        onChange={() => toggleBool('failover-only')}
                    />
                </CardContent>
            </Card>

            {/* Guacamole Proxy (guacd) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Guacamole Proxy (guacd)
                    </CardTitle>
                    <CardDescription>
                        Configure proxy connection parameters. Leave empty for
                        default.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Hostname</Label>
                        <Input
                            value={params['guacd-hostname']}
                            onChange={(e) =>
                                update('guacd-hostname', e.target.value)
                            }
                            placeholder="localhost"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Port</Label>
                        <Input
                            type="number"
                            value={params['guacd-port']}
                            onChange={(e) =>
                                update('guacd-port', e.target.value)
                            }
                            placeholder="4822"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Encryption</Label>
                        <Select
                            value={params['guacd-encryption']}
                            onValueChange={(v) => update('guacd-encryption', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    None (unencrypted)
                                </SelectItem>
                                <SelectItem value="ssl">SSL</SelectItem>
                                <SelectItem value="tls">TLS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Network */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Network</CardTitle>
                    <CardDescription>
                        Host auto-detected from VM. Configure port and timeout.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label>Hostname</Label>
                        <Input
                            value="Auto-detected from VM IP"
                            disabled
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Port</Label>
                        <Input
                            type="number"
                            value={params.port}
                            onChange={(e) => update('port', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Connection Timeout (seconds)</Label>
                        <Input
                            type="number"
                            value={params.timeout}
                            onChange={(e) => update('timeout', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Authentication */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Authentication</CardTitle>
                    <CardDescription>
                        Default credentials for RDP connections.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                            value={params.username}
                            onChange={(e) => update('username', e.target.value)}
                            placeholder="e.g. administrator"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={params.password}
                            onChange={(e) => update('password', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Domain</Label>
                        <Input
                            value={params.domain}
                            onChange={(e) => update('domain', e.target.value)}
                            placeholder="Optional"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Security Mode</Label>
                        <Select
                            value={params.security}
                            onValueChange={(v) => update('security', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nla">
                                    NLA (Network Level Auth)
                                </SelectItem>
                                <SelectItem value="tls">TLS</SelectItem>
                                <SelectItem value="rdp">
                                    RDP Encryption
                                </SelectItem>
                                <SelectItem value="vmconnect">
                                    Hyper-V / VMConnect
                                </SelectItem>
                                <SelectItem value="any">Any</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <CheckboxRow
                        id="disable-auth"
                        label="Disable authentication"
                        checked={params['disable-auth'] === 'true'}
                        onChange={() => toggleBool('disable-auth')}
                    />
                    <CheckboxRow
                        id="ignore-cert"
                        label="Ignore server certificate"
                        checked={params['ignore-cert'] === 'true'}
                        onChange={() => toggleBool('ignore-cert')}
                    />
                    <CheckboxRow
                        id="cert-tofu"
                        label="Trust host certificate on first use"
                        checked={params['cert-tofu'] === 'true'}
                        onChange={() => toggleBool('cert-tofu')}
                    />
                    <div className="space-y-2 sm:col-span-2">
                        <Label>Fingerprints of Trusted Host Certificates</Label>
                        <Input
                            value={params['cert-fingerprints']}
                            onChange={(e) =>
                                update('cert-fingerprints', e.target.value)
                            }
                            placeholder="comma-separated fingerprints"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Remote Desktop Gateway */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Remote Desktop Gateway
                    </CardTitle>
                    <CardDescription>
                        Optional gateway for RDP connections through a proxy.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Hostname</Label>
                        <Input
                            value={params['gateway-hostname']}
                            onChange={(e) =>
                                update('gateway-hostname', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Port</Label>
                        <Input
                            type="number"
                            value={params['gateway-port']}
                            onChange={(e) =>
                                update('gateway-port', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                            value={params['gateway-username']}
                            onChange={(e) =>
                                update('gateway-username', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={params['gateway-password']}
                            onChange={(e) =>
                                update('gateway-password', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Domain</Label>
                        <Input
                            value={params['gateway-domain']}
                            onChange={(e) =>
                                update('gateway-domain', e.target.value)
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Display */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Display</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Width (px)</Label>
                        <Input
                            type="number"
                            value={params.width}
                            onChange={(e) => update('width', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Height (px)</Label>
                        <Input
                            type="number"
                            value={params.height}
                            onChange={(e) => update('height', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>DPI</Label>
                        <Input
                            type="number"
                            value={params.dpi}
                            onChange={(e) => update('dpi', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Color Depth</Label>
                        <Select
                            value={params['color-depth']}
                            onValueChange={(v) => update('color-depth', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="8">8-bit</SelectItem>
                                <SelectItem value="16">16-bit</SelectItem>
                                <SelectItem value="24">24-bit</SelectItem>
                                <SelectItem value="32">
                                    32-bit (True Color)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Resize Method</Label>
                        <Select
                            value={params['resize-method']}
                            onValueChange={(v) => update('resize-method', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="display-update">
                                    Display Update (RDP 8.1+)
                                </SelectItem>
                                <SelectItem value="reconnect">
                                    Reconnect
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <CheckboxRow
                        id="force-lossless"
                        label="Force lossless compression"
                        checked={params['force-lossless'] === 'true'}
                        onChange={() => toggleBool('force-lossless')}
                    />
                </CardContent>
            </Card>

            {/* Clipboard */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Clipboard</CardTitle>
                    <CardDescription>
                        Control clipboard access between client and remote
                        desktop.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Normalize Clipboard</Label>
                        <Select
                            value={params['normalize-clipboard']}
                            onValueChange={(value) =>
                                update('normalize-clipboard', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="preserve">
                                    Preserve
                                </SelectItem>
                                <SelectItem value="unix">Unix (LF)</SelectItem>
                                <SelectItem value="windows">
                                    Windows (CRLF)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <CheckboxRow
                        id="disable-copy"
                        label="Disable copying from remote desktop"
                        checked={params['disable-copy'] === 'true'}
                        onChange={() => toggleBool('disable-copy')}
                    />
                    <CheckboxRow
                        id="disable-paste"
                        label="Disable pasting from client"
                        checked={params['disable-paste'] === 'true'}
                        onChange={() => toggleBool('disable-paste')}
                    />
                </CardContent>
            </Card>

            {/* Device Redirection */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Device Redirection
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <CheckboxRow
                        id="disable-audio"
                        label="Disable audio"
                        checked={params['disable-audio'] === 'true'}
                        onChange={() => toggleBool('disable-audio')}
                    />
                    <CheckboxRow
                        id="console-audio"
                        label="Support audio in console"
                        checked={params['console-audio'] === 'true'}
                        onChange={() => toggleBool('console-audio')}
                    />
                    <CheckboxRow
                        id="enable-audio-input"
                        label="Enable audio input (microphone)"
                        checked={params['enable-audio-input'] === 'true'}
                        onChange={() => toggleBool('enable-audio-input')}
                    />
                    <CheckboxRow
                        id="enable-touch"
                        label="Enable multi-touch"
                        checked={params['enable-touch'] === 'true'}
                        onChange={() => toggleBool('enable-touch')}
                    />
                    <CheckboxRow
                        id="enable-printing"
                        label="Enable printing"
                        checked={params['enable-printing'] === 'true'}
                        onChange={() => toggleBool('enable-printing')}
                    />
                    <div className="space-y-2">
                        <Label>Redirected Printer Name</Label>
                        <Input
                            value={params['printer-name']}
                            onChange={(e) =>
                                update('printer-name', e.target.value)
                            }
                        />
                    </div>
                    <CheckboxRow
                        id="enable-drive"
                        label="Enable drive"
                        checked={params['enable-drive'] === 'true'}
                        onChange={() => toggleBool('enable-drive')}
                    />
                    <div className="space-y-2">
                        <Label>Drive Name</Label>
                        <Input
                            value={params['drive-name']}
                            onChange={(e) =>
                                update('drive-name', e.target.value)
                            }
                            placeholder="e.g., Shared"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Drive Path</Label>
                        <Input
                            value={params['drive-path']}
                            onChange={(e) =>
                                update('drive-path', e.target.value)
                            }
                        />
                    </div>
                    <CheckboxRow
                        id="create-drive-path"
                        label="Automatically create drive path"
                        checked={params['create-drive-path'] === 'true'}
                        onChange={() => toggleBool('create-drive-path')}
                    />
                    <CheckboxRow
                        id="disable-download"
                        label="Disable file download"
                        checked={params['disable-download'] === 'true'}
                        onChange={() => toggleBool('disable-download')}
                    />
                    <CheckboxRow
                        id="disable-upload"
                        label="Disable file upload"
                        checked={params['disable-upload'] === 'true'}
                        onChange={() => toggleBool('disable-upload')}
                    />
                    <div className="space-y-2 sm:col-span-2">
                        <Label>Static Channel Names</Label>
                        <Input
                            value={params['static-channels']}
                            onChange={(e) =>
                                update('static-channels', e.target.value)
                            }
                            placeholder="e.g., rdpdr,rdpsnd"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Performance</CardTitle>
                    <CardDescription>
                        Optimize visual effects for remote performance.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <CheckboxRow
                        id="disable-wallpaper"
                        label="Disable wallpaper"
                        checked={params['disable-wallpaper'] === 'true'}
                        onChange={() => toggleBool('disable-wallpaper')}
                    />
                    <CheckboxRow
                        id="enable-wallpaper"
                        label="Enable wallpaper"
                        checked={params['enable-wallpaper'] === 'true'}
                        onChange={() => toggleBool('enable-wallpaper')}
                    />
                    <CheckboxRow
                        id="disable-theming"
                        label="Disable theming"
                        checked={params['disable-theming'] === 'true'}
                        onChange={() => toggleBool('disable-theming')}
                    />
                    <CheckboxRow
                        id="enable-theming"
                        label="Enable theming"
                        checked={params['enable-theming'] === 'true'}
                        onChange={() => toggleBool('enable-theming')}
                    />
                    <CheckboxRow
                        id="enable-font-smoothing"
                        label="Enable font smoothing (ClearType)"
                        checked={params['enable-font-smoothing'] === 'true'}
                        onChange={() => toggleBool('enable-font-smoothing')}
                    />
                    <CheckboxRow
                        id="enable-full-window-drag"
                        label="Enable full-window drag"
                        checked={params['enable-full-window-drag'] === 'true'}
                        onChange={() => toggleBool('enable-full-window-drag')}
                    />
                    <CheckboxRow
                        id="enable-desktop-composition"
                        label="Enable desktop composition (Aero)"
                        checked={
                            params['enable-desktop-composition'] === 'true'
                        }
                        onChange={() =>
                            toggleBool('enable-desktop-composition')
                        }
                    />
                    <CheckboxRow
                        id="enable-menu-animations"
                        label="Enable menu animations"
                        checked={params['enable-menu-animations'] === 'true'}
                        onChange={() => toggleBool('enable-menu-animations')}
                    />
                    <CheckboxRow
                        id="disable-bitmap-caching"
                        label="Disable bitmap caching"
                        checked={params['disable-bitmap-caching'] === 'true'}
                        onChange={() => toggleBool('disable-bitmap-caching')}
                    />
                    <CheckboxRow
                        id="disable-offscreen-caching"
                        label="Disable off-screen caching"
                        checked={params['disable-offscreen-caching'] === 'true'}
                        onChange={() => toggleBool('disable-offscreen-caching')}
                    />
                    <CheckboxRow
                        id="disable-glyph-caching"
                        label="Disable glyph caching"
                        checked={params['disable-glyph-caching'] === 'true'}
                        onChange={() => toggleBool('disable-glyph-caching')}
                    />
                    <CheckboxRow
                        id="disable-gfx"
                        label="Disable Graphics Pipeline Extension"
                        checked={params['disable-gfx'] === 'true'}
                        onChange={() => toggleBool('disable-gfx')}
                    />
                </CardContent>
            </Card>

            {/* Basic Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Basic Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Initial Program</Label>
                        <Input
                            value={params['initial-program']}
                            onChange={(e) =>
                                update('initial-program', e.target.value)
                            }
                            placeholder="e.g., notepad.exe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Client Name</Label>
                        <Input
                            value={params['client-name']}
                            onChange={(e) =>
                                update('client-name', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Keyboard Layout</Label>
                        <Input
                            value={params['server-layout']}
                            onChange={(e) =>
                                update('server-layout', e.target.value)
                            }
                            placeholder="e.g., en-us-qwerty"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Time Zone</Label>
                        <Input
                            value={params.timezone}
                            onChange={(e) => update('timezone', e.target.value)}
                        />
                    </div>
                    <CheckboxRow
                        id="console"
                        label="Administrator console"
                        checked={params.console === 'true'}
                        onChange={() => toggleBool('console')}
                    />
                </CardContent>
            </Card>

            {/* Recording */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Screen Recording</CardTitle>
                    <CardDescription>
                        Record RDP sessions for compliance or training.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Recording Path</Label>
                        <Input
                            value={params['recording-path']}
                            onChange={(e) =>
                                update('recording-path', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Recording Name</Label>
                        <Input
                            value={params['recording-name']}
                            onChange={(e) =>
                                update('recording-name', e.target.value)
                            }
                        />
                    </div>
                    <CheckboxRow
                        id="recording-exclude-output"
                        label="Exclude graphics/streams"
                        checked={params['recording-exclude-output'] === 'true'}
                        onChange={() => toggleBool('recording-exclude-output')}
                    />
                    <CheckboxRow
                        id="recording-exclude-mouse"
                        label="Exclude mouse"
                        checked={params['recording-exclude-mouse'] === 'true'}
                        onChange={() => toggleBool('recording-exclude-mouse')}
                    />
                    <CheckboxRow
                        id="recording-include-keys"
                        label="Include key events"
                        checked={params['recording-include-keys'] === 'true'}
                        onChange={() => toggleBool('recording-include-keys')}
                    />
                    <CheckboxRow
                        id="create-recording-path"
                        label="Automatically create recording path"
                        checked={params['create-recording-path'] === 'true'}
                        onChange={() => toggleBool('create-recording-path')}
                    />
                </CardContent>
            </Card>

            {/* SFTP */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        SFTP (SSH File Transfer)
                    </CardTitle>
                    <CardDescription>
                        Enable secure file transfer over SSH.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <CheckboxRow
                        id="enable-sftp"
                        label="Enable SFTP"
                        checked={params['enable-sftp'] === 'true'}
                        onChange={() => toggleBool('enable-sftp')}
                    />
                    <div className="space-y-2">
                        <Label>Hostname</Label>
                        <Input
                            value={params['sftp-hostname']}
                            onChange={(e) =>
                                update('sftp-hostname', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Port</Label>
                        <Input
                            type="number"
                            value={params['sftp-port']}
                            onChange={(e) =>
                                update('sftp-port', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>SFTP Connection Timeout</Label>
                        <Input
                            type="number"
                            value={params['sftp-timeout']}
                            onChange={(e) =>
                                update('sftp-timeout', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                            value={params['sftp-username']}
                            onChange={(e) =>
                                update('sftp-username', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={params['sftp-password']}
                            onChange={(e) =>
                                update('sftp-password', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Public Host Key (Base64)</Label>
                        <Input
                            value={params['sftp-host-key']}
                            onChange={(e) =>
                                update('sftp-host-key', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Private Key</Label>
                        <Input
                            type="password"
                            value={params['sftp-private-key']}
                            onChange={(e) =>
                                update('sftp-private-key', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Passphrase</Label>
                        <Input
                            type="password"
                            value={params['sftp-passphrase']}
                            onChange={(e) =>
                                update('sftp-passphrase', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>File Browser Root Directory</Label>
                        <Input
                            value={params['sftp-root-directory']}
                            onChange={(e) =>
                                update('sftp-root-directory', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Default Upload Directory</Label>
                        <Input
                            value={params['sftp-directory']}
                            onChange={(e) =>
                                update('sftp-directory', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Keep-alive Interval (seconds)</Label>
                        <Input
                            type="number"
                            value={params['sftp-server-alive-interval']}
                            onChange={(e) =>
                                update(
                                    'sftp-server-alive-interval',
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                    <CheckboxRow
                        id="sftp-disable-download"
                        label="Disable file download"
                        checked={params['sftp-disable-download'] === 'true'}
                        onChange={() => toggleBool('sftp-disable-download')}
                    />
                    <CheckboxRow
                        id="sftp-disable-upload"
                        label="Disable file upload"
                        checked={params['sftp-disable-upload'] === 'true'}
                        onChange={() => toggleBool('sftp-disable-upload')}
                    />
                </CardContent>
            </Card>

            {/* RemoteApp */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">RemoteApp</CardTitle>
                    <CardDescription>
                        Launch a specific application instead of full desktop.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Program</Label>
                        <Input
                            value={params['remote-app']}
                            onChange={(e) =>
                                update('remote-app', e.target.value)
                            }
                            placeholder="e.g., C:\\Windows\\System32\\notepad.exe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Working Directory</Label>
                        <Input
                            value={params['remote-app-dir']}
                            onChange={(e) =>
                                update('remote-app-dir', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Parameters</Label>
                        <Input
                            value={params['remote-app-args']}
                            onChange={(e) =>
                                update('remote-app-args', e.target.value)
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Preconnection / Hyper-V */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Preconnection / Hyper-V
                    </CardTitle>
                    <CardDescription>
                        Configure Hyper-V connection settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Preconnection BLOB (VM ID)</Label>
                        <Input
                            value={params['preconnection-blob']}
                            onChange={(e) =>
                                update('preconnection-blob', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Preconnection ID</Label>
                        <Input
                            value={params['preconnection-id']}
                            onChange={(e) =>
                                update('preconnection-id', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Load Balance Info/Cookie</Label>
                        <Input
                            value={params['load-balance-info']}
                            onChange={(e) =>
                                update('load-balance-info', e.target.value)
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Wake-on-LAN */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Wake-on-LAN (WoL)</CardTitle>
                    <CardDescription>
                        Automatically wake the remote host before connecting.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <CheckboxRow
                        id="wol-send-packet"
                        label="Send WoL packet"
                        checked={params['wol-send-packet'] === 'true'}
                        onChange={() => toggleBool('wol-send-packet')}
                    />
                    <div className="space-y-2">
                        <Label>MAC Address</Label>
                        <Input
                            value={params['wol-mac-addr']}
                            onChange={(e) =>
                                update('wol-mac-addr', e.target.value)
                            }
                            placeholder="e.g., 00:1A:2B:3C:4D:5E"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Broadcast Address</Label>
                        <Input
                            value={params['wol-broadcast-addr']}
                            onChange={(e) =>
                                update('wol-broadcast-addr', e.target.value)
                            }
                            placeholder="e.g., 255.255.255.255"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>UDP Port</Label>
                        <Input
                            type="number"
                            value={params['wol-udp-port']}
                            onChange={(e) =>
                                update('wol-udp-port', e.target.value)
                            }
                            placeholder="9"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Host Boot Wait Time (seconds)</Label>
                        <Input
                            type="number"
                            value={params['wol-wait-time']}
                            onChange={(e) =>
                                update('wol-wait-time', e.target.value)
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save */}
            <div className="sticky bottom-0 flex items-center gap-4 border-t bg-background py-4">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : 'Save RDP Preferences'}
                </Button>
                {saved && (
                    <Badge
                        variant="outline"
                        className="border-green-600 text-green-600"
                    >
                        Saved
                    </Badge>
                )}
                {error && (
                    <span className="text-sm text-destructive">{error}</span>
                )}
            </div>
        </div>
    );
}
// ─── VNC ───
function VNCPreferences({
    initialParams,
    profileName,
    onSaved,
}: PreferencesPanelProps) {
    const [params, setParams] = useState<Record<string, string>>({
        port: '5900',
        password: '',
        'read-only': 'false',
        width: '1280',
        height: '720',
        dpi: '96',
        'color-depth': '32',
        'enable-audio': 'false',
        timeout: '10',
        ...normalizeParams(initialParams),
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const update = useCallback((key: string, value: string) => {
        setParams((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);
    const toggleBool = useCallback((key: string) => {
        setParams((prev) => ({
            ...prev,
            [key]: prev[key] === 'true' ? 'false' : 'true',
        }));
        setSaved(false);
    }, []);
    const handleSave = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            const apiParams: Record<string, string | boolean | number> = {};
            for (const [key, value] of Object.entries(params)) {
                // Skip empty values — backend will use defaults
                if (!value && value !== 'false' && value !== '0') {
                    continue;
                }
                if (value === 'true' || value === 'false') {
                    apiParams[key] = value === 'true';
                } else if (/^\d+$/.test(value)) {
                    apiParams[key] = parseInt(value, 10);
                } else {
                    apiParams[key] = value;
                }
            }
            await client.put(
                `/connection-preferences/vnc/${encodeURIComponent(profileName)}`,
                {
                    parameters: apiParams,
                },
            );
            setSaved(true);
            onSaved?.();
        } catch (e) {
            const errorMsg = getErrorMessage(e);
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    }, [params, profileName, onSaved]);
    return (
        <div className="mt-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Network</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Port</Label>
                        <Input
                            type="number"
                            value={params.port}
                            onChange={(e) => update('port', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Connection Timeout (seconds)</Label>
                        <Input
                            type="number"
                            value={params.timeout}
                            onChange={(e) => update('timeout', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Authentication</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>VNC Password</Label>
                        <Input
                            type="password"
                            value={params.password}
                            onChange={(e) => update('password', e.target.value)}
                        />
                    </div>
                    <CheckboxRow
                        id="read-only"
                        label="Read-only mode"
                        checked={params['read-only'] === 'true'}
                        onChange={() => toggleBool('read-only')}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Display</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Width</Label>
                        <Input
                            type="number"
                            value={params.width}
                            onChange={(e) => update('width', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Height</Label>
                        <Input
                            type="number"
                            value={params.height}
                            onChange={(e) => update('height', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Color Depth</Label>
                        <Select
                            value={params['color-depth']}
                            onValueChange={(v) => update('color-depth', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="8">8-bit</SelectItem>
                                <SelectItem value="16">16-bit</SelectItem>
                                <SelectItem value="24">24-bit</SelectItem>
                                <SelectItem value="32">32-bit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Device Redirection
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CheckboxRow
                        id="vnc-enable-audio"
                        label="Enable audio"
                        checked={params['enable-audio'] === 'true'}
                        onChange={() => toggleBool('enable-audio')}
                    />
                </CardContent>
            </Card>
            <div className="flex items-center gap-4">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : 'Save VNC Preferences'}
                </Button>
                {saved && (
                    <Badge
                        variant="outline"
                        className="border-green-600 text-green-600"
                    >
                        Saved
                    </Badge>
                )}
                {error && (
                    <span className="text-sm text-destructive">{error}</span>
                )}
            </div>
        </div>
    );
}
// ─── SSH ───
function SSHPreferences({
    initialParams,
    profileName,
    onSaved,
}: PreferencesPanelProps) {
    const [params, setParams] = useState<Record<string, string>>({
        port: '22',
        username: '',
        password: '',
        'private-key': '',
        passphrase: '',
        'font-size': '12',
        'color-scheme': 'gray-black',
        'enable-sftp': 'true',
        'sftp-root-directory': '/home',
        timeout: '10',
        ...normalizeParams(initialParams),
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const update = useCallback((key: string, value: string) => {
        setParams((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);
    const toggleBool = useCallback((key: string) => {
        setParams((prev) => ({
            ...prev,
            [key]: prev[key] === 'true' ? 'false' : 'true',
        }));
        setSaved(false);
    }, []);
    const handleSave = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            const apiParams: Record<string, string | boolean | number> = {};
            for (const [key, value] of Object.entries(params)) {
                // Skip empty values — backend will use defaults
                if (!value && value !== 'false' && value !== '0') {
                    continue;
                }
                if (value === 'true' || value === 'false') {
                    apiParams[key] = value === 'true';
                } else if (/^\d+$/.test(value)) {
                    apiParams[key] = parseInt(value, 10);
                } else {
                    apiParams[key] = value;
                }
            }
            await client.put(
                `/connection-preferences/ssh/${encodeURIComponent(profileName)}`,
                {
                    parameters: apiParams,
                },
            );
            setSaved(true);
            onSaved?.();
        } catch (e) {
            const errorMsg = getErrorMessage(e);
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    }, [params, profileName, onSaved]);
    return (
        <div className="mt-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Network</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Port</Label>
                        <Input
                            type="number"
                            value={params.port}
                            onChange={(e) => update('port', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Connection Timeout (seconds)</Label>
                        <Input
                            type="number"
                            value={params.timeout}
                            onChange={(e) => update('timeout', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Authentication</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                            value={params.username}
                            onChange={(e) => update('username', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={params.password}
                            onChange={(e) => update('password', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label>Private Key</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={params['private-key']}
                            onChange={(e) =>
                                update('private-key', e.target.value)
                            }
                            placeholder="Paste private key content..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Passphrase</Label>
                        <Input
                            type="password"
                            value={params.passphrase}
                            onChange={(e) =>
                                update('passphrase', e.target.value)
                            }
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Terminal</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Font Size</Label>
                        <Input
                            type="number"
                            value={params['font-size']}
                            onChange={(e) =>
                                update('font-size', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Color Scheme</Label>
                        <Select
                            value={params['color-scheme']}
                            onValueChange={(v) => update('color-scheme', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gray-black">
                                    Gray on Black
                                </SelectItem>
                                <SelectItem value="green-black">
                                    Green on Black
                                </SelectItem>
                                <SelectItem value="white-black">
                                    White on Black
                                </SelectItem>
                                <SelectItem value="black-white">
                                    Black on White
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">SFTP</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <CheckboxRow
                        id="ssh-enable-sftp"
                        label="Enable SFTP"
                        checked={params['enable-sftp'] === 'true'}
                        onChange={() => toggleBool('enable-sftp')}
                    />
                    <div className="space-y-2">
                        <Label>SFTP Root Directory</Label>
                        <Input
                            value={params['sftp-root-directory']}
                            onChange={(e) =>
                                update('sftp-root-directory', e.target.value)
                            }
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="flex items-center gap-4">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : 'Save SSH Preferences'}
                </Button>
                {saved && (
                    <Badge
                        variant="outline"
                        className="border-green-600 text-green-600"
                    >
                        Saved
                    </Badge>
                )}
                {error && (
                    <span className="text-sm text-destructive">{error}</span>
                )}
            </div>
        </div>
    );
}
// ─── Shared checkbox row component ───
function CheckboxRow({
    id,
    label,
    checked,
    onChange,
}: {
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center space-x-2">
            <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
            <Label htmlFor={id}>{label}</Label>
        </div>
    );
}
