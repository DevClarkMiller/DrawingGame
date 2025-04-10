export default function randomItem(collection: any[]): any{
    return collection[Math.floor(Math.random()*collection.length)];
}