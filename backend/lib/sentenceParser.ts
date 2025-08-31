import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Name: SentenceParser
 * Brief: 
 */
export default class SentenceParser{
    private requestOptions: any;
    public constructor(){
        this.requestOptions = {
            headers : {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            }
        }
    }

    /**
     * Brief: Takes in a sentence and parses it into an array of image urls
     * coming from google images
     * @param sentence 
     * @returns Array of strings which are image urls
     */
    public async Parse(sentence: string): Promise<string[]>{
        const urls: string[] = [];
        try{
            const searchQuery: string = encodeURIComponent(sentence);

            const response = await axios.get(
                `https://www.google.com/search?hl=en&tbm=isch&q=${searchQuery}&safe=off`, this.requestOptions
            );

            // Load html
            const $ = cheerio.load(response.data);

            // Parse the image URLs
            $("script").each((_, script) => {
                const scriptText = $(script).html();
                if (scriptText) {
                  // Match all image URLs (including base URLs and other script data)
                  const match = scriptText.match(/"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp))"/g);
                  if (match) {
                    match.forEach((m) => {
                      const url = m.replace(/"/g, "");
                      if (url.includes("http") && url.match(/\.(jpg|jpeg|png|webp)/)) {
                        urls.push(url);
                      }
                    });
                  }
                }
              });
        }catch(err: any){
            console.error(err);
        }
        return urls;
    }
}