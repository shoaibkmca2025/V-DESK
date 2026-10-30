import { useEffect, useState } from 'react';
import { getCustomer, restoreSession } from './session.js';

/**
 * The signed-in customer, for components that only need to know who is here (the header, a guard).
 *
 * It starts with whatever this tab already holds, asks the API once whether a refresh cookie still vouches
 * for the session, and follows every later sign-in or sign-out through the `vdesk:session` event — so the
 * header updates without a reload.
 *
 * `ready` is false only until that first question is answered, which is what keeps a guarded page from
 * flashing "please sign in" at someone who is signed in.
 *
 * @returns {{ customer: object | null, ready: boolean }}
 */
export function useCustomer() {
  const [customer, setCustomer] = useState(() => getCustomer());
  const [ready, setReady] = useState(() => Boolean(getCustomer()));

  useEffect(() => {
    let cancelled = false;
    const sync = () => setCustomer(getCustomer());
    globalThis.addEventListener?.('vdesk:session', sync);
    restoreSession().then((signedIn) => {
      if (cancelled) return;
      setCustomer(signedIn);
      setReady(true);
    });
    return () => {
      cancelled = true;
      globalThis.removeEventListener?.('vdesk:session', sync);
    };
  }, []);

  return { customer, ready };
}
