import { DiscordUser, getMsgLink, NFT, NFTType } from 'custom-types';
import { format } from 'date-fns';
import { useState } from 'react';
import { truncate } from 'utils';

interface Props {
    nft: NFT;
    user: DiscordUser;
    // if the card should link to the card. This also means the card is in the front page, and should show less data
    linkable?: boolean;
}

const NftCard: React.FC<Props> = ({ nft, user, linkable }) => {
    const useLinkableFunctionality = linkable || false;
    return (
        <div className="rounded overflow-hidden shadow-xl">
            <NFTMainContent nftType={nft.type} linkable={useLinkableFunctionality} />
            <div className="px-6 py-4">
                {useLinkableFunctionality ?
                    <a className="font-bold text-xl mb-2 text-blue-900 hover:text-blue-500" href={`/nft/${nft.id}`}>
                        NFT #{nft.id} owned by {user.username}
                    </a> :
                    <div className="font-bold text-xl mb-2">
                        NFT #{nft.id} owned by {user.username}
                    </div>
                }
                <p className="text-gray-800 text-base">
                    Created: {format(new Date(nft.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
                <p className="text-gray-800 text-base">
                    Type: {nft.type._type}
                </p>
                <ViewMsgLink nft={nft} />
            </div>
        </div >
    )
}

const ViewMsgLink: React.FC<{ nft: NFT }> = ({ nft }) => {
    const msgLink = getMsgLink(nft);

    switch (msgLink._tag) {
        case 'None':
            return null;

        case 'Some':
            return (
                <a
                    href={msgLink.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                >
                    Message link
                </a>
            )
    }
}

// if it's linkable, do NOT do the expansion functionality
const NFTMainContent: React.FC<{ nftType: NFTType, linkable: boolean }> = ({ nftType, linkable }) => {
    const [expanded, setExpanded] = useState(false);

    const imgWrapperClasses = `w-full ${expanded ? '' : 'aspect-square'} overflow-hidden bg-center`;
    const nftImageClasses = `w-full object-cover ${linkable ? '' : 'cursor-pointer'}`;
    const nftTextClasses = `text-gray-500 text-lg px-2 border-l-4 border-gray-300 rounded-sm ${linkable ? 'text-ellipsis overflow-hidden cursor-pointer' : ''}`;
    const nftTextWrapperClasses = `px-6 py-4 place-content-center`;
    switch (nftType._type) {
        case 'asset':
            return (
                <div className={imgWrapperClasses}>
                    {(nftType.contentType === 'video/mp4')
                        ? <video className={nftImageClasses} src={nftType.url} controls />
                        : <img className={nftImageClasses}
                            src={nftType.url} alt='NFT Asset'
                            onClick={() => setExpanded(linkable ? false : !expanded)} />
                    }
                </div>
            )

        case 'sticker':
            return (
                <div className={imgWrapperClasses}>
                    <img className={nftImageClasses} src={nftType.url} alt="NFT sticker" />
                </div>
            )
        case 'text':
            // at *around* 450 characters, the text gets a bit too long. We then truncate it.
            // obviously this depends on the font and which letters we use, but I coudln't think of a good CSS solution
            const truncated = truncate(nftType.content, 450)
            return (
                <div className={nftTextWrapperClasses}>
                    <p className={nftTextClasses}
                        onClick={() => setExpanded(linkable ? false : !expanded)}>
                        {expanded ? nftType.content : truncated.str}
                    </p>
                </div>
            )
    }
}

export default NftCard;