import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { DiscordUser, NFT } from "custom-types";
import { sequenceT } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import { bimap } from "fp-ts/lib/Tuple";
import * as E from "fp-ts/lib/Either";
import * as TE from 'fp-ts/TaskEither';
import { fetchAndDecode, MapAxiosError, defaultAxiosErrorMap } from 'utils';
import NftCard from './../components/NftCard';
import { AxiosError } from "axios";

type Props = {
    nft: NFT;
    user: DiscordUser;
}

type Query = {
    nftId: string
}

const mapAxiosError: (item: string) => MapAxiosError = (item) => (err) => {
    console.log('Custom checkAxiosResponse for', item);
    if (err.response?.status === 404) {
        return {
            code: `404_NOT_FOUND`,
            title: `${item} not found`,
            message: `Axios Code: ${err.code}`,
        };
    }
    return defaultAxiosErrorMap(err);
}

export const getServerSideProps: GetServerSideProps<Props, Query> = async (context) => {
    const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
    const { nftId } = context.query;

    console.log(`Fetching NFT with id ${nftId}`);

    const result = await pipe(
        TE.bindTo('nft')(fetchAndDecode(`${endpoint}/nft?id=${nftId}`, NFT, mapAxiosError(`NFT ${nftId}`))),
        TE.bind('user', ({ nft }) =>
            fetchAndDecode(`${endpoint}/user?id=${nft.ownedBy}`, DiscordUser, mapAxiosError(`Discord User ${nft.ownedBy}`))),
        TE.map(({ nft, user }) => ({
            props: {
                apiEndpoint: endpoint,
                nft, user
            }
        }))
    )();

    if (result._tag === 'Right') {
        return result.right
    }

    if (result.left.code === '404_NOT_FOUND') {
        return {
            notFound: true
        }
    }

    console.log('Error fetching server side props!', result.left);
    throw new Error(JSON.stringify(result.left))
}

const ViewNFT: React.FC<Props> = ({ nft, user }) => {
    const router = useRouter();
    const { nftId } = router.query;

    return (
        <>
            <div className="w-full min-h-[25vh] grid place-items-center">
                <h1 className="text-4xl font-extrabold">NFT {nftId}</h1>
            </div>
            <div className="w-full grid place-items-center pb-8">
                {/* wrapper around NFT Card */}
                <div className="sm:w-2/3 md:w-2/5">
                    <NftCard user={user} nft={nft} />
                </div>
            </div>
        </>
    )

}


export default ViewNFT;