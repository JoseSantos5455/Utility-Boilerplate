import * as readline from 'readline-browser';

/**
 * Warn or continue
 * @param msg Msg to display
 * @param success Success criteria input match
 * @returns 
 */
export const warnContinueAbort = async (msg: any, success: any) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        let reply: string = '';
        const prompt = (query: any) => new Promise((resolve) => rl.question(query, {}, resolve));

        reply = (await prompt(msg) as any);
        if (reply === success) {
            return;
        }
        throw 'Cancelled';
    } finally {
        rl.close();
    }
}
