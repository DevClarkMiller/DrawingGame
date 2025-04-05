import { useMemo } from "react";

const useColorRatio = (
    num: number,
    maxNum: number
): any =>{
    const color = useMemo(() =>{
        if (num >= maxNum * 0.8) return 'text-green-600';
        else if (num >= maxNum * 0.5) return 'text-yellow-600';
        else if (num >= maxNum * 0.2) return 'text-orange-600';
        return 'text-red-600'; // Means that like no time is left at all
    }, [num, maxNum]);

    return color;
}

export default useColorRatio;