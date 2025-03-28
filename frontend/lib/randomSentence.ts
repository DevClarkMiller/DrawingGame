const SENTENCES: string[] = ["Dog eating a bone", "Cat on on a skateboard", "Massive volcano", "Cartoon fruit fly", "Spongebob", "World of T-Shirts"];

/**
 * Brief: Exports a random sentence to be used by the sketch and vote page
 */
export default function randomSentence(){
    return SENTENCES[Math.floor(Math.random()*SENTENCES.length)];
}