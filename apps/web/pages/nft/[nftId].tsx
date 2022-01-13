import { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

export const getServerSideProps: GetServerSideProps = async () => {
    console.log(process.env.NEXT_PUBLIC_API_ENDPOINT);
    return {
        props: {
            apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT,
        }
    }
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