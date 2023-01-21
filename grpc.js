import * as grpc from '@grpc/grpc-js';
import { ClientMessage, GrpcStreamClient } from 'planz-proto';


export class ClientGrpcAccessor {
  constructor(options) {
    this.handlers = [];
    this.options = options;
    const { target } = options;
    // @ts-ignore
    const client = new GrpcStreamClient(target, grpc.credentials.createInsecure(), {
      'grpc.keepalive_time_ms': 10000,
      'grpc.keepalive_timeout_ms': 5000,
      'grpc.use_local_subchannel_pool': 1,
      'grpc.default_compression_algorithm': 2,
      'grpc.default_compression_level': 2,
    });
    this.client = client;
    this.clientStream = client.stream();
    this.ssid;
    this.isRecovery = false;
  }

  write(ssid, message) {
    const clientMessage = new ClientMessage();
    if (!clientMessage.getSsid()) {
      clientMessage.setSsid(ssid);
    }

    const result = this.clientStream.write(clientMessage.setMessage(message));
  }

  on() {
    this.handlers.forEach(({ event, handler }) => {
      switch (event) {
        case 'data':
          this.clientStream.on(event, (message) => {
            handler(message.getMessage(), message.getSsid());
          });
          break;
        case 'error':
          this.clientStream.on('error', (e) => {
            // 서버와 연결이 끊길때
            handler('연결 끊김');
            this.clientStream.removeAllListeners();

            if (!this.isRecovery) {
              this.isRecovery = true;
              setTimeout(() => {
                this.clientStream = this.client.stream();
                this.on();

                this.isRecovery = false;
              }, 5000);
            }
          });
          break;
      }
    });
  }

  addHandler(event, handler) {
    this.handlers.push({ event, handler });
  }
}
