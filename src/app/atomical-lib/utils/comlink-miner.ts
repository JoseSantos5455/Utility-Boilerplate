import { expose } from 'comlink'

const getFinalMessage = async () => {
  const res = await fetch(
    "https://random-word-api.herokuapp.com/word?number=1"
  );
  const json = await res.json();
  return json[0];
}

const comlinkMiner: ComlinkMinerType = {
  getFinalMessage
}

export type ComlinkMinerType = {
  getFinalMessage: typeof getFinalMessage
}

export default null as any
expose(comlinkMiner)