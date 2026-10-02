// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { createElement, StrictMode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import useAwait from './useAwait';

const deferred = <T>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return { promise, resolve, reject };
};

afterEach(cleanup);

describe('useAwait', () => {
    it('reports a pending initial promise and returns its settled value', async () => {
        const request = deferred<bigint>();
        const { result } = renderHook(() => useAwait(request.promise));
        expect(result.current).toEqual([undefined, true, undefined]);
        await act(async () => request.resolve(43n));
        expect(result.current).toEqual([43n, false, undefined]);
    });

    it('settles failures and clears the error when a retry succeeds', async () => {
        const failed = deferred<bigint>();
        const retry = deferred<bigint>();
        const { result, rerender } = renderHook(({ value }) => useAwait(value), { initialProps: { value: failed.promise } });
        const error = new Error('RPC request failed');
        await act(async () => failed.reject(error));
        expect(result.current).toEqual([undefined, false, error]);
        rerender({ value: retry.promise });
        expect(result.current).toEqual([undefined, true, undefined]);
        await act(async () => retry.resolve(107n));
        expect(result.current).toEqual([107n, false, undefined]);
    });

    it('hides a previous successful amount while its replacement loads', async () => {
        const first = deferred<bigint>();
        const second = deferred<bigint>();
        const { result, rerender } = renderHook(({ value }) => useAwait(value), { initialProps: { value: first.promise } });
        await act(async () => first.resolve(43n));
        rerender({ value: second.promise });
        expect(result.current).toEqual([undefined, true, undefined]);
        await act(async () => second.resolve(44n));
        expect(result.current).toEqual([44n, false, undefined]);
    });

    it.each(['resolve', 'reject'] as const)('ignores an obsolete promise that later %ss', async (completion) => {
        const first = deferred<number>();
        const second = deferred<number>();
        const { result, rerender } = renderHook(({ value }) => useAwait(value), { initialProps: { value: first.promise } });
        rerender({ value: second.promise });
        await act(async () => second.resolve(2));
        await act(async () => {
            if (completion === 'resolve') first.resolve(1);
            else first.reject(new Error('Obsolete request failed'));
        });
        expect(result.current).toEqual([2, false, undefined]);
    });

    it('handles promise-to-scalar and scalar-to-promise transitions', async () => {
        const first = deferred<number>();
        const second = deferred<number>();
        const initialProps: { value: Promise<number> | number } = { value: first.promise };
        const { result, rerender } = renderHook(({ value }) => useAwait(value), { initialProps });
        rerender({ value: 0 });
        expect(result.current).toEqual([0, false, undefined]);
        await act(async () => first.resolve(1));
        expect(result.current).toEqual([0, false, undefined]);
        rerender({ value: second.promise });
        expect(result.current).toEqual([undefined, true, undefined]);
        await act(async () => second.resolve(2));
        expect(result.current).toEqual([2, false, undefined]);
    });

    it('distinguishes an unavailable result from a rejection without an Error reason', async () => {
        const syncing = deferred<bigint | undefined>();
        const failed = deferred<bigint | undefined>();
        const { result, rerender } = renderHook(({ value }) => useAwait(value), { initialProps: { value: syncing.promise } });
        await act(async () => syncing.resolve(undefined));
        expect(result.current).toEqual([undefined, false, undefined]);
        rerender({ value: failed.promise });
        await act(async () => failed.reject(undefined));
        expect(result.current[0]).toBeUndefined();
        expect(result.current[1]).toBe(false);
        expect(result.current[2]).toBeInstanceOf(Error);
    });

    it('resolves after StrictMode runs effect setup and cleanup twice', async () => {
        const request = deferred<number>();
        const { result } = renderHook(() => useAwait(request.promise), {
            wrapper: ({ children }) => createElement(StrictMode, null, children),
        });
        await act(async () => request.resolve(7));
        expect(result.current).toEqual([7, false, undefined]);
    });
});
