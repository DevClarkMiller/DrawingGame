const FIRST_NAMES: string[] = ['Spider', 'The', 'Kitty', 'Peter', 'Rick', 'Mega', "Bouncing"];
const LAST_NAMES: string[] = ['Man', 'Metal', 'Boy', 'Girl', 'Phile', 'Grimes', "Tron", "Betty"];

/**
 * Brief: Exports a random first and last name from a combination of two arrays
 */
export default function randomName(){
    const firstName: string = FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)];
    const lastName: string = LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)];

    return `${firstName} ${lastName}`;
}