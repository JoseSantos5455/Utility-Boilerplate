"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendMintUpdateRevealScript = exports.workerPrepareCommitRevealConfig = void 0;
/**
This file was created by the user:
https://github.com/danieleth2/atomicals-js/commit/02e854cc71c0f6c6559ff35c2093dc8d526b5d72
*/
// const worker_threads_1 = require("web-worker");
const address_keypair_path_1 = require("./address-keypair-path");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const atomical_format_helpers_1 = require("./atomical-format-helpers");
const ecc = require('@bitcoinerlab/secp256k1');
// const ecc = require("tiny-secp256k1");
const ecpair_1 = require("ecpair");
const tinysecp = require('@bitcoinerlab/secp256k1')
// const tinysecp = require("tiny-secp256k1");
const bitcoin = require("bitcoinjs-lib");
const chalk = require("chalk");
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_2 = require("bitcoinjs-lib");
(0, bitcoinjs_lib_2.initEccLib)(tinysecp);
const command_helpers_1 = require("../commands/command-helpers");
const atomical_operation_builder_1 = require("./atomical-operation-builder");
const protocol_tags_1 = require("../types/protocol-tags");
const file_utils_1 = require("./file-utils");
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
// This is the worker's message event listener
// if (worker_threads_1.parentPort) {
    addEventListener("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        // Extract parameters from the message
        const { copiedData, seqStart, seqEnd, workerOptions, fundingWIF, fundingUtxo, fees, performBitworkForCommitTx, workerBitworkInfoCommit, iscriptP2TR, ihashLockP2TR, } = message;
        let sequence = seqStart;
        let workerPerformBitworkForCommitTx = performBitworkForCommitTx;
        let scriptP2TR = iscriptP2TR;
        let hashLockP2TR = ihashLockP2TR;
        const fundingKeypairRaw = ECPair.fromWIF(fundingWIF);
        const fundingKeypair = (0, address_keypair_path_1.getKeypairInfo)(fundingKeypairRaw);
        copiedData["args"]["time"] = Math.floor(Date.now() / 1000);
        let atomPayload = new command_helpers_1.AtomicalsPayload(copiedData);
        let updatedBaseCommit = (0, exports.workerPrepareCommitRevealConfig)(workerOptions.opType, fundingKeypair, atomPayload);
        const tabInternalKey = Buffer.from(fundingKeypair.childNodeXOnlyPubkey);
        const witnessUtxo = {
            value: fundingUtxo.value,
            script: Buffer.from(fundingKeypair.output, "hex"),
        };
        const totalInputsValue = fundingUtxo.value;
        const totalOutputsValue = getOutputValueForCommit(fees);
        const calculatedFee = totalInputsValue - totalOutputsValue;
        let needChangeFeeOutput = false;
        // In order to keep the fee-rate unchanged, we should add extra fee for the new added change output.
        const expectedFee = fees.commitFeeOnly +
            workerOptions.satsbyte * atomical_operation_builder_1.OUTPUT_BYTES_BASE;
        const differenceBetweenCalculatedAndExpected = calculatedFee - expectedFee;
        if (calculatedFee > 0 &&
            differenceBetweenCalculatedAndExpected > 0 &&
            differenceBetweenCalculatedAndExpected >= atomical_operation_builder_1.DUST_AMOUNT) {
            // There were some excess satoshis, but let's verify that it meets the dust threshold to make change
            needChangeFeeOutput = true;
        }
        let prelimTx;
        let fixedOutput = {
            address: updatedBaseCommit.scriptP2TR.address,
            value: getOutputValueForCommit(fees),
        };
        let finalCopyData, finalPrelimTx;
        let lastGenerated = 0;
        let generated = 0;
        let lastTime = Date.now();
        // Start mining loop, terminates when a valid proof of work is found or stopped manually
        do {
            // If the sequence has exceeded the max sequence allowed, generate a newtime and reset the sequence until we find one.
            if (sequence > seqEnd) {
                copiedData["args"]["time"] = Math.floor(Date.now() / 1000);
                atomPayload = new command_helpers_1.AtomicalsPayload(copiedData);
                const newBaseCommit = (0, exports.workerPrepareCommitRevealConfig)(workerOptions.opType, fundingKeypair, atomPayload);
                updatedBaseCommit = newBaseCommit;
                fixedOutput = {
                    address: updatedBaseCommit.scriptP2TR.address,
                    value: getOutputValueForCommit(fees),
                };
                sequence = seqStart;
            }
            if (sequence % 10000 == 0) {
                console.log("Started mining for sequence: " +
                    sequence +
                    " - " +
                    Math.min(sequence + 10000, atomical_operation_builder_1.MAX_SEQUENCE));
            }
            // Create a new PSBT (Partially Signed Bitcoin Transaction)
            let psbtStart = new bitcoinjs_lib_2.Psbt({ network: command_helpers_1.NETWORK });
            psbtStart.setVersion(1);
            // Add input and output to PSBT
            psbtStart.addInput({
                hash: fundingUtxo.txid,
                index: fundingUtxo.index,
                sequence: sequence,
                tapInternalKey: tabInternalKey,
                witnessUtxo: witnessUtxo,
            });
            psbtStart.addOutput(fixedOutput);
            // Add change output if needed
            if (needChangeFeeOutput) {
                psbtStart.addOutput({
                    address: fundingKeypair.address,
                    value: differenceBetweenCalculatedAndExpected,
                });
            }
            psbtStart.signInput(0, fundingKeypair.tweakedChildNode);
            psbtStart.finalizeAllInputs();
            // Extract the transaction and get its ID
            prelimTx = psbtStart.extractTransaction();
            const checkTxid = prelimTx.getId();
            // Check if there is a valid proof of work
            if (workerPerformBitworkForCommitTx &&
                (0, atomical_format_helpers_1.hasValidBitwork)(checkTxid, workerBitworkInfoCommit === null || workerBitworkInfoCommit === void 0 ? void 0 : workerBitworkInfoCommit.prefix, workerBitworkInfoCommit === null || workerBitworkInfoCommit === void 0 ? void 0 : workerBitworkInfoCommit.ext)) {
                // Valid proof of work found, log success message
                console.log(chalk.green(prelimTx.getId(), ` sequence: (${sequence})`));
                console.log("\nBitwork matches commit txid! ", prelimTx.getId(), `@ time: ${Math.floor(Date.now() / 1000)}`);
                finalCopyData = copiedData;
                finalPrelimTx = prelimTx;
                workerPerformBitworkForCommitTx = false;
                break;
            }
            sequence++;
            generated++;
            if (generated % 10000 === 0) {
                const hashRate = ((generated - lastGenerated) / (Date.now() - lastTime)) * 1000;
                console.log('Hash rate:', hashRate.toFixed(2), 'Op/s ');
                lastTime = Date.now();
                lastGenerated = generated;
                yield immediate();
            }
        } while (workerPerformBitworkForCommitTx);
        // send a result or message back to the main thread
        console.log("Got one finalCopyData: " + JSON.stringify(finalCopyData));
        console.log("Got one finalPrelimTx: " + finalPrelimTx.toString());
        console.log("Got one finalSequence: " + JSON.stringify(sequence));
        worker_threads_1.parentPort.postMessage({
            finalCopyData,
            finalSequence: sequence,
        });
    }));
// }
function getOutputValueForCommit(fees) {
    let sum = 0;
    // Note that `Additional inputs` refers to the additional inputs in a reveal tx.
    return fees.revealFeePlusOutputs - sum;
}
function addCommitChangeOutputIfRequired(extraInputValue, fee, pbst, address, satsbyte) {
    const totalInputsValue = extraInputValue;
    const totalOutputsValue = getOutputValueForCommit(fee);
    const calculatedFee = totalInputsValue - totalOutputsValue;
    // It will be invalid, but at least we know we don't need to add change
    if (calculatedFee <= 0) {
        return;
    }
    // In order to keep the fee-rate unchanged, we should add extra fee for the new added change output.
    const expectedFee = fee.commitFeeOnly + satsbyte * atomical_operation_builder_1.OUTPUT_BYTES_BASE;
    const differenceBetweenCalculatedAndExpected = calculatedFee - expectedFee;
    if (differenceBetweenCalculatedAndExpected <= 0) {
        return;
    }
    // There were some excess satoshis, but let's verify that it meets the dust threshold to make change
    if (differenceBetweenCalculatedAndExpected >= atomical_operation_builder_1.DUST_AMOUNT) {
        pbst.addOutput({
            address: address,
            value: differenceBetweenCalculatedAndExpected,
        });
    }
}
const workerPrepareCommitRevealConfig = (opType, keypair, atomicalsPayload, log = true) => {
    const revealScript = (0, exports.appendMintUpdateRevealScript)(opType, keypair, atomicalsPayload, log);
    const hashscript = bitcoinjs_lib_1.script.fromASM(revealScript);
    const scriptTree = {
        output: hashscript,
    };
    const hash_lock_script = hashscript;
    const hashLockRedeem = {
        output: hash_lock_script,
        redeemVersion: 192,
    };
    const buffer = Buffer.from(keypair.childNodeXOnlyPubkey);
    const scriptP2TR = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: buffer,
        scriptTree,
        network: command_helpers_1.NETWORK,
    });
    const hashLockP2TR = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: buffer,
        scriptTree,
        redeem: hashLockRedeem,
        network: command_helpers_1.NETWORK,
    });
    return {
        scriptP2TR,
        hashLockP2TR,
        hashscript,
    };
};
exports.workerPrepareCommitRevealConfig = workerPrepareCommitRevealConfig;
const appendMintUpdateRevealScript = (opType, keypair, payload, log = true) => {
    let ops = `${keypair.childNodeXOnlyPubkey.toString("hex")} OP_CHECKSIG OP_0 OP_IF `;
    ops += `${Buffer.from(protocol_tags_1.ATOMICALS_PROTOCOL_ENVELOPE_ID, "utf8").toString("hex")}`;
    ops += ` ${Buffer.from(opType, "utf8").toString("hex")}`;
    const chunks = (0, file_utils_1.chunkBuffer)(payload.cbor(), 520);
    for (let chunk of chunks) {
        ops += ` ${chunk.toString("hex")}`;
    }
    ops += ` OP_ENDIF`;
    return ops;
};
exports.appendMintUpdateRevealScript = appendMintUpdateRevealScript;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function immediate() {
    return new Promise(resolve => setImmediate(resolve));
}
