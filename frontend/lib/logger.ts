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
        console.log(...args);
    } 
    
    error(...args: unknown[]){
        console.error(...args);
    }
}