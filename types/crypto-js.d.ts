declare module 'crypto-js' {
  namespace CryptoJS {
    namespace lib {
      interface WordArray {
        toString(encoder?: Encoder): string;
      }

      const WordArray: {
        create(words?: number[], sigBytes?: number): WordArray;
      };
    }

    interface Encoder {}

    namespace enc {
      const Hex: Encoder;
      const Base64: Encoder & {
        parse(data: string): lib.WordArray;
      };
    }

    function SHA256(message: string | lib.WordArray): lib.WordArray;
  }

  export = CryptoJS;
}
