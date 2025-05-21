/// <reference types="vite/client" />

declare module '*.css';
declare module 'react-modal';
declare module 'react-big-calendar';
declare module '@react-oauth/google';

declare module 'sockjs-client/dist/sockjs' {
  const SockJS: any;
  export default SockJS;
}

declare module 'stompjs' {
  export interface Message {
    body: string;
  }

  export interface Subscription {
    unsubscribe(): void;
  }

  export interface Client {
    connect(
      headers: Record<string, string>,
      onConnect: () => void,
      onError?: (error: string) => void
    ): void;

    disconnect(callback?: () => void): void;

    subscribe(destination: string, callback: (message: Message) => void): Subscription;

    send(destination: string, headers: Record<string, string>, body: string): void;
  }

  export function over(ws: any): Client;
}
