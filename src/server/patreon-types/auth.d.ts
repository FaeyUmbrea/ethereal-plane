export declare const appRouter: import('@trpc/server').CreateRouterInner<
  import('@trpc/server').RootConfig<{
    ctx: {
      user: {
        id: unknown;
        value: unknown;
      } | null;
      ip: string;
    };
    meta: object;
    errorShape: import('@trpc/server').DefaultErrorShape;
    transformer: import('@trpc/server').DefaultDataTransformer;
  }>,
  {
    refresh: import('@trpc/server').BuildProcedure<
      'query',
      {
        _config: import('@trpc/server').RootConfig<{
          ctx: {
            user: {
              id: unknown;
              value: unknown;
            } | null;
            ip: string;
          };
          meta: object;
          errorShape: import('@trpc/server').DefaultErrorShape;
          transformer: import('@trpc/server').DefaultDataTransformer;
        }>;
        _meta: object;
        _ctx_out: {
          user: {
            id: unknown;
            value: unknown;
          } | null;
          ip: string;
        };
        _input_in: string;
        _input_out: string;
        _output_in: typeof import('@trpc/server').unsetMarker;
        _output_out: typeof import('@trpc/server').unsetMarker;
      },
      | {
          authToken: string;
          refreshToken: string;
        }
      | undefined
    >;
    onLogin: import('@trpc/server').BuildProcedure<
      'subscription',
      {
        _config: import('@trpc/server').RootConfig<{
          ctx: {
            user: {
              id: unknown;
              value: unknown;
            } | null;
            ip: string;
          };
          meta: object;
          errorShape: import('@trpc/server').DefaultErrorShape;
          transformer: import('@trpc/server').DefaultDataTransformer;
        }>;
        _meta: object;
        _ctx_out: {
          user: {
            id: unknown;
            value: unknown;
          } | null;
          ip: string;
        };
        _input_in: string;
        _input_out: string;
        _output_in: typeof import('@trpc/server').unsetMarker;
        _output_out: typeof import('@trpc/server').unsetMarker;
      },
      import('@trpc/server/observable').Observable<
        {
          accessToken: string;
          refreshToken: string;
        },
        unknown
      >
    >;
    login: import('@trpc/server').BuildProcedure<
      'query',
      {
        _config: import('@trpc/server').RootConfig<{
          ctx: {
            user: {
              id: unknown;
              value: unknown;
            } | null;
            ip: string;
          };
          meta: object;
          errorShape: import('@trpc/server').DefaultErrorShape;
          transformer: import('@trpc/server').DefaultDataTransformer;
        }>;
        _ctx_out: {
          user: {
            id: unknown;
            value: unknown;
          } | null;
          ip: string;
        };
        _input_in: typeof import('@trpc/server').unsetMarker;
        _input_out: typeof import('@trpc/server').unsetMarker;
        _output_in: typeof import('@trpc/server').unsetMarker;
        _output_out: typeof import('@trpc/server').unsetMarker;
        _meta: object;
      },
      string
    >;
  }
>;
//# sourceMappingURL=auth.d.ts.map
