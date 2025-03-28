const FIRST_NAMES = ['Spider', 'The', 'Kitty', 'Peter', 'Rick'];
const LAST_NAMES = ['Man', 'Metal', 'Boy', 'Girl', 'Phile', 'Grimes'];

/**
 * Brief: Exports a random first and last name from a combination of two arrays
 */
export default function randomName(){
    const firstName = FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)];

    return `${firstName} ${lastName}`;
}