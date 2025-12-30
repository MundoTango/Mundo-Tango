class AgentEventBus {
  private listeners: { [event: string]: Function[] } = {};

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Initialization logic if needed
  }

  public subscribe(event: string, listener: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  public publish(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(data));
    }
  }
}

const agentEventBus = new AgentEventBus();
export default agentEventBus;