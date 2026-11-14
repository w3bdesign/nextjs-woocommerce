// @vitest-environment node
import { ApolloLink, Observable, execute, gql } from '@apollo/client';
import type { ChangeEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { afterware, middleware } from '@/utils/apollo/ApolloClient';
import { handleQuantityChange } from '@/utils/functions/functions';
import type { ICartItemNode } from '@/utils/functions/functions';

/** Code that also runs during server rendering, where there is no window or localStorage. */
describe('on the server', () => {
  it('has no browser window', () => {
    expect(globalThis.window).toBeUndefined();
  });

  it('sends GraphQL requests without a session and does not store one', async () => {
    let sentHeaders: Record<string, string> | undefined;
    const backend = new ApolloLink((operation) => {
      sentHeaders = operation.getContext().headers;
      operation.setContext({
        response: { headers: new Headers({ 'woocommerce-session': 'server-token' }) },
      });
      return Observable.of({ data: { ok: true } });
    });

    const data = await new Promise((resolve, reject) => {
      execute(middleware.concat(afterware.concat(backend)), {
        query: gql`
          query Test {
            ok
          }
        `,
      }).subscribe({ next: (result) => resolve(result.data), error: reject });
    });

    expect(sentHeaders).toEqual({});
    expect(data).toEqual({ ok: true });
  });

  it('ignores cart quantity changes', () => {
    const updateCart = vi.fn();
    const event = { stopPropagation: vi.fn(), target: { value: '2' } };

    handleQuantityChange(
      event as unknown as ChangeEvent<HTMLInputElement>,
      'a',
      [{ key: 'a', quantity: 1 }] as ICartItemNode[],
      updateCart,
      false,
    );

    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(updateCart).not.toHaveBeenCalled();
  });
});
