import randomItem from "./randomItem";

const FIRST_NAMES = ['Spider', 'The', 'Kitty', 'Peter', 'Rick'];
const LAST_NAMES = ['Man', 'Metal', 'Boy', 'Girl', 'Phile', 'Grimes'];

/**
 * Brief: Exports a random first and last name from a combination of two arrays
 */
export default function randomName(){
    const firstName: string = randomItem(FIRST_NAMES);
    const lastName: string = randomItem(LAST_NAMES);

    return `${firstName} ${lastName}`;
}