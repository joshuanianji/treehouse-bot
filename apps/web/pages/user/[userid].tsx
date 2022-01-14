import React from 'react';
import * as D from 'io-ts/Decoder';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { DiscordUser, NFT, ServerError, fromDecodeError } from 'custom-types';
import { defaultAxiosErrorMap, fetchAndDecode, MapAxiosError } from 'utils';
import { GetServerSideProps } from 'next';
import ViewError from '@/components/ViewError';
import NftCard from '@/components/NftCard';
import { UserNFTInfo } from 'custom-types/src/server';
import Pagination from '@/components/Pagination';

// Props and Types

type Props = E.Either<ServerError, {
    offset: number;
    nftInfo: UserNFTInfo;
    user: DiscordUser;
}>

type Query = {
    userid: string,
    // unparsed range
    // Note that range corresponds to the NFT numbers
    // e.g if range is 1-3, we'll retrieve NFTs 1, 2, and 3 (1-indexed? idk)
    offset: string
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
    const { userid, offset } = context.query;

    let actualOffset = offset || '0'; // default to 0 offset (most recent NFTs)

    console.log(`Fetching User data with id ${userid}`);

    const result: Props = await pipe(
        D.string.decode(actualOffset),
        E.chain(offset => D.number.decode(parseInt(offset, 10))), // so CHAIN is bind (>>=)
        TE.fromEither,
        TE.mapLeft(fromDecodeError('offset')),
        TE.bindTo('offset'),
        TE.bind('nftRes', ({ offset }) =>
            fetchAndDecode(
                `${endpoint}/nft/user?id=${userid}&offset=${offset}&pageSize=10`, // hardcoding page sizes rn
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
        TE.map(({ nftRes, user, offset }) => ({ nftInfo: nftRes, user, offset }))
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
            ({ nftInfo, user, offset }) => <ViewContent nftInfo={nftInfo} user={user} offset={offset} />
        )
    )
}

const ViewContent: React.FC<{ nftInfo: UserNFTInfo, user: DiscordUser, offset: number }> = ({ nftInfo, user, offset }) => {
    const start = offset + 1;
    const end = Math.min(offset + 25, offset + nftInfo.numReturned);

    return (
        <>
            <div className='w-full min-h-[25vh] grid place-items-center'>
                <h1 className='text-4xl font-extrabold'>{user.username}'s NFTs</h1>
                <h2 className='text-2xl font-extrabold'>{nftInfo.count} total NFTs</h2>
                <p className='text-xl'>Displaying NFTs #{start} through #{end}</p>
            </div>
            <div className='w-full xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 grid place-items-center gap-8 p-8'>
                {nftInfo.nfts.map((nft) => <NftCard key={nft.id} nft={nft} user={user} linkable={true} />)}
            </div>
            <Pagination />
        </>
    )
}

export default ViewUserNFTs;
