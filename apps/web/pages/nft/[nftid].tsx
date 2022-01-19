import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { DiscordUser, NFT, ServerError } from 'custom-types';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/TaskEither';
import NftCard from '@/components/NftCard';
import { fetchAndDecode, MapAxiosError, defaultAxiosErrorMap } from 'utils';
import ViewError from '@/components/ViewError';

type Props = E.Either<ServerError, {
    nft: NFT;
    user: DiscordUser;
}>

type Query = {
    nftid: string
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
    const { nftid } = context.query;

    console.log(`Fetching NFT with id ${nftid}`);

    const result = await pipe(
        TE.bindTo('nft')(
            fetchAndDecode(
                `${endpoint}/nft?id=${nftid}`,
                NFT,
                mapAxiosError(`NFT ${nftid}`)
            )
        ),
        TE.bind('user', ({ nft }) =>
            fetchAndDecode(
                `${endpoint}/user?id=${nft.ownedBy}`,
                DiscordUser,
                mapAxiosError(`Discord User ${nft.ownedBy}`)
            )
        ),
        // any post processing of the result
        // right now I do nothing lol
        TE.map(({ nft, user }) => ({
            nft, user
        }))
    )();

    return {
        props: result
    };
}



const ViewNFT: React.FC<Props> = (props) => {
    const router = useRouter();
    const { nftid } = router.query;

    return pipe(
        props,
        E.fold(
            (err) => <ViewError error={err} />,
            ({ nft, user }) => <>
                <div className='w-full min-h-[25vh] grid place-items-center'>
                    <h1 className='text-4xl font-extrabold'>NFT {nftid}</h1>
                </div>
                <div className='w-full grid place-items-center pb-8'>
                    {/* wrapper around NFT Card */}
                    <div className='sm:w-2/3 md:w-2/5'>
                        <NftCard user={user} nft={nft} />
                    </div>
                </div>
            </>
        )
    )
}


export default ViewNFT;