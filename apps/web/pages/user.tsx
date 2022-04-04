import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import Spinner from '@/components/Spinner';


const NFTs: React.FC = () => {
    const [userID, setUserID] = useState('');
    const [linkValid, setLinkValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setLinkValid(userID.length === 18)
    }, [userID])

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            if (linkValid) {
                setLinkValid(false);
                setLoading(true);
                router.push(`/user/${userID}`);
            }
        }
    }


    return (
        <>
            <div className="w-full min-h-[50vh] grid place-items-center">
                <h1 className="text-4xl font-extrabold">Users</h1>
                <p className="text-2xl font-bold text-gray-700">Get User info from ID</p>
            </div>

            <div className="flex flex-col space-y-12 w-full items-center">
                <div className="flex flex-row space-x-8 justify-center items-center w-[70vh]">
                    <input
                        type="text"
                        name="image text"
                        id="img-input"
                        className="focus:ring-indigo-500 focus:border-indigo-500 inline px-6 py-4 bg-gray-100 rounded-md flex-auto"
                        placeholder="18 Digit ID Here"
                        value={userID}
                        onKeyDown={onKeyDown}
                        onChange={(e) => setUserID(e.target.value)}
                    />
                    <a
                        className={'bg-indigo-500 hover:bg-indigo-700 text-white font-bold px-6 py-4 rounded-md flex align-middle gap-2'
                            + (linkValid ? '' : ' cursor-not-allowed opacity-50')}
                        href={linkValid ? `/user/${userID}` : ''}
                        onClick={() => setLoading(true)}
                    >
                        <span className='flex items-center'>Go to User Page</span>{loading && <Spinner />}
                    </a>
                </div>
            </div>
        </>
    )
}

export default NFTs;