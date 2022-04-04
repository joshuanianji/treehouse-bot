import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'


const NFTs: React.FC = () => {
    const [nftID, setNftId] = useState('');
    const [linkValid, setLinkValid] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setLinkValid(nftID.length === 10)
    }, [nftID])

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            if (linkValid) {
                setLinkValid(false);
                router.push(`/nft/${nftID}`)
            }
        }
    }


    return (
        <>
            <div className="w-full min-h-[50vh] grid place-items-center">
                <h1 className="text-4xl font-extrabold">NFTs</h1>
                <p className="text-2xl font-bold text-gray-700">Get the info for an NFT</p>
            </div>

            <div className="flex flex-col space-y-12 w-full items-center">
                <div className="flex flex-row space-x-8 justify-center items-center w-[70vh]">
                    <input
                        type="text"
                        name="image text"
                        id="img-input"
                        className="focus:ring-indigo-500 focus:border-indigo-500 inline px-6 py-4 bg-gray-100 rounded-md flex-auto"
                        placeholder="10 Digit ID Here"
                        value={nftID}
                        onKeyDown={onKeyDown}
                        onChange={(e) => setNftId(e.target.value)}
                    />
                    <a
                        className={'bg-indigo-500 hover:bg-indigo-700 text-white font-bold px-6 py-4 rounded-md inline flex-none'
                            + (linkValid ? '' : ' cursor-not-allowed opacity-50')}
                        href={linkValid ? `/nft/${nftID}` : ''}
                    >
                        Go to NFT
                    </a>
                </div>
            </div>
        </>
    )
}

export default NFTs;