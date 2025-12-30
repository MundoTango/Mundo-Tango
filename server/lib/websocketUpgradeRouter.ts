import { Server } from 'http';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';

type UpgradeHandler = (
  request: IncomingMessage, 
  socket: Duplex, 
  head: Buffer
) => void;

interface RegisteredHandler {
  path: string;
  handler: UpgradeHandler;
  name: string;
}

export class WebSocketUpgradeRouter {
  private handlers: RegisteredHandler[] = [];
  private server: Server | null = null;
  private originalOn: typeof Server.prototype.on | null = null;
  private originalAddListener: typeof Server.prototype.addListener | null = null;

  initialize(server: Server) {
    this.server = server;
    console.log('[WS Router] Initializing WebSocket upgrade router...');

    this.server.on('upgrade', (request, socket, head) => {
      this.handleUpgrade(request, socket, head);
    });

    this.patchServerListeners(server);
    console.log('[WS Router] WebSocket upgrade router initialized');
  }

  private patchServerListeners(server: Server) {
    const self = this;
    this.originalOn = server.on.bind(server);
    this.originalAddListener = server.addListener.bind(server);

    const wrapUpgradeListener = (listener: UpgradeHandler): UpgradeHandler => {
      return function wrappedListener(request: any, socket: Duplex, head: Buffer) {
        if (request.__wsHandled) {
          return;
        }
        return listener.call(this, request, socket, head);
      };
    };

    server.on = function(event: string, listener: any) {
      if (event === 'upgrade') {
        console.log('[WS Router] Intercepting external upgrade listener (wrapping with guard)');
        return self.originalOn!.call(this, event, wrapUpgradeListener(listener));
      }
      return self.originalOn!.call(this, event, listener);
    } as any;

    server.addListener = function(event: string, listener: any) {
      if (event === 'upgrade') {
        console.log('[WS Router] Intercepting external addListener for upgrade (wrapping with guard)');
        return self.originalAddListener!.call(this, event, wrapUpgradeListener(listener));
      }
      return self.originalAddListener!.call(this, event, listener);
    } as any;
  }

  register(path: string, name: string, handler: UpgradeHandler) {
    this.handlers.push({ path, name, handler });
    console.log(`[WS Router] Registered handler for ${path} (${name})`);
  }

  private handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer) {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const pathname = url.pathname;

    for (const registered of this.handlers) {
      if (pathname === registered.path || pathname.startsWith(registered.path + '/')) {
        console.log(`[WS Router] Routing ${pathname} to ${registered.name}`);
        (request as any).__wsHandled = true;
        registered.handler(request, socket, head);
        return;
      }
    }
  }
}

export const wsUpgradeRouter = new WebSocketUpgradeRouter();
