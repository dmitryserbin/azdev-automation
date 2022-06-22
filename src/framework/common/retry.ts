/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/ban-types */

import Debug from "debug";

const logger = Debug("azdev-automation:Retry");

export interface IRetryOptions {

    attempts: number;
    timeout: number;

}

export function Retryable(options: IRetryOptions = { attempts: 10, timeout: 5000 }): Function {

    const verbose = logger.extend("retryable");

    return function(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {

        const originalMethod: Function = descriptor.value;

        descriptor.value = async function(...args: any[]) {

            try {

                verbose(`Executing <${propertyKey}> with <${options.attempts}> retries`);

                return await retryAsync.apply(this, [ originalMethod, args, options.attempts, options.timeout ]);

            } catch (e: any) {

                e.message = `Failed retrying <${propertyKey}> for <${options.attempts}> times. ${e.message}`;

                throw e;

            }

        };

        return descriptor;

    };

}

async function retryAsync(target: Function, args: any[], attempts: number, timeout: number): Promise<any> {

    const verbose = logger.extend("retryAsync");

    try {

        // @ts-ignore
        return await target.apply(this, args);

    } catch (e: any) {

        if (--attempts < 0) {

            throw new Error(e);

        }

        verbose(`Retrying <${target.name}> in <${timeout / 1000}> seconds`);

        await new Promise((resolve) => setTimeout(resolve, timeout));

        // @ts-ignore
        return retryAsync.apply(this, [ target, args, attempts, timeout ]);

    }

}
