/**
 * Connection Preferences Page
 *
 * Allows users to manage Guacamole connection configurations per protocol (RDP/VNC/SSH).
 * These preferences are applied when building the Guacamole connection to a VM.
 */

import { Head } from '@inertiajs/react';
import { Loader2, Monitor, Plus, Save, Star, Terminal, Trash2, Wifi } from 'lucide-react';
import { useCallback, useState } from 'react';
import client from '@/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
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

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: dashboard().url },
  { title: 'Connection Preferences', href: '/connection-preferences' },
];

// Helper to convert any null/undefined values to empty strings and ensure all entries are strings.
function normalizeParams(raw: Record<string, unknown> | undefined | null): Record<string, string> {
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
    const defaultProfile = profiles.find(p => p.is_default) ?? profiles[0];
    return normalizeParams(defaultProfile?.parameters);
  }
  return normalizeParams(legacyParams);
}

// ─── Profile Manager Component ───

interface ProfileManagerProps {
  protocol: string;
  profiles: ConnectionProfile[];
  selectedProfile: ConnectionProfile | null;
  onSelectProfile: (profile: ConnectionProfile) => void;
  onProfilesChange: () => void;
}

function ProfileManager({ protocol, profiles, selectedProfile, onSelectProfile, onProfilesChange }: ProfileManagerProps) {
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
      setError(e instanceof Error ? e.message : 'Failed to create profile');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProfile = async (profileName: string) => {
    if (!confirm(`Delete profile "${profileName}"? This cannot be undone.`)) return;
    setDeleting(profileName);
    setError(null);
    try {
      await client.delete(`/connection-preferences/${protocol}/${encodeURIComponent(profileName)}`);
      onProfilesChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete profile');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (profileName: string) => {
    setSettingDefault(profileName);
    setError(null);
    try {
      await client.patch(`/connection-preferences/${protocol}/${encodeURIComponent(profileName)}/default`);
      onProfilesChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set default');
    } finally {
      setSettingDefault(null);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Profiles</h3>
        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
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
            <p>No profiles yet. Create one to save your {protocol.toUpperCase()} connection settings.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {profiles.map((profile) => (
            <div
              key={profile.profile_name}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedProfile?.profile_name === profile.profile_name
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelectProfile(profile)}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{profile.profile_name}</span>
                {profile.is_default && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!profile.is_default && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleSetDefault(profile.profile_name); }}
                    disabled={settingDefault === profile.profile_name}
                  >
                    {settingDefault === profile.profile_name ? (
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
                  onClick={(e) => { e.stopPropagation(); handleDeleteProfile(profile.profile_name); }}
                  disabled={deleting === profile.profile_name || profiles.length === 1}
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
            <DialogTitle>Create {protocol.toUpperCase()} Profile</DialogTitle>
            <DialogDescription>
              Create a new connection profile with custom settings.
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
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProfile} disabled={creating || !newProfileName.trim()}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ConnectionPreferencesPage({ profiles, preferences }: ConnectionPreferencesPageProps) {
  // State to track profiles and selected profile per protocol
  const [rdpProfiles, setRdpProfiles] = useState<ConnectionProfile[]>(profiles?.rdp ?? []);
  const [vncProfiles, setVncProfiles] = useState<ConnectionProfile[]>(profiles?.vnc ?? []);
  const [sshProfiles, setSshProfiles] = useState<ConnectionProfile[]>(profiles?.ssh ?? []);

  const [selectedRdpProfile, setSelectedRdpProfile] = useState<ConnectionProfile | null>(
    rdpProfiles.find(p => p.is_default) ?? rdpProfiles[0] ?? null
  );
  const [selectedVncProfile, setSelectedVncProfile] = useState<ConnectionProfile | null>(
    vncProfiles.find(p => p.is_default) ?? vncProfiles[0] ?? null
  );
  const [selectedSshProfile, setSelectedSshProfile] = useState<ConnectionProfile | null>(
    sshProfiles.find(p => p.is_default) ?? sshProfiles[0] ?? null
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
        const updated = (data.rdp ?? []).find((p: ConnectionProfile) => p.profile_name === prev?.profile_name);
        return updated ?? (data.rdp ?? []).find((p: ConnectionProfile) => p.is_default) ?? (data.rdp ?? [])[0] ?? null;
      });
      setSelectedVncProfile((prev) => {
        const updated = (data.vnc ?? []).find((p: ConnectionProfile) => p.profile_name === prev?.profile_name);
        return updated ?? (data.vnc ?? []).find((p: ConnectionProfile) => p.is_default) ?? (data.vnc ?? [])[0] ?? null;
      });
      setSelectedSshProfile((prev) => {
        const updated = (data.ssh ?? []).find((p: ConnectionProfile) => p.profile_name === prev?.profile_name);
        return updated ?? (data.ssh ?? []).find((p: ConnectionProfile) => p.is_default) ?? (data.ssh ?? [])[0] ?? null;
      });
    } catch (e) {
      console.error('Failed to refresh profiles', e);
    }
  }, []);

  // Support both new profiles and legacy preferences format
  const rdpParams = normalizeParams(selectedRdpProfile?.parameters ?? getDefaultParams(profiles?.rdp, preferences?.rdp));
  const vncParams = normalizeParams(selectedVncProfile?.parameters ?? getDefaultParams(profiles?.vnc, preferences?.vnc));
  const sshParams = normalizeParams(selectedSshProfile?.parameters ?? getDefaultParams(profiles?.ssh, preferences?.ssh));

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Connection Preferences" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Connection Preferences</h2>
          <p className="text-muted-foreground mt-1">
            Configure default Guacamole connection settings per protocol. These are applied when launching sessions.
          </p>
        </div>

        <Tabs defaultValue="rdp" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rdp" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              RDP
            </TabsTrigger>
            <TabsTrigger value="vnc" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              VNC
            </TabsTrigger>
            <TabsTrigger value="ssh" className="flex items-center gap-2">
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
              <p className="text-muted-foreground text-center py-8">
                Create a profile above to configure RDP settings.
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
              <p className="text-muted-foreground text-center py-8">
                Create a profile above to configure VNC settings.
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
              <p className="text-muted-foreground text-center py-8">
                Create a profile above to configure SSH settings.
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

function RDPPreferences({ initialParams, profileName, onSaved }: PreferencesPanelProps) {
  const [params, setParams] = useState<Record<string, string>>({
    port: '3389',
    username: '',
    password: '',
    domain: '',
    security: 'nla',
    'ignore-cert': 'true',
    width: '1280',
    height: '720',
    dpi: '96',
    'color-depth': '32',
    'resize-method': 'display-update',
    'disable-wallpaper': 'true',
    'disable-theming': 'false',
    'enable-font-smoothing': 'false',
    'enable-full-window-drag': 'false',
    'enable-desktop-composition': 'false',
    'enable-menu-animations': 'false',
    'enable-audio': 'true',
    'enable-printing': 'false',
    'enable-drive': 'false',
    'enable-microphone': 'false',
    'connection-timeout': '10',
    ...normalizeParams(initialParams),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback((key: string, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const toggleBool = useCallback((key: string) => {
    setParams(prev => ({
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
        if (value === 'true' || value === 'false') {
          apiParams[key] = value === 'true';
        } else if (/^\d+$/.test(value)) {
          apiParams[key] = parseInt(value, 10);
        } else {
          apiParams[key] = value;
        }
      }
      // Use PUT to update the specific profile
      await client.put(`/connection-preferences/rdp/${encodeURIComponent(profileName)}`, {
        parameters: apiParams,
      });
      setSaved(true);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [params, profileName, onSaved]);

  return (
    <div className="space-y-6 mt-4">
      {/* Network */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Network</CardTitle>
          <CardDescription>Host auto-detected from VM. Configure port and timeout.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Port</Label>
            <Input type="number" value={params.port} onChange={e => update('port', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Connection Timeout (seconds)</Label>
            <Input type="number" value={params['connection-timeout']} onChange={e => update('connection-timeout', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Authentication</CardTitle>
          <CardDescription>Default credentials for RDP connections.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={params.username} onChange={e => update('username', e.target.value)} placeholder="e.g. administrator" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={params.password} onChange={e => update('password', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Domain</Label>
            <Input value={params.domain} onChange={e => update('domain', e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label>Security Mode</Label>
            <Select value={params.security} onValueChange={v => update('security', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nla">NLA (Network Level Auth)</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="rdp">RDP Encryption</SelectItem>
                <SelectItem value="vmconnect">Hyper-V / VMConnect</SelectItem>
                <SelectItem value="any">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox checked={params['ignore-cert'] === 'true'} onCheckedChange={() => toggleBool('ignore-cert')} id="ignore-cert" />
            <Label htmlFor="ignore-cert">Ignore server certificate</Label>
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
            <Label>Width</Label>
            <Input type="number" value={params.width} onChange={e => update('width', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Height</Label>
            <Input type="number" value={params.height} onChange={e => update('height', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>DPI</Label>
            <Input type="number" value={params.dpi} onChange={e => update('dpi', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Color Depth</Label>
            <Select value={params['color-depth']} onValueChange={v => update('color-depth', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8-bit</SelectItem>
                <SelectItem value="16">16-bit</SelectItem>
                <SelectItem value="24">24-bit</SelectItem>
                <SelectItem value="32">32-bit (True Color)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Resize Method</Label>
            <Select value={params['resize-method']} onValueChange={v => update('resize-method', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="display-update">Display Update</SelectItem>
                <SelectItem value="reconnect">Reconnect</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance</CardTitle>
          <CardDescription>Disable visual effects for better remote performance.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <CheckboxRow id="disable-wallpaper" label="Disable wallpaper" checked={params['disable-wallpaper'] === 'true'} onChange={() => toggleBool('disable-wallpaper')} />
          <CheckboxRow id="disable-theming" label="Disable theming" checked={params['disable-theming'] === 'true'} onChange={() => toggleBool('disable-theming')} />
          <CheckboxRow id="enable-font-smoothing" label="Enable font smoothing (ClearType)" checked={params['enable-font-smoothing'] === 'true'} onChange={() => toggleBool('enable-font-smoothing')} />
          <CheckboxRow id="enable-full-window-drag" label="Enable full-window drag" checked={params['enable-full-window-drag'] === 'true'} onChange={() => toggleBool('enable-full-window-drag')} />
          <CheckboxRow id="enable-desktop-composition" label="Enable desktop composition (Aero)" checked={params['enable-desktop-composition'] === 'true'} onChange={() => toggleBool('enable-desktop-composition')} />
          <CheckboxRow id="enable-menu-animations" label="Enable menu animations" checked={params['enable-menu-animations'] === 'true'} onChange={() => toggleBool('enable-menu-animations')} />
        </CardContent>
      </Card>

      {/* Device Redirection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Device Redirection</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <CheckboxRow id="enable-audio" label="Enable audio" checked={params['enable-audio'] === 'true'} onChange={() => toggleBool('enable-audio')} />
          <CheckboxRow id="enable-printing" label="Enable printing" checked={params['enable-printing'] === 'true'} onChange={() => toggleBool('enable-printing')} />
          <CheckboxRow id="enable-drive" label="Enable drive redirection" checked={params['enable-drive'] === 'true'} onChange={() => toggleBool('enable-drive')} />
          <CheckboxRow id="enable-microphone" label="Enable microphone" checked={params['enable-microphone'] === 'true'} onChange={() => toggleBool('enable-microphone')} />
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? 'Saving...' : 'Save RDP Preferences'}
        </Button>
        {saved && <Badge variant="outline" className="text-green-600 border-green-600">Saved</Badge>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </div>
  );
}

// ─── VNC ───

function VNCPreferences({ initialParams, profileName, onSaved }: PreferencesPanelProps) {
  const [params, setParams] = useState<Record<string, string>>({
    port: '5900',
    password: '',
    'read-only': 'false',
    width: '1280',
    height: '720',
    dpi: '96',
    'color-depth': '32',
    'enable-audio': 'false',
    'connection-timeout': '10',
    ...normalizeParams(initialParams),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback((key: string, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const toggleBool = useCallback((key: string) => {
    setParams(prev => ({
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
        if (value === 'true' || value === 'false') {
          apiParams[key] = value === 'true';
        } else if (/^\d+$/.test(value)) {
          apiParams[key] = parseInt(value, 10);
        } else {
          apiParams[key] = value;
        }
      }
      await client.put(`/connection-preferences/vnc/${encodeURIComponent(profileName)}`, {
        parameters: apiParams,
      });
      setSaved(true);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [params, profileName, onSaved]);

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Network</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Port</Label>
            <Input type="number" value={params.port} onChange={e => update('port', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Connection Timeout (seconds)</Label>
            <Input type="number" value={params['connection-timeout']} onChange={e => update('connection-timeout', e.target.value)} />
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
            <Input type="password" value={params.password} onChange={e => update('password', e.target.value)} />
          </div>
          <CheckboxRow id="read-only" label="Read-only mode" checked={params['read-only'] === 'true'} onChange={() => toggleBool('read-only')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Display</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Width</Label>
            <Input type="number" value={params.width} onChange={e => update('width', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Height</Label>
            <Input type="number" value={params.height} onChange={e => update('height', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Color Depth</Label>
            <Select value={params['color-depth']} onValueChange={v => update('color-depth', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
          <CardTitle className="text-lg">Device Redirection</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckboxRow id="vnc-enable-audio" label="Enable audio" checked={params['enable-audio'] === 'true'} onChange={() => toggleBool('enable-audio')} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? 'Saving...' : 'Save VNC Preferences'}
        </Button>
        {saved && <Badge variant="outline" className="text-green-600 border-green-600">Saved</Badge>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </div>
  );
}

// ─── SSH ───

function SSHPreferences({ initialParams, profileName, onSaved }: PreferencesPanelProps) {
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
    'connection-timeout': '10',
    ...normalizeParams(initialParams),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback((key: string, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const toggleBool = useCallback((key: string) => {
    setParams(prev => ({
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
        if (value === 'true' || value === 'false') {
          apiParams[key] = value === 'true';
        } else if (/^\d+$/.test(value)) {
          apiParams[key] = parseInt(value, 10);
        } else {
          apiParams[key] = value;
        }
      }
      await client.put(`/connection-preferences/ssh/${encodeURIComponent(profileName)}`, {
        parameters: apiParams,
      });
      setSaved(true);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [params, profileName, onSaved]);

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Network</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Port</Label>
            <Input type="number" value={params.port} onChange={e => update('port', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Connection Timeout (seconds)</Label>
            <Input type="number" value={params['connection-timeout']} onChange={e => update('connection-timeout', e.target.value)} />
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
            <Input value={params.username} onChange={e => update('username', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={params.password} onChange={e => update('password', e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Private Key</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={params['private-key']}
              onChange={e => update('private-key', e.target.value)}
              placeholder="Paste private key content..."
            />
          </div>
          <div className="space-y-2">
            <Label>Passphrase</Label>
            <Input type="password" value={params.passphrase} onChange={e => update('passphrase', e.target.value)} />
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
            <Input type="number" value={params['font-size']} onChange={e => update('font-size', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Color Scheme</Label>
            <Select value={params['color-scheme']} onValueChange={v => update('color-scheme', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gray-black">Gray on Black</SelectItem>
                <SelectItem value="green-black">Green on Black</SelectItem>
                <SelectItem value="white-black">White on Black</SelectItem>
                <SelectItem value="black-white">Black on White</SelectItem>
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
          <CheckboxRow id="ssh-enable-sftp" label="Enable SFTP" checked={params['enable-sftp'] === 'true'} onChange={() => toggleBool('enable-sftp')} />
          <div className="space-y-2">
            <Label>SFTP Root Directory</Label>
            <Input value={params['sftp-root-directory']} onChange={e => update('sftp-root-directory', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? 'Saving...' : 'Save SSH Preferences'}
        </Button>
        {saved && <Badge variant="outline" className="text-green-600 border-green-600">Saved</Badge>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </div>
  );
}

// ─── Shared checkbox row component ───

function CheckboxRow({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
