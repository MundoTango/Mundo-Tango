/**
 * Channel Settings Panel - Connect/Disconnect OAuth channels
 * Gmail, Facebook, Instagram, WhatsApp integration
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  MessageSquare, 
  Instagram, 
  Phone,
  Check,
  X,
  RefreshCw,
  Settings,
  ExternalLink,
  Loader2
} from "lucide-react";
import { SiFacebook, SiWhatsapp, SiGmail, SiInstagram } from "react-icons/si";
import { 
  useConnectedChannels, 
  useConnectChannel, 
  useDisconnectChannel,
  useSyncMessages,
  CHANNEL_CONFIG,
  type MessageChannel 
} from "@/hooks/useMessageChannels";
import { useToast } from "@/hooks/use-toast";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface ChannelCardProps {
  channel: MessageChannel;
  connected: boolean;
  accountName?: string | null;
  lastSyncAt?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  isConnecting: boolean;
  isSyncing: boolean;
}

function ChannelCard({
  channel,
  connected,
  accountName,
  lastSyncAt,
  onConnect,
  onDisconnect,
  onSync,
  isConnecting,
  isSyncing
}: ChannelCardProps) {
  const config = CHANNEL_CONFIG[channel];
  
  const getIcon = () => {
    switch (channel) {
      case 'gmail':
        return <SiGmail className="w-6 h-6 text-red-500" />;
      case 'facebook':
        return <SiFacebook className="w-6 h-6 text-blue-600" />;
      case 'instagram':
        return <SiInstagram className="w-6 h-6 text-pink-500" />;
      case 'whatsapp':
        return <SiWhatsapp className="w-6 h-6 text-green-500" />;
      case 'mt':
        return <MessageSquare className="w-6 h-6 text-primary" />;
      default:
        return <Mail className="w-6 h-6" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`transition-all ${connected ? 'border-primary/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                {getIcon()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{config.name}</h4>
                  {connected && (
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                {connected && accountName ? (
                  <p className="text-sm text-muted-foreground">{accountName}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                )}
                {connected && lastSyncAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last synced: {safeDateDistance(lastSyncAt)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {connected && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onSync}
                  disabled={isSyncing}
                  data-testid={`button-sync-${channel}`}
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              {connected ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDisconnect}
                  className="text-destructive hover:text-destructive"
                  data-testid={`button-disconnect-${channel}`}
                >
                  <X className="w-4 h-4 mr-1" />
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onConnect}
                  disabled={isConnecting || channel === 'mt'}
                  data-testid={`button-connect-${channel}`}
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-1" />
                  )}
                  Connect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ChannelSettingsPanel() {
  const { toast } = useToast();
  const { data: channels, isLoading } = useConnectedChannels();
  const connectMutation = useConnectChannel();
  const disconnectMutation = useDisconnectChannel();
  const syncMutation = useSyncMessages();
  
  const [syncingChannel, setSyncingChannel] = useState<MessageChannel | null>(null);

  const isChannelConnected = (channel: MessageChannel) => {
    return channels?.some(c => c.channel === channel && c.isActive) || false;
  };

  const getChannelInfo = (channel: MessageChannel) => {
    return channels?.find(c => c.channel === channel);
  };

  const handleConnect = async (channel: MessageChannel) => {
    try {
      if (channel === 'gmail') {
        window.location.href = '/api/auth/google/messages';
        return;
      }
      
      if (channel === 'facebook' || channel === 'instagram') {
        window.location.href = `/api/auth/facebook?scope=pages_messaging,instagram_basic,instagram_manage_messages`;
        return;
      }
      
      if (channel === 'whatsapp') {
        toast({
          title: "WhatsApp Business",
          description: "Please configure your WhatsApp Business API credentials in settings.",
        });
        return;
      }
      
      await connectMutation.mutateAsync({ channel });
      toast({
        title: "Channel Connected",
        description: `${CHANNEL_CONFIG[channel].name} has been connected successfully.`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect the channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (channel: MessageChannel) => {
    try {
      await disconnectMutation.mutateAsync(channel);
      toast({
        title: "Channel Disconnected",
        description: `${CHANNEL_CONFIG[channel].name} has been disconnected.`,
      });
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect the channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSync = async (channel: MessageChannel) => {
    setSyncingChannel(channel);
    try {
      await syncMutation.mutateAsync(channel);
      toast({
        title: "Sync Complete",
        description: `${CHANNEL_CONFIG[channel].name} messages have been synced.`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncingChannel(null);
    }
  };

  const availableChannels: MessageChannel[] = ['mt', 'gmail', 'facebook', 'instagram', 'whatsapp'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Connected Channels
          </h3>
          <p className="text-sm text-muted-foreground">
            Connect your messaging accounts to receive all messages in one place
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncMutation.mutate(undefined)}
          disabled={syncMutation.isPending}
          data-testid="button-sync-all"
        >
          {syncMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Sync All
        </Button>
      </div>

      <Separator />

      <div className="space-y-3">
        {availableChannels.map((channel) => {
          const info = getChannelInfo(channel);
          return (
            <ChannelCard
              key={channel}
              channel={channel}
              connected={channel === 'mt' ? true : isChannelConnected(channel)}
              accountName={info?.accountName}
              lastSyncAt={info?.lastSyncAt}
              onConnect={() => handleConnect(channel)}
              onDisconnect={() => handleDisconnect(channel)}
              onSync={() => handleSync(channel)}
              isConnecting={connectMutation.isPending}
              isSyncing={syncingChannel === channel}
            />
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted/50">
        <h4 className="font-medium mb-2">About Unified Inbox</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• All connected channels appear in one unified view</li>
          <li>• Messages are automatically synced every 5 minutes</li>
          <li>• Reply to messages from any channel directly</li>
          <li>• Your credentials are securely encrypted</li>
        </ul>
      </div>
    </div>
  );
}
