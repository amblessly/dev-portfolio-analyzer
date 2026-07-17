declare module "@arcjet/next" {
  interface ArcjetRule {
    type: string;
    max?: number;
    window?: string;
  }
  interface ArcjetOptions {
    key: string;
    rules?: ArcjetRule[];
    [key: string]: unknown;
  }
  interface ArcjetDecision {
    isDenied(): boolean;
    isAllowed(): boolean;
  }
  export default function Arcjet(options: ArcjetOptions): {
    protect(req: unknown): Promise<ArcjetDecision>;
  };
}
