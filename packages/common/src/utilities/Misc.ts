export function lazy<T extends object>(initialize: () => T): T {
    let instance: T | undefined = undefined
    return new Proxy<T>({} as T, {
        get: (target, property, receiver) => {
            if (instance === undefined) instance = initialize()
            return Reflect.get(instance, property, receiver)
        },
        set: (target, property, value, receiver) => {
            if (instance === undefined) instance = initialize()
            return Reflect.set(instance, property, value, receiver)
        }
    })
}

export async function withRetries<R>(work: () => Promise<R>, retryPredicate: (error: Error) => boolean, options?: {
	numRetries?: number,
	delayMs?: number
}): Promise<R> {
	const numRetries: number = options?.numRetries ?? 3
	const delayMs: number = options?.delayMs ?? 0
	for (let i = 0; i <= numRetries; i++) {
		try {
			return await work()
		} catch (error) {
			if (!retryPredicate(error as Error) || i === numRetries) throw error
		}
		await sleep(delayMs)
	}
	throw new Error()
}

export async function sleep(ms: number): Promise<void> {
	return new Promise<void>((resolve) => setTimeout(() => resolve(), ms))
}