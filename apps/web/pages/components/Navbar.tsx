import React from 'react';
import { useRouter } from 'next/router'


const Navbar: React.FC = () => {
    const router = useRouter();
    const currPage = router.pathname;

    const navItems = [
        { title: "Home", link: "/" },
        { title: "NFTs", link: "/nfts" },
    ];

    return (
        <nav className="bg-gray-800">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    <MainMenuButtons />
                    <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex-shrink-0 flex items-center">
                            <img className="block h-8 w-auto" src="/squat.png" alt="Workflow" />
                        </div>
                        <div className="hidden sm:block sm:ml-6">
                            <div className="flex space-x-4">
                                {navItems.map(navItem => (
                                    <a
                                        href={navItem.link}
                                        className={'px-3 py-2 rounded-md text-sm font-medium ' +
                                            (currPage === navItem.link
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            )}
                                        key={navItem.title}
                                        aria-current="page">
                                        {navItem.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state. */}
            <div className="sm:hidden" id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    {navItems.map(navItem => (
                        <a
                            href={navItem.link}
                            key={navItem.title}
                            className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium"
                            aria-current="page">{navItem.title}</a
                        >
                    ))}
                </div>
            </div>
        </nav >
    )

}

const MainMenuButtons: React.FC = () => (
    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
        <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-controls="mobile-menu"
            aria-expanded="false"
        >
            <span className="sr-only">Open main menu</span>
            <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                />
            </svg>
            <svg
                className="hidden h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        </button>
    </div>
)

export default Navbar;