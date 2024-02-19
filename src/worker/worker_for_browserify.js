const { networks, initEccLib, Psbt, script, payments, crypto } = require("bitcoinjs-lib");
const { ECPairFactory } = require("ecpair");
const cbor = require('borc');
const ecc = require('@bitcoinerlab/secp256k1');

// you should configure this according to your network: testnet/bitcoin
const NETWORK = networks.bitcoin;

initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
const DUST_AMOUNT = 546;
const MAX_SEQUENCE = 0xffffffff;
const OUTPUT_BYTES_BASE = 43;
const ATOMICALS_PROTOCOL_ENVELOPE_ID = 'atom';

function chunkBuffer(buffer, chunkSize) {
	const result = [];
	const len = buffer.byteLength;
	let i = 0;
	while (i < len) {
		result.push(buffer.slice(i, i += chunkSize));
	}
	return result;
}

const toXOnly = (publicKey) => {
    return publicKey.slice(1, 33);
}

const getKeypairInfo = (childNode) => {
  const childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
  // This is new for taproot
  // Note: we are using mainnet here to get the correct address
  // The output is the same no matter what the network is.
  const { address, output } = payments.p2tr({
    internalPubkey: childNodeXOnlyPubkey,
    network: NETWORK
  });

  // Used for signing, since the output and address are using a tweaked key
  // We must tweak the signer in the same way.
  const tweakedChildNode = childNode.tweak(
    crypto.taggedHash('TapTweak', childNodeXOnlyPubkey),
  );

  return {
    address,
    tweakedChildNode,
    childNodeXOnlyPubkey,
    output,
    childNode
  }
}

const hasValidBitwork = (txid, bitwork, bitworkx) => {
  if (txid.startsWith(bitwork)) {
    if (!bitworkx) {
      return true;
    } else {
      const next_char = txid[bitwork.length]
      const char_map = {
        '0': 0,
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        'a': 10,
        'b': 11,
        'c': 12,
        'd': 13,
        'e': 14,
        'f': 15
      }
      const get_numeric_value = char_map[next_char]
      if (get_numeric_value >= bitworkx) {
        return true;
      }
    }
  }
  return false;
}

// This is the worker's message event listener
if (self) {
    self.addEventListener("message", async (event) => {
        const message = event.data
            // Extract parameters from the message
        const {
            copiedData,
            seqStart,
            seqEnd,
            workerOptions,
            fundingWIF,
            fundingUtxo,
            fees,
            performBitworkForCommitTx,
            workerBitworkInfoCommit,
            iscriptP2TR,
            ihashLockP2TR,
            // fundingKeypair
        } = message;


        let sequence = seqStart;
        let workerPerformBitworkForCommitTx = performBitworkForCommitTx;
        let scriptP2TR = iscriptP2TR;
        let hashLockP2TR = ihashLockP2TR;

        const fundingKeypairRaw = ECPair.fromWIF(fundingWIF);
        const fundingKeypair = getKeypairInfo(fundingKeypairRaw);

        copiedData["args"]["time"] = Math.floor(Date.now() / 1000);

        let atomPayload = makeAtomicalPayload(copiedData);

        let updatedBaseCommit =
            workerPrepareCommitRevealConfig(
                workerOptions.opType,
                fundingKeypair,
                atomPayload
            );

        const tabInternalKey = Buffer.from(
            fundingKeypair.childNodeXOnlyPubkey
        );

        const witnessUtxo = {
            value: fundingUtxo.value,
            script: Buffer.from(fundingKeypair.output, "hex"),
        };

        const totalInputsValue = fundingUtxo.value;
        const totalOutputsValue = getOutputValueForCommit(fees);
        const calculatedFee = totalInputsValue - totalOutputsValue;

        let needChangeFeeOutput = false;
        // In order to keep the fee-rate unchanged, we should add extra fee for the new added change output.
        const expectedFee =
            fees.commitFeeOnly +
            (workerOptions.satsbyte) * OUTPUT_BYTES_BASE;
        const differenceBetweenCalculatedAndExpected =
            calculatedFee - expectedFee;
        if (
            calculatedFee > 0 &&
            differenceBetweenCalculatedAndExpected > 0 &&
            differenceBetweenCalculatedAndExpected >= DUST_AMOUNT
        ) {
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

                atomPayload = makeAtomicalPayload(copiedData);
                const newBaseCommit =
                    workerPrepareCommitRevealConfig(
                        workerOptions.opType,
                        fundingKeypair,
                        atomPayload
                    );
                updatedBaseCommit = newBaseCommit;
                fixedOutput = {
                    address: updatedBaseCommit.scriptP2TR.address,
                    value: getOutputValueForCommit(fees),
                };

                sequence = seqStart;
            }
            // if (sequence % 10000 == 0) {
            //     console.log(
            //         "Started mining for sequence: " +
            //             sequence +
            //             " - " +
            //             Math.min(sequence + 10000, MAX_SEQUENCE)
            //     );
            // }

            // Create a new PSBT (Partially Signed Bitcoin Transaction)
            let psbtStart = new Psbt({ network: NETWORK });
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
            if (
                workerPerformBitworkForCommitTx &&
                hasValidBitwork(
                    checkTxid,
                    workerBitworkInfoCommit?.prefix,
                    workerBitworkInfoCommit?.ext
                )
            ) {
                // Valid proof of work found, log success message
                // console.log(
                //     console.log(prelimTx.getId(), ` sequence: (${sequence})`)
                // );
                // console.log(
                //     "\nBitwork matches commit txid! ",
                //     prelimTx.getId(),
                //     `@ time: ${Math.floor(Date.now() / 1000)}`
                // );

                finalCopyData = copiedData;
                finalPrelimTx = prelimTx;
                workerPerformBitworkForCommitTx = false;
                break;
            }

            sequence++;
            generated++;

            if (generated % 10000 === 0) {
                const hashRate = ((generated - lastGenerated) / (Date.now() - lastTime)) * 1000;
                // console.log(
                //     'Hash rate:',
                //     hashRate.toFixed(2),
                //     'Op/s ',
                // );
                lastTime = Date.now();
                lastGenerated = generated;
                await immediate();
            }
        } while (workerPerformBitworkForCommitTx);

        // send a result or message back to the main thread
        // console.log(
        //     "Got one finalCopyData: " + JSON.stringify(finalCopyData)
        // );
        // console.log(
        //     "Got one finalPrelimTx: " + finalPrelimTx.toString()
        // );
        // console.log("Got one finalSequence: " + JSON.stringify(sequence));

        self.postMessage({
            finalCopyData,
            finalSequence: sequence,
        });
    });
}

function getOutputValueForCommit(fees) {
    let sum = 0;
    // Note that `Additional inputs` refers to the additional inputs in a reveal tx.
    return fees.revealFeePlusOutputs - sum;
}

function addCommitChangeOutputIfRequired(
    extraInputValue,
    fee,
    pbst,
    address,
    satsbyte
) {
    const totalInputsValue = extraInputValue;
    const totalOutputsValue = getOutputValueForCommit(fee);
    const calculatedFee = totalInputsValue - totalOutputsValue;
    // It will be invalid, but at least we know we don't need to add change
    if (calculatedFee <= 0) {
        return;
    }
    // In order to keep the fee-rate unchanged, we should add extra fee for the new added change output.
    const expectedFee =
        fee.commitFeeOnly + (satsbyte) * OUTPUT_BYTES_BASE;
    const differenceBetweenCalculatedAndExpected = calculatedFee - expectedFee;
    if (differenceBetweenCalculatedAndExpected <= 0) {
        return;
    }
    // There were some excess satoshis, but let's verify that it meets the dust threshold to make change
    if (differenceBetweenCalculatedAndExpected >= DUST_AMOUNT) {
        pbst.addOutput({
            address: address,
            value: differenceBetweenCalculatedAndExpected,
        });
    }
}

const workerPrepareCommitRevealConfig = (
    opType,
    keypair,
    atomicalsCBOR,
    log = true
) => {
    const revealScript = appendMintUpdateRevealScript(
        opType,
        keypair,
        atomicalsCBOR,
        log
    );
    const hashscript = script.fromASM(revealScript);
    const scriptTree = {
        output: hashscript,
    };
    const hash_lock_script = hashscript;
    const hashLockRedeem = {
        output: hash_lock_script,
        redeemVersion: 192,
    };
    const buffer = Buffer.from(keypair.childNodeXOnlyPubkey);
    const scriptP2TR = payments.p2tr({
        internalPubkey: buffer,
        scriptTree,
        network: NETWORK,
    });

    const hashLockP2TR = payments.p2tr({
        internalPubkey: buffer,
        scriptTree,
        redeem: hashLockRedeem,
        network: NETWORK,
    });
    return {
        scriptP2TR,
        hashLockP2TR,
        hashscript,
    };
};

const appendMintUpdateRevealScript = (
    opType,
    keypair,
    payloadCbor,
    log = true
) => {
    let ops = `${keypair.childNodeXOnlyPubkey.toString(
        "hex"
    )} OP_CHECKSIG OP_0 OP_IF `;
    ops += `${Buffer.from(ATOMICALS_PROTOCOL_ENVELOPE_ID, "utf8").toString(
        "hex"
    )}`;
    ops += ` ${Buffer.from(opType, "utf8").toString("hex")}`;
    // ops += `${bops.from(ATOMICALS_PROTOCOL_ENVELOPE_ID, "utf8").toString(
    //     "hex"
    // )}`;
    // ops += ` ${bops.from(opType, "utf8").toString("hex")}`;
    const chunks = chunkBuffer(payloadCbor, 520);
    for (let chunk of chunks) {
        ops += ` ${chunk.toString("hex")}`;
    }
    ops += ` OP_ENDIF`;
    return ops;
};

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function immediate() {
    return new Promise(resolve => setImmediate(resolve));
}

function makeAtomicalPayload (originalData) {
  if (!originalData) {
      this.originalData = {};
      return;
  }

  if (!validateWhitelistedDatatypes(originalData)) {
      console.log('Invalid payload contains disallowed data types. Use only number, string, null, or buffer');
  }

  // Also make sure that if either args, ctx, init, or meta are provided, then we never allow buffer.
  if (originalData['args']) {
      if (!validateWhitelistedDatatypes(originalData['args'], false)) {
          console.log('args field invalid due to presence of buffer type');
      }
  }
  if (originalData['ctx']) {
      if (!validateWhitelistedDatatypes(originalData['ctx'], false)) {
          console.log('ctx field invalid due to presence of buffer type');
      }
  }
  if (originalData['meta']) {
      if (!validateWhitelistedDatatypes(originalData['meta'], false)) {
          console.log('meta field invalid due to presence of buffer type');
      }
  }

  const payload = {
      ...originalData
  }
  const cborEncoded = cbor.encode(payload);
  // Decode to do sanity check
  const cborDecoded = cbor.decode(cborEncoded);
  if (!deepEqual(cborDecoded, payload)) {
      console.log('CBOR Decode error objects are not the same. Developer error');
  }
  if (!deepEqual(originalData, payload)) {
      console.log('CBOR Payload Decode error objects are not the same. Developer error');
  }
  return cborEncoded;
}

function deepEqual(x, y) {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
      ok(x).length === ok(y).length &&
      ok(x).every(key => deepEqual(x[key], y[key]))
  ) : (x === y);
}

function isAllowedtype(tc, allowBuffer) {
  if (tc === 'object' || tc === 'Number' || tc === 'number' || tc === 'null' || tc === 'string' || tc == 'boolean') {
      return true;
  }
  if (allowBuffer && tc === 'buffer') {
      return true;
  }
  return false;
}

function validateWhitelistedDatatypes(x, allowBuffer = true) {
  const ok = Object.keys;
  const tx = typeof x;
  const isAllowed = isAllowedtype(tx, allowBuffer);
  if (!isAllowed) {
      return false;
  }
  if (tx === 'object') {
      return ok(x).every(key => validateWhitelistedDatatypes(x[key], allowBuffer));
  }
  return true;
}