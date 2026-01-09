import { MarketUpdate } from '../types';

type MarketListener = (update: MarketUpdate) => void;

class MarketStreamService {
  private listeners: MarketListener[] = [];
  private socket: WebSocket | null = null;
  private apiKey = import.meta.env.VITE_FINNHUB_API_KEY;

  public connect() {
    if (this.socket || !this.apiKey) return;
    
    this.socket = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);

    this.socket.onopen = () => {
      console.log("TITAN.OS: Connection established to Finnhub Secure Gateway.");
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'trade') {
        data.data.forEach((trade: any) => {
          this.notifyListeners({
            symbol: trade.s,
            price: trade.p,
            change: 0, // Calculated in UI
            changePercent: 0, // Calculated in UI
            timestamp: trade.t
          });
        });
      }
    };
  }

  public registerAsset(symbol: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  public subscribe(listener: MarketListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(update: MarketUpdate) {
    this.listeners.forEach(listener => listener(update));
  }
}

export const marketStream = new MarketStreamService();