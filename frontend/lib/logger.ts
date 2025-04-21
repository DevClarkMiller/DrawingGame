// function log(...args: any[]){
//     if (import.meta.)
// }

export interface Logger {
    log(...args: unknown[]): void;
    error(...args: unknown[]): void;
}

export class ProductionLogger implements Logger{
    // Does nothing, this is because the production build shouldn't fill the console with debugging messages
    log(...args: unknown[]) {} 
    error(...args: unknown[]) {}
}

export class DevelopmentLogger implements Logger{
    log(...args: unknown[]) {
        let line: string = (new Error().stack?.split('\n')[2].trim() as string).substring(3); // Ignore the first 3 chars
        let caller: string = line.split(' ')[0];
        let lineSplit: string[] = line.split(':');
        let start: string = lineSplit[lineSplit.length-2];
        let end: string = lineSplit[lineSplit.length-1];
        end = end.substring(0, end.length - 1);

        console.log(`${caller}[${start}:${end}]`);
        console.log(...args);
    } 
    
    error(...args: unknown[]){
        console.error(...args);
    }
}