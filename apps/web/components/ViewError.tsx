import { server } from 'custom-types';

const ViewError: React.FC<{ error: server.ServerError }> = ({ error }) => {
    return (
        <div className='w-full min-h-[25vh] grid place-items-center'>
            <h1 className='text-4xl'>Error! <code>{error.code}</code></h1>
            <p className='text-lg text-grey-700'>{error.title}</p>
            {error.message && <code>{error.message}</code>}
            {error.details && <code>{JSON.stringify(error.details, null, 4)}</code>}
        </div>
    );
}

export default ViewError;
