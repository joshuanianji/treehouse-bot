import Link from 'next/link';
import { useRouter } from 'next/router'

interface Props {
    start: number;
    end: number;
    total: number;
    pageSize: number;
}

const Pagination: React.FC<Props> = ({ start, end, total, pageSize }) => {
    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.ceil((start - 1) / pageSize);

    console.log('Props:', { start, end, total, pageSize });

    const secondaryColor = 'bg-gray-100';
    return (
        <div className="flex flex-col items-center my-12">
            <div className='flex'>
                <div className={`h-12 w-12 mr-1 flex justify-center items-center rounded-full ${secondaryColor} cursor-pointer`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-left w-6 h-6">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </div>
                <div className={`flex h-12 font-medium rounded-full ${secondaryColor}`}>
                    {[...Array(totalPages).keys()].map((page) => (
                        <PageinationButton key={page} page={page} active={currentPage === page} pageSize={pageSize} />
                    ))}
                </div>
                <div className={`h-12 w-12 ml-1 flex justify-center items-center rounded-full ${secondaryColor} cursor-pointer`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-right w-6 h-6">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </div>
        </div>

    )
}

const PageinationButton: React.FC<{ page: number, active: boolean, pageSize: number }> = ({ page, active, pageSize }) => {
    const router = useRouter()
    console.log(router.pathname)

    const mainColor = 'bg-gray-800';

    return (
        <Link href={{
            pathname: `${router.pathname}`,
            query: { ...router.query, offset: `${page * pageSize}` },
        }}>
            <button className={`w-12 md:flex justify-center items-center 
        hidden cursor-pointer leading-5 transition duration-150 
        ease-in rounded-full ${active ? `${mainColor} text-white hover:bg-gray-700` : 'hover:bg-gray-200'}`}
            >
                {page + 1}
            </button >
        </Link>
    )
}

export default Pagination;