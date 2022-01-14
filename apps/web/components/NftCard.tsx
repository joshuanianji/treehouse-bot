import { DiscordUser, getMsgLink, NFT, NFTType } from 'custom-types';
import { format } from 'date-fns';

interface Props {
    nft: NFT;
    user: DiscordUser;
    linkable: boolean; // if the card should link to the card
}

const NftCard: React.FC<Props> = ({ nft, user }) => {
    return (
        <div className="rounded overflow-hidden shadow-lg">
            <NFTMainContent nftType={nft.type} />
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">
                    NFT #{nft.id} owned by {user.username}
                </div>
                <p className="text-gray-800 text-base">
                    Created: {format(new Date(nft.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
                <p className="text-gray-800 text-base">
                    Type: {nft.type._type}
                </p>
                <ViewMsgLink nft={nft} />
            </div>
        </div>
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

const NFTMainContent: React.FC<{ nftType: NFTType }> = ({ nftType }) => {
    const imgWrapperClasses = `w-full aspect-square overflow-hidden bg-center`;
    const nftImageClasses = `w-full object-cover`;
    const nftTextClasses = `text-gray-500 text-lg px-2 border-l-4 border-gray-300 rounded-sm`;
    const nftTextWrapperClasses = `px-6 py-4`;
    switch (nftType._type) {
        case 'asset':
            return (
                <div className={imgWrapperClasses}>
                    {(nftType.contentType === 'video/mp4')
                        ? <video className={nftImageClasses} src={nftType.url} controls />
                        : <img className={nftImageClasses} src={nftType.url} alt='NFT Asset' />
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
            return (
                <div className={nftTextWrapperClasses}>
                    <p className={nftTextClasses}>
                        {nftType.content}
                    </p>
                </div>
            )
    }
}

export default NftCard;