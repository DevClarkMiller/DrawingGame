import { useMemo } from "react";
import { Logger, DevelopmentLogger, ProductionLogger } from "@lib/logger";

export const useLogger = (
): Logger =>{
    return useMemo(() =>{
    if ((process.env.ENV || "DEV") === 'DEV'){
        return new DevelopmentLogger();
    }else{
        return new ProductionLogger();
    }
    }, []);
}