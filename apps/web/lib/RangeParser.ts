import * as D from 'io-ts/Decoder';
import { pipe } from 'fp-ts/function';


// Range Parser
// used for parsing a range of values, esp. for pagination
// e.g. 5-10 => {start: 5, end: 10}

export type Range = {
    start: number;
    end: number;
};

// parses a range and reutrns a CORRECT range (start >= end, end - start <= 50)
export const RangeParser: D.Decoder<unknown, Range> = pipe(
    D.string,
    D.parse((s) => {
        const nums = s.split('-');
        return nums.length === 2 ? D.success(nums) : D.failure(s, 'a two-number range separated by dashes!');
    }),
    D.parse(([start, end]) => D.tuple(D.number, D.number).decode([parseInt(start, 10), parseInt(end, 10)])),
    D.parse(([start, end]) => {
        const a = [start, end]
        return start <= end ? D.success(a) : D.failure(a, 'a range that starts before it ends!')
    }),
    D.parse(([start, end]) => {
        const a = [start, end]
        return end - start < 50 ? D.success(a) : D.failure(a, 'a range that is less than 50!')
    }),
    D.map(([start, end]) => ({ start, end })),
)
