import { Commitment, Connection, SendOptions, TransactionExpiredBlockheightExceededError } from "@solana/web3.js";
import promiseRetry from "promise-retry";

export const sleep = async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const executeTransaction = async (
    connection: Connection,
    tx: Buffer,
): Promise<string | null> => {
    const blockhashInfo = await connection.getLatestBlockhash('finalized');

    const sendOptions: SendOptions = {
        maxRetries: 0,
        skipPreflight: true,
        preflightCommitment: "confirmed" as Commitment,
    };

    const txid = await connection.sendRawTransaction(tx, sendOptions);

    const controller = new AbortController();
    const abortSignal = controller.signal;

    const abortableResender = async () => {
        while (true) {
            await sleep(2_000);
            if (abortSignal.aborted) return;
            try {
                await connection.sendRawTransaction(tx, sendOptions);
            } catch (e) {
                console.warn(`Failed to resend transaction: ${e}`);
            }
        }
    };

    try {
        abortableResender();
        const lastValidBlockHeight = blockhashInfo.lastValidBlockHeight - 100;

        // this would throw TransactionExpiredBlockheightExceededError
        await Promise.race([
            connection.confirmTransaction(
                {
                    ...blockhashInfo,
                    lastValidBlockHeight,
                    signature: txid,
                    abortSignal,
                },
                "confirmed"
            ),
            new Promise(async (resolve) => {
                // in case ws socket died
                while (!abortSignal.aborted) {
                    await sleep(2_000);
                    const tx = await connection.getSignatureStatus(txid, {
                        searchTransactionHistory: false,
                    });
                    if (tx?.value?.confirmationStatus === "confirmed") {
                        resolve(tx);
                    }
                }
            }),
        ]);
    } catch (e) {
        if (e instanceof TransactionExpiredBlockheightExceededError) {
            // we consume this error and getTransaction would return null
            return null;
        } else {
            // invalid state from web3.js
            throw e;
        }
    } finally {
        controller.abort();
    }

    // in case rpc is not synced yet, we add some retries
    const res = promiseRetry(
        async (retry) => {
            const response = await connection.getTransaction(txid, {
                commitment: "confirmed",
                maxSupportedTransactionVersion: 0,
            });
            if (!response) {
                retry(response);
            }
            return response;
        },
        {
            retries: 5,
            minTimeout: 1e3,
        }
    );

    await res;
    return txid;
};