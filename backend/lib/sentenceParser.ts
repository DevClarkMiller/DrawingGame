import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Name: SentenceParser
 * Brief: 
 */
export default class SentenceParser{
    
    public constructor(){}

    /**
     * Brief: Takes in a sentence and parses it into an array of image urls
     * coming from google images
     * @param sentence 
     * @returns Array of strings which are image urls
     */
    public async parse(sentence: string): Promise<string[]>{
        const urls: string[] = [];
        try{
            const searchQuery: string = encodeURIComponent(sentence);
            const response = await axios.get(`https://www.google.com/search?hl=en&tbm=isch&q=${searchQuery}`);

            // Load html
            const html = cheerio.load(response.data);

            // Parse the image URLs
            html('img').each((i, img) =>{
                const imgSrc: string | undefined = html(img).attr('src');
                if (imgSrc && imgSrc.includes('http'))
                    urls.push(imgSrc);
            });
        }catch(err: any){
            console.error(err);
        }
        return urls;
    }
}