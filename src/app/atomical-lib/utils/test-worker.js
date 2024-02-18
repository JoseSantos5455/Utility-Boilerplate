import ECPairFactory from "ecpair";
// const ECPair = ECPairFactory(tinysecp);

if (self) {
  self.addEventListener("message", async (event) => {
      const message = event.data
      // Extract parameters from the message
      console.log(message)
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
      } = message;
      let sequence = seqStart;
      let workerPerformBitworkForCommitTx = performBitworkForCommitTx;
      let scriptP2TR = iscriptP2TR;
      let hashLockP2TR = ihashLockP2TR;

      // const fundingKeypairRaw = ECPair.fromWIF(fundingWIF);
      // console.log(fundingKeypairRaw)

      // const fundingKeypair = getKeypairInfo(fundingKeypairRaw);











      const finalCopyData = {

      }

      self.postMessage({
        finalCopyData,
        finalSequence: sequence,
      });
  })

}
