import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { DiscordUser, NFT } from "custom-types";
import { sequenceT } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import { bimap } from "fp-ts/lib/Tuple";
import * as E from "fp-ts/lib/Either";
import * as TE from 'fp-ts/TaskEither';
import { fetchAndDecode } from 'utils';

type Props = {
    nft: NFT;
    user: DiscordUser;
}

type Query = {
    nftId: string
}


export const getServerSideProps: GetServerSideProps<Props, Query> = async (context) => {
    const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
    const { nftId } = context.query;

    console.log(`Fetching NFT with id ${nftId}`);

    const result = await pipe(
        TE.bindTo('nft')(fetchAndDecode(`${endpoint}/nft?id=${nftId}`, NFT)),
        TE.bind('user', ({ nft }) => fetchAndDecode(`${endpoint}/user?id=${nft.ownedBy}`, DiscordUser)),
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

    console.log('Error fetching server side props!', result.left);
    throw new Error(JSON.stringify(result.left))
}

const ViewNFT: React.FC = () => {
    const router = useRouter();
    const { nftId } = router.query;

    return (
        <>
            <div className="w-full min-h-[25vh] grid place-items-center">
                <h1 className="text-4xl font-extrabold">NFT {nftId}</h1>
            </div>
        </>
    )

}


export default ViewNFT;