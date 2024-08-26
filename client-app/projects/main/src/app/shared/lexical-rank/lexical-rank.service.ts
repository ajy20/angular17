import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LexicalRankService {

  private minRank = 'AAA';
  private maxRank = 'zzz';
  private alphabetSize = 58; // 26 upper case letters [A-Z], 6 special characters ([ \ ] ^ _ `) and  26 lower case letters [a-z]

  getMinRank() { return this.minRank; }
  getMaxRank() { return this.maxRank; }

  // Return a new rank value for an item to be ranked between 'first' and 'second' ranks
  getRankBetween(first: string, second: string): string {
    // Ensure that the first rank is lower than the second rank
    if (second < first)
      throw 'First rank must be lower than second rank';

    // Normalize the sizes of the first and second ranks
    while (first.length != second.length) {
      if (first.length > second.length)
        second += 'A'
      else
        first += 'A'
    }

    // Extract character codes for each characters of the ranks
    const firstCodes = [...first].map(x => x.charCodeAt(0));
    const secondCodes = [...second].map(x => x.charCodeAt(0));

    // Compute difference between first and second
    // The difference is the number of character between first and second
    let difference = 0;

    for (var i = firstCodes.length - 1; i >= 0; i--) {
      let firstCode = firstCodes[i];
      let secondCode = secondCodes[i];

      // Adjust 
      if (secondCode < firstCode) {
        secondCode += this.alphabetSize;
        secondCodes[i - 1] -= 1;
      }

      // Increment difference
      difference += (secondCode - firstCode) * (this.alphabetSize ** (first.length - i - 1))
    }

    // Generate the new rank
    let newRank = '';

    if (difference <= 1) {
      // Simply add the middle character from the alphabet to the first rank
      newRank = first + String.fromCharCode('A'.charCodeAt(0) + Math.floor(this.alphabetSize / 2));
    } else {
      // Add half of the difference to the first rank
      difference = Math.floor(difference / 2);

      // Intialize offet
      let offset = 0;

      for (var i = 0; i < firstCodes.length; i++) {
        const characterDiff = Math.floor(difference / (this.alphabetSize ** i)) % this.alphabetSize;

        let newCharacterCode = first.charCodeAt(first.length - i - 1) + characterDiff + offset;

        // Reset the offset
        offset = 0;

        // Adjust if new character  is greater than 'Z'
        if (newCharacterCode > 'z'.charCodeAt(0)) {
          offset++;
          newCharacterCode -= this.alphabetSize;
        }

        newRank += String.fromCharCode(newCharacterCode);
      }

      // Reverse the rank characters
      newRank = newRank.split('').reverse().join('');
    }

    // Return
    return newRank;
  }

  // Return N new rank values for N items to be ranked between 'first' and 'second' ranks
  // This is not generating an optimized distribution of ranks
  getRanksBetween(first: string, second: string, number: number): string[] {
    const ret: string[] = [];
    let smaller: string = first;
    for (var i = 0; i < number; i++) {
      smaller = this.getRankBetween(smaller, second);
      ret.push(smaller);
    }
    return ret;
  }

  // Return N new rank values for N items to be ranked between 'first' and 'second' ranks
  // This method generates an optimized distribution of ranks
  getRanksBetweenOptimized(first: string, second: string, number: number): string[] {
    // Ensure that the first rank is lower than the second rank
    if (second < first)
      throw 'First rank must be lower than second rank';

    // Cannot request more rank values than the size of the alphabet
    // Split the problem with recursion
    if (number > this.alphabetSize) {
      // Find the middle rank
      const middleRank = this.getRankBetween(first, second);
      // Distribue the number of rank either side of the middle Rank
      const leftCount = Math.floor(number / 2);
      const rightCount = number - leftCount;
      // Compute the rank values for both ranges
      return [...this.getRanksBetweenOptimized(first, middleRank, leftCount), ... this.getRanksBetweenOptimized(middleRank, second, rightCount)];
    }

    // Normalize the sizes of the first and second ranks
    while (first.length != second.length) {
      if (first.length > second.length)
        second += 'A'
      else
        first += 'A'
    }

    // Extract character codes for each characters of the ranks
    const firstCodes = [...first].map(x => x.charCodeAt(0));
    const secondCodes = [...second].map(x => x.charCodeAt(0));

    // Compute difference between first and second
    // The difference is the number of character between first and second
    let difference = 0;

    for (var i = firstCodes.length - 1; i >= 0; i--) {
      let firstCode = firstCodes[i];
      let secondCode = secondCodes[i];

      // Adjust 
      if (secondCode < firstCode) {
        secondCode += this.alphabetSize;
        secondCodes[i - 1] -= 1;
      }

      // Increment difference
      difference += (secondCode - firstCode) * (this.alphabetSize ** (first.length - i - 1))
    }

    // Generate the new ranks
    const newRanks: string[] = [];

    if (difference <= number) {
      // Simply add the middle character from the alphabet to the first rank
      // TODO: Does not use well the available space in between first and second.
      newRanks.push(...Array(number).fill(null).map((x, i) => first + String.fromCharCode('A'.charCodeAt(0) + Math.floor(this.alphabetSize / (number + 1) * (i + 1)))));
    }
    else {
      // Distribute the difference over the number and add to the first rank
      difference = Math.floor(difference / (number + 1));

      for (var k = 0; k < number; k++) {
        // Intialize offet
        let offset = 0;

        // Initialize loop difference
        let diff = difference * (k + 1);

        // Initialize loop new Rank
        let newRank = '';

        for (var i = 0; i < firstCodes.length; i++) {
          const characterDiff = Math.floor(diff / (this.alphabetSize ** i)) % this.alphabetSize;

          let newCharacterCode = first.charCodeAt(first.length - i - 1) + characterDiff + offset;

          // Reset the offset
          offset = 0;

          // Adjust if new character  is greater than 'Z'
          if (newCharacterCode > 'z'.charCodeAt(0)) {
            offset++;
            newCharacterCode -= this.alphabetSize;
          }

          newRank += String.fromCharCode(newCharacterCode);
        }

        // Reverse the rank characters
        newRank = newRank.split('').reverse().join('');

        // Add the response
        newRanks.push(newRank);
      }


    }

    // Return
    return newRanks;
  }

  // Retrieve the max rank in a list of items
  findMaxRank(items: any[], rankProperty?: string): string {
    // Generate a default rankProperty if not provided
    rankProperty = rankProperty || 'rank';

    // Initialize the maxRank at the minimum possible value 
    let maxRank = this.getMinRank();

    // Traverse the list of items and update the max rank if greater than the currently stored maxRank
    for (var i = 0; i < items.length; i++) {
      if (items[i] && items[i][rankProperty] && items[i][rankProperty] > maxRank)
        maxRank = items[i][rankProperty];
    }

    // Return the max rank
    return maxRank;
  }

  // Retrieve the min rank in a list of items
  findMinRank(items: any[], rankProperty?: string): string {
    // Generate a default rankProperty if not provided
    rankProperty = rankProperty || 'rank';

    // Initialize the minRank at the maximum possible value 
    let minRank = this.getMaxRank();

    // Traverse the list of items and update the min rank if smaller than the currently stored minRank
    for (var i = 0; i < items.length; i++) {
      if (items[i] && items[i][rankProperty] && items[i][rankProperty] < minRank)
        minRank = items[i][rankProperty];
    }

    // Return the min rank
    return minRank;
  }

  // Sort an array of objects based on their ranks
  lexicalRankSorter(rankProperty: string = 'rank'): (a: any, b: any) => 1 | -1 | 0 {
    // Create sorter function
    const sorter = (a: any, b: any) => {
      if (!a[rankProperty]) return -1;
      if (!b[rankProperty]) return 1;
      return a[rankProperty] < b[rankProperty] ? -1 : (a[rankProperty] > b[rankProperty] ? 1 : 0);
    }
    return sorter;
  }
}
