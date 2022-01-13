import React, { useEffect } from 'react';
import * as D from 'io-ts/Decoder';
import { pipe } from 'fp-ts/function';
import * as i from 'io-ts';
import * as E from 'fp-ts/Either';
import { useRouter } from 'next/router';
import { formatValidationErrors } from 'io-ts-reporters';
import * as TE from 'fp-ts/TaskEither';
import { string } from 'fp-ts';
import { DiscordUser, NFT, ServerError, fromDecodeError } from 'custom-types';
import { defaultAxiosErrorMap, fetchAndDecode, MapAxiosError } from 'utils';
import { GetServerSideProps } from 'next';
import { Range, RangeParser } from '@/lib/RangeParser';
import ViewError from '@/components/ViewError';
import NftCard from '@/components/NftCard';
import { UserNFTInfo } from 'custom-types/src/server';

// Props and Types

type Props = E.Either<ServerError, {
    range: Range;
    nfts: NFT[];
    user: DiscordUser;
}>

type Query = {
    nftid: string,
    // unparsed range
    // Note that range corresponds to the NFT numbers
    // e.g if range is 1-3, we'll retrieve NFTs 1, 2, and 3 (1-indexed? idk)
    range: string
}

const mapAxiosError: (item: string) => MapAxiosError = (item) => (err) => {
    console.log('Custom checkAxiosResponse for', item);
    if (err.response?.status === 404) {
        return {
            code: `404_NOT_FOUND`,
            title: `${item} not found!`,
            message: `Axios Code: ${err.code}`,
        };
    }
    return defaultAxiosErrorMap(err);
}

export const getServerSideProps: GetServerSideProps<Props, Query> = async (context) => {
    const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
    const { userid, range } = context.query;

    console.log(`Fetching User data with id ${userid}`);

    const result: Props = await pipe(
        RangeParser.decode(range),
        TE.fromEither,
        TE.mapLeft(fromDecodeError('range')),
        TE.bindTo('range'),
        TE.bind('nftRes', ({ range }) =>
            fetchAndDecode(
                `${endpoint}/nft/user?id=${userid}?start=${range.start}?end=${range.end}`,
                UserNFTInfo,
                mapAxiosError(`NFTS for user ${userid}`)
            )
        ),
        TE.bind('user', () =>
            fetchAndDecode(
                `${endpoint}/user?id=${userid}`,
                DiscordUser,
                mapAxiosError(`user data for user id ${userid}`)
            )
        ),
        TE.map(({ nftRes, user, range }) => ({ nfts: nftRes.nfts, user, range }))
    )();

    return {
        props: result
    };
}

// use a range query param
// ?range=start-end 
const ViewUserNFTs: React.FC<Props> = (props) => {
    return pipe(
        props,
        E.fold(
            (err) => <ViewError error={err} />,
            ({ nfts, user, range }) => <>
                <div className='w-full min-h-[25vh] grid place-items-center'>
                    <h1 className='text-4xl font-extrabold'>{user.username}'s NFTs</h1>
                    <p className='text-xl'>From #{range.start} to #{range.end}</p>
                </div>
                <div className='w-full grid place-items-center pb-8'>
                    {nfts.map((nft) => <NftCard key={nft.id} nft={nft} user={user} />)}
                </div>
            </>
        )
    )
}

export default ViewUserNFTs;
